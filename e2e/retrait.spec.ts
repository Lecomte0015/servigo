import { test, expect } from "@playwright/test";
import { loginAsArtisan } from "./helpers/auth";

/**
 * Tests — Retrait artisan (Payout)
 *
 * Flow:
 *   1. Artisan accède à son wallet (/pro/wallet)
 *   2. Le solde disponible s'affiche
 *   3. Si IBAN configuré + solde > 10 CHF → demande de retrait possible
 *   4. Historique des retraits visible
 */

test.describe("Retrait artisan", () => {
  test("1 — Artisan accède à son wallet", async ({ page }) => {
    await loginAsArtisan(page);
    await page.goto("/pro/wallet");

    await expect(page).toHaveURL(/\/pro\/wallet/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("2 — La page wallet affiche les soldes", async ({ page }) => {
    await loginAsArtisan(page);
    await page.goto("/pro/wallet");

    // Wallet page should show balance sections
    // Look for CHF or solde indicators
    await expect(
      page.locator("text=/CHF|solde|disponible|wallet/i").first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("3 — API wallet retourne les données correctes", async ({ request }) => {
    // Login as artisan
    const loginRes = await request.post("/api/auth/login", {
      data: { email: "artisan@servigo.ch", password: "Artisan123!" },
    });
    expect(loginRes.ok()).toBeTruthy();

    // Get wallet data
    const res = await request.get("/api/artisan/wallet");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);

    // Wallet has expected fields
    expect(body.data).toHaveProperty("available");
    expect(body.data).toHaveProperty("pending");
    expect(body.data).toHaveProperty("total");
    expect(typeof body.data.available).toBe("number");
  });

  test("4 — API payouts list retourne les retraits", async ({ request }) => {
    const loginRes = await request.post("/api/auth/login", {
      data: { email: "artisan@servigo.ch", password: "Artisan123!" },
    });
    expect(loginRes.ok()).toBeTruthy();

    const res = await request.get("/api/artisan/payouts");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("5 — Demande de retrait bloquée si solde insuffisant", async ({ request }) => {
    const loginRes = await request.post("/api/auth/login", {
      data: { email: "artisan@servigo.ch", password: "Artisan123!" },
    });
    expect(loginRes.ok()).toBeTruthy();

    // Get current balance
    const walletRes = await request.get("/api/artisan/wallet");
    const walletBody = await walletRes.json();
    const available: number = walletBody.data?.available ?? 0;

    if (available < 10) {
      // Try to request payout — should be rejected
      const res = await request.post("/api/artisan/payouts", {
        data: { amount: 5 },
      });
      // Should fail (insufficient funds or no IBAN)
      expect(res.ok()).toBe(false);
    } else {
      // Artisan has enough funds — verify payout form is accessible
      test.info().annotations.push({
        type: "info",
        description: `Artisan has ${available} CHF available`,
      });
    }
  });

  test("6 — Page earnings est accessible", async ({ page }) => {
    await loginAsArtisan(page);
    await page.goto("/pro/earnings");
    await expect(page).toHaveURL(/\/pro\/earnings/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
