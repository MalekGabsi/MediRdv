import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', timeout: 45000, fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:3006', ...devices['Desktop Chrome'], channel: 'chrome', launchOptions: { args: ['--no-sandbox'] }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:3006', reuseExistingServer: true, timeout: 30000 },
});
