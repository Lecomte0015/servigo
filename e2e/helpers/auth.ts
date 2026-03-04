import { Page } from "@playwright/test";

// ── Seeded test credentials ────────────────────────────────────────────────────
export const CREDS = {
  client:  { email: "client@servigo.ch",  password: "Client123!" },
  artisan: { email: "artisan@servigo.ch", password: "Artisan123!" },
  admin:   { email: "admin@servigo.ch",   password: "Admin123!" },
} as const;

// ── Login helpers ──────────────────────────────────────────────────────────────

/**
 * Logs in via the front-office login form and waits for redirect.
 */
export async function loginAs(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto("/auth/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(
    (url) => !url.pathname.includes("/auth/login"),
    { timeout: 15_000 }
  );
}

/**
 * Logs in via the admin login form.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.fill('input[type="email"]', CREDS.admin.email);
  await page.fill('input[type="password"]', CREDS.admin.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(
    (url) => !url.pathname.includes("/admin/login"),
    { timeout: 15_000 }
  );
}

/**
 * Logs in as client (seeded, pre-verified).
 */
export const loginAsClient  = (page: Page) => loginAs(page, CREDS.client.email,  CREDS.client.password);
/**
 * Logs in as artisan (seeded, pre-verified, approved).
 */
export const loginAsArtisan = (page: Page) => loginAs(page, CREDS.artisan.email, CREDS.artisan.password);
