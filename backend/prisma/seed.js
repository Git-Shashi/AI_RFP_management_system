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
