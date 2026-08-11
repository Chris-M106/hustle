// @ts-check
const { defineConfig, devices } = require('@playwright/test');

// Viewport matrix per TESTING.md — 360x640 primary (low-end Android baseline),
// 412x915 secondary (modern Android), 768/1280 tertiary (desktop/tablet, not target).
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx http-server prototype -p 4173 -a 127.0.0.1 -c-1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
  projects: [
    {
      name: 'android-360x640',
      use: { ...devices['Pixel 5'], viewport: { width: 360, height: 640 } },
    },
    {
      name: 'android-412x915',
      use: { ...devices['Pixel 7'], viewport: { width: 412, height: 915 } },
    },
    {
      name: 'desktop-1280',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
});
