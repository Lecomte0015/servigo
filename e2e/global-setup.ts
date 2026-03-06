/**
 * Playwright Global Setup
 *
 * Runs once before all tests in Node.js context.
 * Uses Prisma directly to prepare test data.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// E2E test identifier — added to emails to allow easy cleanup
export const E2E_EMAIL_SUFFIX = "+e2e@goservi.test";

async function globalSetup() {
  try {
    // 1. Ensure seeded accounts are verified (seed might not have set isVerified)
    await prisma.user.updateMany({
      where: {
        email: {
          in: [
            "client@goservi.ch",
            "artisan@goservi.ch",
            "admin@goservi.ch",
          ],
        },
        isVerified: false,
      },
      data: { isVerified: true },
    });

    // 2. Clean up leftover E2E test users from previous runs
    await prisma.user.deleteMany({
      where: { email: { endsWith: E2E_EMAIL_SUFFIX } },
    });

    // 3. Clean up E2E test jobs (jobs with description starting with [E2E])
    await prisma.jobRequest.deleteMany({
      where: { description: { startsWith: "[E2E]" } },
    });

    console.log("[E2E setup] Ready");
  } finally {
    await prisma.$disconnect();
  }
}

export default globalSetup;
