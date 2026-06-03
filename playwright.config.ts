import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PLAYWRIGHT_BACKEND_PORT || 3099;
const REUSE_EXISTING_SERVER = process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER === "true";

export default defineConfig({
  testDir: "./tests/e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    httpCredentials: {
      username: "admin",
      password: "local1",
    },
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: REUSE_EXISTING_SERVER
    ? undefined
    : {
        command: "make start-playwright-services",
        url: `http://localhost:${PORT}`,
        reuseExistingServer: false,
        stdout: process.env.CI ? "pipe" : "ignore",
      },
});
