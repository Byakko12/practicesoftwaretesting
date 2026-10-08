import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * Configuración de Playwright para Practice Software Testing (Toolshop).
 * - Reporte HTML + list en consola
 * - Trace, screenshot y video ante fallo
 * - Ejecución en Google Chrome y Firefox
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://practicesoftwaretesting.com',
    // La app expone atributos data-test: getByTestId('login-submit') → [data-test="login-submit"]
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
