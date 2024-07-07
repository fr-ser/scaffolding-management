import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:3001",
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
  webServer: {
    command: "make build run-server-production",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: !process.env.CI,
    stdout: process.env.CI ? "pipe" : "ignore",
  },
});
