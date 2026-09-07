import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for Ascent e2e. Builds and serves the production app on
 * port 3130, then runs the flows at phone + desktop widths. Local storage mode
 * is used (no Blob token needed) so tests are hermetic.
 */
const PORT = 3130;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "off",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    port: PORT,
    reuseExistingServer: false,
    timeout: 120_000,
    // Force local storage mode + AI disabled for hermetic e2e.
    env: {
      BLOB_READ_WRITE_TOKEN: "",
      AI_PERSONALIZATION_ENABLED: "false",
      OPENROUTER_API_KEY: "",
    },
  },
});
