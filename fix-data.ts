import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  // Fix goal g1: currentValue should be 3.8 hours (38% of 4.5 target = ~84%)
  await prisma.goal.update({ where: { id: 'g1' }, data: { currentValue: 3.8 } });
  // Fix goal g2: currentValue should be 68 (68% of 100 target)
  await prisma.goal.update({ where: { id: 'g2' }, data: { currentValue: 68 } });
  console.log('Fixed bad data');
  await prisma.$disconnect();
}
fix().catch(console.error);
