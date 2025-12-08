const prisma = require('../config/database');
const { compareProposals } = require('../services/aiService');

// Get all proposals for an RFP
const getProposalsByRFP = async (req, res) => {
  try {
    const { rfpId } = req.params;

    const proposals = await prisma.proposal.findMany({
      where: { rfpId },
      include: {
        vendor: true,
        rfp: true,
      },
      orderBy: {
        receivedAt: 'desc',
      },
    });

    res.json({ success: true, proposals });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
};

// Get single proposal by ID
const getProposalById = async (req, res) => {
  try {
    const { id } = req.params;

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        vendor: true,
        rfp: true,
      },
    });

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    res.json({ success: true, proposal });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ error: 'Failed to fetch proposal' });
  }
};

// Compare proposals for an RFP with AI
const compareRFPProposals = async (req, res) => {
  try {
    const { rfpId } = req.params;

    // Get RFP
    const rfp = await prisma.rFP.findUnique({
      where: { id: rfpId },
    });

    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    // Get all proposals for this RFP
    const proposals = await prisma.proposal.findMany({
      where: { rfpId },
      include: {
        vendor: true,
      },
    });

    if (proposals.length === 0) {
      return res.status(404).json({ error: 'No proposals found for this RFP' });
    }

    console.log(`Comparing ${proposals.length} proposals for RFP: ${rfp.title}`);

    // Use AI to compare proposals
    const comparison = await compareProposals(rfp, proposals);

    res.json({
      success: true,
      comparison,
      proposalCount: proposals.length,
    });
  } catch (error) {
    console.error('Error comparing proposals:', error);
    res.status(500).json({ error: 'Failed to compare proposals', details: error.message });
  }
};

// Update proposal status
const updateProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const proposal = await prisma.proposal.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, proposal });
  } catch (error) {
    console.error('Error updating proposal:', error);
    res.status(500).json({ error: 'Failed to update proposal' });
  }
};

// Delete proposal
const deleteProposal = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.proposal.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Proposal deleted successfully' });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    res.status(500).json({ error: 'Failed to delete proposal' });
  }
};

// Get all proposals (across all RFPs)
const getAllProposals = async (req, res) => {
  try {
    const proposals = await prisma.proposal.findMany({
      include: {
        vendor: true,
        rfp: true,
      },
      orderBy: {
        receivedAt: 'desc',
      },
    });

    res.json({ success: true, proposals });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
};

module.exports = {
  getProposalsByRFP,
  getProposalById,
  compareRFPProposals,
  updateProposal,
  deleteProposal,
  getAllProposals,
};
