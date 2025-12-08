const express = require('express');
const {
  getProposalsByRFP,
  getProposalById,
  compareRFPProposals,
  updateProposal,
  deleteProposal,
  getAllProposals,
} = require('../controllers/proposalController');
const prisma = require('../config/database');
const { parseVendorProposal, generateProposalSummary } = require('../services/aiService');

const router = express.Router();

router.get('/', getAllProposals);
router.get('/rfp/:rfpId', getProposalsByRFP);
router.get('/rfp/:rfpId/compare', compareRFPProposals);
router.get('/:id', getProposalById);
router.put('/:id', updateProposal);
router.delete('/:id', deleteProposal);

// Manual proposal submission endpoint
router.post('/submit', async (req, res) => {
  try {
    const { rfpId, vendorEmail, proposalText } = req.body;

    if (!rfpId || !vendorEmail || !proposalText) {
      return res.status(400).json({ 
        error: 'Missing required fields: rfpId, vendorEmail, proposalText' 
      });
    }

    console.log(`\n📧 Processing manual proposal submission`);
    console.log(`RFP ID: ${rfpId}`);
    console.log(`Vendor: ${vendorEmail}`);

    // Find the RFP
    const rfp = await prisma.rFP.findUnique({
      where: { id: rfpId },
    });

    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    // Find the vendor by email
    const vendor = await prisma.vendor.findUnique({
      where: { email: vendorEmail },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found with this email' });
    }

    // Check if proposal already exists
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        rfpId: rfpId,
        vendorId: vendor.id,
      },
    });

    if (existingProposal) {
      return res.status(409).json({ 
        error: 'Proposal already exists for this vendor and RFP',
        proposalId: existingProposal.id 
      });
    }

    console.log(`🤖 Parsing proposal with AI...`);

    // Parse the proposal content with AI
    const parsedData = await parseVendorProposal(proposalText, {
      title: rfp.title,
      description: rfp.description,
      budget: rfp.budget,
      requirements: rfp.requirements,
    });

    // Create the proposal
    const proposal = await prisma.proposal.create({
      data: {
        rfpId: rfpId,
        vendorId: vendor.id,
        rawEmailContent: proposalText,
        parsedData: parsedData,
        totalPrice: parsedData.totalPrice || null,
        deliveryTime: parsedData.deliveryTime || null,
        terms: parsedData.terms || null,
        status: 'received',
      },
    });

    console.log(`✅ Proposal created: ${proposal.id}`);

    // Generate AI summary and score
    try {
      const summary = await generateProposalSummary(
        {
          totalPrice: parsedData.totalPrice,
          deliveryTime: parsedData.deliveryTime,
          parsedData: parsedData,
        },
        rfp
      );

      await prisma.proposal.update({
        where: { id: proposal.id },
        data: {
          score: summary.score,
          aiSummary: summary.summary,
          aiRecommendation: summary.recommendation || null,
        },
      });

      return res.json({
        success: true,
        message: 'Proposal processed and stored successfully',
        proposal: {
          id: proposal.id,
          vendor: vendor.name,
          totalPrice: parsedData.totalPrice,
          deliveryTime: parsedData.deliveryTime,
          score: summary.score,
          aiSummary: summary.summary,
        },
      });
    } catch (error) {
      console.error('Error generating AI summary:', error);
      
      return res.json({
        success: true,
        message: 'Proposal stored but AI analysis failed',
        proposal: {
          id: proposal.id,
          vendor: vendor.name,
          totalPrice: parsedData.totalPrice,
          deliveryTime: parsedData.deliveryTime,
        },
        warning: 'AI summary generation failed',
      });
    }
  } catch (error) {
    console.error('Error processing proposal:', error);
    res.status(500).json({ 
      error: 'Failed to process proposal',
      details: error.message 
    });
  }
});

// Manually trigger email polling
router.post('/poll-emails', async (req, res) => {
  try {
    const { pollInbox } = require('../services/emailReceiver');
    
    console.log('📧 Manually triggering email poll...');
    await pollInbox();
    
    res.json({
      success: true,
      message: 'Email polling triggered. Check server logs for results.',
    });
  } catch (error) {
    console.error('Error polling emails:', error);
    res.status(500).json({ 
      error: 'Failed to poll emails',
      details: error.message 
    });
  }
});

module.exports = router;
