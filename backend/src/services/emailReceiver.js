const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const { emailConfig } = require('../config/email');
const prisma = require('../config/database');
const { parseVendorProposal, generateProposalSummary } = require('./aiService');

let isPolling = false;
let pollInterval = null;

// Configure IMAP connection
const imapConfig = {
  imap: {
    user: emailConfig.user,
    password: emailConfig.password,
    host: emailConfig.imap.host,
    port: emailConfig.imap.port,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 10000,
  },
};

// Extract RFP ID from email subject
function extractRFPId(subject) {
  const match = subject.match(/\[RFP-([a-f0-9-]+)\]/i);
  return match ? match[1] : null;
}

// Process a single email
async function processEmail(connection, message) {
  try {
    const parts = message.parts.filter((part) => part.which === 'TEXT');
    if (parts.length === 0) return;

    const part = parts[0];
    const body = await connection.getPartData(message, part);
    const parsed = await simpleParser(body);

    const subject = parsed.subject || '';
    const from = parsed.from?.value[0]?.address || '';
    const text = parsed.text || '';

    console.log(`\n📧 New email from: ${from}`);
    console.log(`Subject: ${subject}`);

    // Extract RFP ID from subject
    const rfpId = extractRFPId(subject);
    if (!rfpId) {
      console.log('❌ No RFP ID found in subject, skipping...');
      return;
    }

    console.log(`✅ Found RFP ID: ${rfpId}`);

    // Find the RFP
    const rfp = await prisma.rFP.findUnique({
      where: { id: rfpId },
      include: { rfpVendors: true },
    });

    if (!rfp) {
      console.log(`❌ RFP not found: ${rfpId}`);
      return;
    }

    // Find the vendor by email
    const vendor = await prisma.vendor.findUnique({
      where: { email: from },
    });

    if (!vendor) {
      console.log(`❌ Vendor not found with email: ${from}`);
      return;
    }

    // Check if proposal already exists
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        rfpId: rfpId,
        vendorId: vendor.id,
      },
    });

    if (existingProposal) {
      console.log(`⚠️ Proposal already exists for this vendor and RFP`);
      return;
    }

    console.log(`🤖 Parsing proposal with AI...`);

    // Parse the email content with AI
    const parsedData = await parseVendorProposal(text, {
      title: rfp.title,
      description: rfp.description,
      budget: rfp.budget,
      requirements: rfp.requirements,
    });

    console.log('📊 Parsed data:', JSON.stringify(parsedData, null, 2));

    // Create the proposal
    const proposal = await prisma.proposal.create({
      data: {
        rfpId: rfpId,
        vendorId: vendor.id,
        rawEmailContent: text,
        parsedData: parsedData,
        totalPrice: parsedData.totalPrice,
        deliveryTime: parsedData.deliveryTime,
        terms: parsedData.terms,
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
        },
      });

      console.log(`📝 AI Summary generated with score: ${summary.score}`);
    } catch (error) {
      console.error('Error generating summary:', error);
    }

    // Mark email as seen
    await connection.addFlags(message.attributes.uid, ['\\Seen']);
  } catch (error) {
    console.error('Error processing email:', error);
  }
}

// Poll inbox for new emails
async function pollInbox() {
  if (isPolling) {
    console.log('⏭️ Already polling, skipping...');
    return;
  }

  isPolling = true;

  try {
    console.log('📬 Checking for new emails...');

    const connection = await imaps.connect(imapConfig);
    await connection.openBox('INBOX');

    // Search for unseen emails
    const searchCriteria = ['UNSEEN'];
    const fetchOptions = {
      bodies: ['HEADER', 'TEXT'],
      markSeen: false,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    if (messages.length === 0) {
      console.log('📭 No new emails');
    } else {
      console.log(`📬 Found ${messages.length} new email(s)`);

      for (const message of messages) {
        await processEmail(connection, message);
      }
    }

    connection.end();
  } catch (error) {
    console.error('❌ Error polling inbox:', error.message);
  } finally {
    isPolling = false;
  }
}

// Start email polling
function startEmailPolling(intervalMs = 30000) {
  if (pollInterval) {
    console.log('Email polling already started');
    return;
  }

  console.log(`🚀 Starting email polling (every ${intervalMs / 1000}s)`);
  
  // Poll immediately
  pollInbox();
  
  // Then poll at intervals
  pollInterval = setInterval(pollInbox, intervalMs);
}

// Stop email polling
function stopEmailPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
    console.log('Email polling stopped');
  }
}

module.exports = {
  startEmailPolling,
  stopEmailPolling,
  pollInbox,
};
