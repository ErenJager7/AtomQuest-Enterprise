import { prisma } from './src/lib/prisma';

async function test() {
  try {
    const users = await prisma.user.findMany();
    console.log("Users:", users.length);
  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
