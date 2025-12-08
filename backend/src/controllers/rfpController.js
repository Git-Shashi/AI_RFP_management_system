const prisma = require('../config/database');
const { parseRFPFromText } = require('../services/aiService');
const { sendRFPEmail } = require('../services/emailSender');

// Create RFP from natural language
const createRFP = async (req, res) => {
  try {
    const { userInput } = req.body;

    if (!userInput) {
      return res.status(400).json({ error: 'User input is required' });
    }

    console.log('Parsing RFP from user input...');

    // Parse natural language into structured RFP
    const parsedRFP = await parseRFPFromText(userInput);

    // Create RFP in database
    const rfp = await prisma.rFP.create({
      data: {
        title: parsedRFP.title,
        description: parsedRFP.description,
        budget: parsedRFP.budget,
        deadline: new Date(parsedRFP.deadline),
        requirements: parsedRFP.requirements,
        paymentTerms: parsedRFP.paymentTerms,
        warrantyPeriod: parsedRFP.warrantyPeriod,
        status: 'draft',
      },
    });

    res.status(201).json({ success: true, rfp });
  } catch (error) {
    console.error('Error creating RFP:', error);
    res.status(500).json({ error: 'Failed to create RFP', details: error.message });
  }
};

// Get all RFPs
const getAllRFPs = async (req, res) => {
  try {
    const rfps = await prisma.rFP.findMany({
      include: {
        rfpVendors: {
          include: {
            vendor: true,
          },
        },
        proposals: {
          include: {
            vendor: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ success: true, rfps });
  } catch (error) {
    console.error('Error fetching RFPs:', error);
    res.status(500).json({ error: 'Failed to fetch RFPs' });
  }
};

// Get single RFP by ID
const getRFPById = async (req, res) => {
  try {
    const { id } = req.params;

    const rfp = await prisma.rFP.findUnique({
      where: { id },
      include: {
        rfpVendors: {
          include: {
            vendor: true,
          },
        },
        proposals: {
          include: {
            vendor: true,
          },
        },
      },
    });

    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    res.json({ success: true, rfp });
  } catch (error) {
    console.error('Error fetching RFP:', error);
    res.status(500).json({ error: 'Failed to fetch RFP' });
  }
};

// Update RFP
const updateRFP = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert deadline to Date if provided
    if (updateData.deadline) {
      updateData.deadline = new Date(updateData.deadline);
    }

    const rfp = await prisma.rFP.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, rfp });
  } catch (error) {
    console.error('Error updating RFP:', error);
    res.status(500).json({ error: 'Failed to update RFP' });
  }
};

// Delete RFP
const deleteRFP = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.rFP.delete({
      where: { id },
    });

    res.json({ success: true, message: 'RFP deleted successfully' });
  } catch (error) {
    console.error('Error deleting RFP:', error);
    res.status(500).json({ error: 'Failed to delete RFP' });
  }
};

// Send RFP to selected vendors
const sendRFPToVendors = async (req, res) => {
  try {
    const { id } = req.params;
    const { vendorIds } = req.body;

    if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({ error: 'Vendor IDs are required' });
    }

    // Get RFP
    const rfp = await prisma.rFP.findUnique({
      where: { id },
    });

    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    // Get vendors
    const vendors = await prisma.vendor.findMany({
      where: {
        id: { in: vendorIds },
      },
    });

    if (vendors.length === 0) {
      return res.status(404).json({ error: 'No vendors found' });
    }

    // Send emails
    const emailResults = await sendRFPEmail(rfp, vendors);

    // Create RFPVendor records for successful sends
    for (const result of emailResults) {
      if (result.success) {
        await prisma.rFPVendor.upsert({
          where: {
            rfpId_vendorId: {
              rfpId: id,
              vendorId: result.vendorId,
            },
          },
          create: {
            rfpId: id,
            vendorId: result.vendorId,
            emailStatus: 'sent',
          },
          update: {
            sentAt: new Date(),
            emailStatus: 'sent',
          },
        });
      }
    }

    // Update RFP status to 'sent'
    await prisma.rFP.update({
      where: { id },
      data: { status: 'sent' },
    });

    res.json({
      success: true,
      message: 'RFP sent to vendors',
      results: emailResults,
    });
  } catch (error) {
    console.error('Error sending RFP:', error);
    res.status(500).json({ error: 'Failed to send RFP', details: error.message });
  }
};

module.exports = {
  createRFP,
  getAllRFPs,
  getRFPById,
  updateRFP,
  deleteRFP,
  sendRFPToVendors,
};
