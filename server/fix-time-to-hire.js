require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const hired = await prisma.application.findMany({ where: { status: 'hired' }, select: { id: true } });

  for (const app of hired) {
    const daysToHire = Math.floor(Math.random() * 45) + 10; // 10–55 days
    const createdAt = new Date(Date.now() - daysToHire * 24 * 60 * 60 * 1000);
    const updatedAt = new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000);
    await prisma.$executeRaw`UPDATE "Application" SET "createdAt" = ${createdAt}, "updatedAt" = ${updatedAt} WHERE id = ${app.id}`;
  }

  // Also fix offer/rejected to have spread-out dates
  const others = await prisma.application.findMany({ where: { status: { in: ['offer', 'rejected', 'screening', 'interview'] } }, select: { id: true } });
  for (const app of others) {
    const daysAgo = Math.floor(Math.random() * 60) + 5;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    await prisma.$executeRaw`UPDATE "Application" SET "createdAt" = ${createdAt} WHERE id = ${app.id}`;
  }

  console.log(`Fixed ${hired.length} hired + ${others.length} other applications`);
}

fix().catch(console.error).finally(() => prisma.$disconnect());
