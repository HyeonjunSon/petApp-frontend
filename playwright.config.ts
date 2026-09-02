import { defineConfig } from "@playwright/test";

/** E2E smoke — runs against production by default (PLAYWRIGHT_BASE_URL to override). */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 1,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "https://pet-app-frontend-fawn.vercel.app",
    viewport: { width: 1440, height: 900 },
    // CI installs chromium; locally reuse the system Chrome (no download)
    channel: process.env.CI ? undefined : "chrome",
  },
  reporter: [["list"]],
});
