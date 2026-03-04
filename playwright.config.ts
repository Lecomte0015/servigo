import { defineConfig, devices } from "@playwright/test";

/**
 * ServiGo — Playwright E2E Configuration
 *
 * Tests run sequentially (workers: 1) to avoid DB conflicts.
 * Uses existing dev server if running, otherwise starts one.
 *
 * Run: npx playwright test
 * UI:  npx playwright test --ui
 */
export default defineConfig({
  testDir: "./e2e",
  timeout:         30_000,
  expect:          { timeout: 10_000 },
  fullyParallel:   false,   // Sequential — shared DB
  retries:         process.env.CI ? 2 : 0,
  workers:         1,
  reporter: [
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["line"],
  ],

  use: {
    baseURL:    "http://localhost:3000",
    trace:      "on-first-retry",
    screenshot: "only-on-failure",
    video:      "off",
  },

  projects: [
    {
      name: "chromium",
      use:  { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command:              "npm run dev",
    url:                  "http://localhost:3000",
    reuseExistingServer:  !process.env.CI,
    timeout:              120_000,
    stdout:               "ignore",
    stderr:               "pipe",
  },

  globalSetup:    "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
});
