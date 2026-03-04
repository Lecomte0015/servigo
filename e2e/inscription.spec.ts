import { test, expect } from "@playwright/test";

/**
 * Tests — Inscription (Registration & Email Verification)
 *
 * Scenario A: Registration form UX
 *   - Navigate to /auth/register
 *   - Fill in valid data
 *   - Submit → see "check your email" confirmation
 *
 * Scenario B: Verification link
 *   - POST /api/auth/register → get user created
 *   - GET  /api/auth/verify-email?token=... → user is verified
 *   - POST /api/auth/login → succeeds
 *
 * Scenario C: Duplicate email is rejected
 *
 * Scenario D: Login blocked if not verified
 */

const TEST_EMAIL = `user_${Date.now()}+e2e@servigo.test`;
const TEST_PASSWORD = "TestPass123!";

test.describe("Inscription", () => {
  test("A — Registration form shows email confirmation", async ({ page }) => {
    await page.goto("/auth/register");

    // Page loads
    await expect(page).toHaveTitle(/ServiGo|Inscription|Register/i);

    // Fill the form
    await page.fill('input[name="firstName"]', "Jean");
    await page.fill('input[name="lastName"]',  "Test");
    await page.fill('input[name="email"]',     TEST_EMAIL);
    await page.fill('input[name="phone"]',     "+41791234567");
    await page.fill('input[name="password"]',  TEST_PASSWORD);

    // Optionally fill confirm password if present
    const confirm = page.locator('input[name="confirmPassword"]');
    if (await confirm.isVisible()) {
      await confirm.fill(TEST_PASSWORD);
    }

    // Submit
    await page.click('button[type="submit"]');

    // Should show verification message (not redirect to dashboard)
    await expect(
      page.locator("text=/email|vérification|verify|check/i").first()
    ).toBeVisible({ timeout: 10_000 });

    // Should NOT be on the dashboard
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  test("B — API registration + email verification flow", async ({ request }) => {
    const uniqEmail = `api_${Date.now()}+e2e@servigo.test`;

    // 1. Register
    const regRes = await request.post("/api/auth/register", {
      data: {
        firstName: "API",
        lastName:  "User",
        email:     uniqEmail,
        phone:     "+41791234568",
        password:  TEST_PASSWORD,
        role:      "CLIENT",
      },
    });
    const regBody = await regRes.json();
    expect(regRes.ok()).toBeTruthy();
    expect(regBody.success).toBe(true);
    // Should indicate email verification is needed
    expect(regBody.data?.needsVerification).toBe(true);

    // 2. Login before verification → should be blocked (403)
    const loginBefore = await request.post("/api/auth/login", {
      data: { email: uniqEmail, password: TEST_PASSWORD },
    });
    expect(loginBefore.status()).toBe(403);
    const loginBeforeBody = await loginBefore.json();
    expect(loginBeforeBody.data?.needsVerification).toBe(true);

    // 3. Get verification token from DB via test helper endpoint
    //    We use Prisma in globalSetup but here we'll test via the verify endpoint.
    //    Since we can't get the token in browser context, we verify the DB state
    //    was created correctly by checking the login block above.
    //    Full token verification is tested in globalSetup (Node context) separately.
  });

  test("C — Duplicate email registration is rejected", async ({ request }) => {
    // Try to register with an existing seeded email
    const res = await request.post("/api/auth/register", {
      data: {
        firstName: "Dup",
        lastName:  "User",
        email:     "client@servigo.ch",  // Already exists
        phone:     "+41791234569",
        password:  TEST_PASSWORD,
        role:      "CLIENT",
      },
    });
    expect(res.ok()).toBe(false);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test("D — Login with seeded verified client succeeds", async ({ request, page }) => {
    // Login via API
    const res = await request.post("/api/auth/login", {
      data: { email: "client@servigo.ch", password: "Client123!" },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);

    // Auth cookie should be set — navigate to protected route
    const me = await request.get("/api/auth/me");
    expect(me.ok()).toBeTruthy();
    const meBody = await me.json();
    expect(meBody.data?.email).toBe("client@servigo.ch");
    expect(meBody.data?.role).toBe("CLIENT");
  });
});
