import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding initial setup...')

  // Just seed initial departments so new registered users can select them
  const departments = ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance'];

  for (const name of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Seed one Goal Cycle
  const currentYear = new Date().getFullYear();
  await prisma.goalCycle.create({
    data: {
      name: `FY${currentYear.toString().substring(2)} Q3`,
      startDate: new Date(`${currentYear}-07-01`),
      endDate: new Date(`${currentYear}-09-30`),
      isActive: true,
    }
  });

  console.log('Seeding complete - Database starts with 0 users for production.');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
