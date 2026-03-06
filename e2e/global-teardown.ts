import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function globalTeardown() {
  try {
    // Remove E2E test users
    await prisma.user.deleteMany({
      where: { email: { endsWith: "+e2e@goservi.test" } },
    });

    // Remove E2E test jobs
    await prisma.jobRequest.deleteMany({
      where: { description: { startsWith: "[E2E]" } },
    });

    console.log("[E2E teardown] Done");
  } finally {
    await prisma.$disconnect();
  }
}

export default globalTeardown;
