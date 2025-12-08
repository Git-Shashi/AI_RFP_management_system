const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create vendors
  const vendor1 = await prisma.vendor.upsert({
    where: { email: 'techsupply@example.com' },
    update: {},
    create: {
      name: 'Tech Supply Co.',
      email: 'techsupply@example.com',
      category: 'Electronics',
      contactPerson: 'John Smith',
      phone: '+1-555-0101',
    },
  });

  const vendor2 = await prisma.vendor.upsert({
    where: { email: 'globaltech@example.com' },
    update: {},
    create: {
      name: 'Global Tech Solutions',
      email: 'globaltech@example.com',
      category: 'Electronics',
      contactPerson: 'Sarah Johnson',
      phone: '+1-555-0102',
    },
  });

  const vendor3 = await prisma.vendor.upsert({
    where: { email: 'officemart@example.com' },
    update: {},
    create: {
      name: 'OfficeMart Inc.',
      email: 'officemart@example.com',
      category: 'Office Supplies',
      contactPerson: 'Mike Davis',
      phone: '+1-555-0103',
    },
  });

  console.log('✅ Created vendors:', {
    vendor1: vendor1.name,
    vendor2: vendor2.name,
    vendor3: vendor3.name,
  });

  // Create sample RFP
  const sampleRFP = await prisma.rFP.create({
    data: {
      title: 'Office Laptop and Monitor Procurement',
      description: 'We need to procure laptops and monitors for our new office expansion.',
      budget: 50000,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      requirements: {
        items: [
          {
            name: 'Laptop',
            quantity: 20,
            specifications: '16GB RAM, 512GB SSD, Intel i7 or equivalent',
          },
          {
            name: 'Monitor',
            quantity: 15,
            specifications: '27-inch, 1440p resolution, IPS panel',
          },
        ],
        deliveryTimeline: 'Within 30 days',
        warranty: 'At least 1 year warranty required',
        paymentTerms: 'Net 30',
      },
      paymentTerms: 'Net 30',
      warrantyPeriod: '1 year minimum',
      status: 'draft',
    },
  });

  console.log('✅ Created sample RFP:', sampleRFP.title);

  // Link vendors to RFP
  await prisma.rFPVendor.createMany({
    data: [
      { rfpId: sampleRFP.id, vendorId: vendor1.id },
      { rfpId: sampleRFP.id, vendorId: vendor2.id },
      { rfpId: sampleRFP.id, vendorId: vendor3.id },
    ],
  });

  // Create sample proposals for the RFP
  const emailContent1 = `Subject: Proposal for ${sampleRFP.title}\n\nDear Procurement Manager,\n\nWe are pleased to submit our proposal for the Office Laptop and Monitor Procurement.\n\nOur Quote:\n- 20 Dell Latitude 5540 Laptops (16GB RAM, 512GB SSD, Intel i7-1355U): $22,000\n- 15 Dell UltraSharp U2723DE 27" Monitors (1440p IPS): $6,750\n\nTotal: $28,750\nDelivery: 15 days\nWarranty: 3 years parts and labor\nPayment Terms: Net 30\n\nBest regards,\nJohn Smith\nTech Supply Co.`;
  
  const proposal1 = await prisma.proposal.create({
    data: {
      rfpId: sampleRFP.id,
      vendorId: vendor1.id,
      rawEmailContent: emailContent1,
      parsedData: {
        subject: `Proposal for ${sampleRFP.title}`,
        vendor: vendor1.name,
        items: ['20 Dell Latitude 5540 Laptops', '15 Dell UltraSharp U2723DE Monitors'],
      },
      totalPrice: 28750,
      deliveryTime: '15 days',
      terms: 'Payment Terms: Net 30\nWarranty: 3 years parts and labor',
      status: 'reviewed',
    },
  });

  const emailContent2 = `Subject: Proposal for ${sampleRFP.title}\n\nHello,\n\nThank you for the opportunity. Here's our proposal:\n\nProposed Solution:\n- 20 HP EliteBook 840 G10 Laptops (16GB RAM, 512GB SSD, Intel i7-1365U): $24,500\n- 15 LG 27UP850 27" 4K IPS Monitors: $7,200\n\nTotal: $31,700\nDelivery: 20 days\nWarranty: 2 years comprehensive\nPayment Terms: Net 30\n\nThank you,\nSarah Johnson\nGlobal Tech Solutions`;

  const proposal2 = await prisma.proposal.create({
    data: {
      rfpId: sampleRFP.id,
      vendorId: vendor2.id,
      rawEmailContent: emailContent2,
      parsedData: {
        subject: `Proposal for ${sampleRFP.title}`,
        vendor: vendor2.name,
        items: ['20 HP EliteBook 840 G10 Laptops', '15 LG 27UP850 27" Monitors'],
      },
      totalPrice: 31700,
      deliveryTime: '20 days',
      terms: 'Payment Terms: Net 30\nWarranty: 2 years comprehensive',
      status: 'reviewed',
    },
  });

  const emailContent3 = `Subject: Proposal for ${sampleRFP.title}\n\nDear Sir/Madam,\n\nWe are excited to provide our competitive proposal:\n\nOur Offer:\n- 20 Lenovo ThinkPad T14s Gen 4 (16GB RAM, 512GB SSD, AMD Ryzen 7): $21,000\n- 15 BenQ PD2725U 27" 4K Designer Monitors: $6,000\n\nTotal: $27,000\nDelivery: 25 days\nWarranty: 1 year standard\nPayment Terms: Net 45\n\nBest,\nMike Davis\nOfficeMart Inc.`;

  const proposal3 = await prisma.proposal.create({
    data: {
      rfpId: sampleRFP.id,
      vendorId: vendor3.id,
      rawEmailContent: emailContent3,
      parsedData: {
        subject: `Proposal for ${sampleRFP.title}`,
        vendor: vendor3.name,
        items: ['20 Lenovo ThinkPad T14s Gen 4', '15 BenQ PD2725U 27" Monitors'],
      },
      totalPrice: 27000,
      deliveryTime: '25 days',
      terms: 'Payment Terms: Net 45\nWarranty: 1 year standard',
      status: 'reviewed',
    },
  });

  // Generate AI summaries for proposals
  try {
    const { generateProposalSummary } = require('../src/services/aiService');
    
    for (const proposal of [proposal1, proposal2, proposal3]) {
      try {
        const summary = await generateProposalSummary(
          {
            totalPrice: proposal.totalPrice,
            deliveryTime: proposal.deliveryTime,
            parsedData: proposal.parsedData,
          },
          sampleRFP
        );
        
        await prisma.proposal.update({
          where: { id: proposal.id },
          data: {
            score: summary.score,
            aiSummary: summary.summary,
          },
        });
        
        console.log(`✅ Generated AI summary for proposal: ${proposal.id}`);
      } catch (error) {
        console.log(`⚠️ Could not generate AI summary for proposal: ${error.message}`);
      }
    }
  } catch (error) {
    console.log('⚠️ AI service not available for summaries');
  }

  console.log('✅ Created sample proposals:', {
    proposal1: `${proposal1.totalPrice} from ${vendor1.name}`,
    proposal2: `${proposal2.totalPrice} from ${vendor2.name}`,
    proposal3: `${proposal3.totalPrice} from ${vendor3.name}`,
  });

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
