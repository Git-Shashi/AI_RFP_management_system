#!/usr/bin/env node

/**
 * Test script to submit a proposal manually
 * Usage: node testProposal.js <rfpId> <vendorEmail>
 */

const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function submitProposal(rfpId, vendorEmail) {
  const sampleProposal = `
Dear Procurement Team,

Thank you for the opportunity to submit our proposal for ${rfpId}.

We are pleased to offer the following:

Equipment Proposal:
- 20 High-Performance Laptops with 16GB RAM and 512GB SSD: $23,500
- 15 Professional 27-inch 4K Monitors: $6,800

Total Price: $30,300
Delivery Timeline: 18 days from order confirmation
Warranty: 2 years comprehensive coverage including parts and labor
Payment Terms: Net 30 days

Additional Benefits:
- Free on-site installation and setup
- 24/7 technical support
- 90-day money-back guarantee

We look forward to working with you.

Best regards,
Sales Team
  `.trim();

  try {
    console.log('\n🚀 Submitting proposal...');
    console.log(`RFP ID: ${rfpId}`);
    console.log(`Vendor: ${vendorEmail}\n`);

    const response = await axios.post(`${API_URL}/proposals/submit`, {
      rfpId,
      vendorEmail,
      proposalText: sampleProposal,
    });

    console.log('✅ Success!');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Get RFP list
async function listRFPs() {
  try {
    const response = await axios.get(`${API_URL}/rfps`);
    console.log('\n📋 Available RFPs:');
    response.data.rfps.forEach(rfp => {
      console.log(`\n  ID: ${rfp.id}`);
      console.log(`  Title: ${rfp.title}`);
      console.log(`  Budget: $${rfp.budget}`);
      console.log(`  Status: ${rfp.status}`);
    });
  } catch (error) {
    console.error('❌ Error fetching RFPs:', error.message);
  }
}

// Get vendor list
async function listVendors() {
  try {
    const response = await axios.get(`${API_URL}/vendors`);
    console.log('\n👥 Available Vendors:');
    response.data.vendors.forEach(vendor => {
      console.log(`\n  Name: ${vendor.name}`);
      console.log(`  Email: ${vendor.email}`);
      console.log(`  Category: ${vendor.category}`);
    });
  } catch (error) {
    console.error('❌ Error fetching vendors:', error.message);
  }
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('\n📚 RFP Proposal Submission Test Tool\n');
  console.log('Usage:');
  console.log('  node testProposal.js list                    - List RFPs and Vendors');
  console.log('  node testProposal.js <rfpId> <vendorEmail>   - Submit a test proposal\n');
  console.log('Examples:');
  console.log('  node testProposal.js list');
  console.log('  node testProposal.js abc-123-def techsupply@example.com\n');
  process.exit(0);
}

if (args[0] === 'list') {
  (async () => {
    await listRFPs();
    await listVendors();
    console.log('\n');
  })();
} else if (args.length === 2) {
  submitProposal(args[0], args[1]);
} else {
  console.error('❌ Invalid arguments. Use: node testProposal.js <rfpId> <vendorEmail>');
  process.exit(1);
}
