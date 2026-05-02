const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding products...');
  
  // Clear existing products to avoid duplicates if re-run (optional, but good for this early stage)
  await prisma.orderItem.deleteMany({});
  await prisma.product.deleteMany({});
  
  const products = [
    { name: 'Fresh Cow Butter', unitSize: '500g Pack', price: 320, isAvailable: true },
    { name: 'Fresh Cow Butter', unitSize: '1 KG Pack', price: 640, isAvailable: true },
    { name: 'Pure Cow Ghee', unitSize: '500g Pack', price: 485, isAvailable: true },
    { name: 'Pure Cow Ghee', unitSize: '1 KG Pack', price: 970, isAvailable: true },
    { name: 'Pure Cow Ghee', unitSize: '1 Litre Bottle', price: 880, isAvailable: true },
    { name: 'Special Gulkand', unitSize: '500g Pack', price: 160, isAvailable: true },
    { name: 'Special Gulkand', unitSize: '1 KG Pack', price: 320, isAvailable: true },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: p
    });
  }
  
  console.log('Products seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
