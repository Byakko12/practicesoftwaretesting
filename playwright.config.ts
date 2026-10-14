import { defineConfig, devices } from '@playwright/test';
import { env, intFromEnv } from './src/config/env';

/**
 * Configuración de Playwright para Practice Software Testing (Toolshop).
 * - Ambiente con TEST_ENV (qa | with-bugs) → environments/<ambiente>.env
 * - Reporte HTML + list en consola (+ anotaciones en GitHub Actions)
 * - Trace, screenshot y video ante fallo (EVIDENCE=1 → en todos los tests)
 * - Retries controlados: RETRIES (por defecto 2 en CI, 0 en local)
 * - Ejecución en Google Chrome y Firefox
 */
const isCI = !!process.env.CI;
const evidence = !!process.env.EVIDENCE;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // Un test.only olvidado hace fallar el pipeline en vez de saltarse el resto de la suite
  forbidOnly: isCI,
  retries: intFromEnv('RETRIES', isCI ? 2 : 0),
  workers: intFromEnv('WORKERS', 0) || undefined,
  // Si la app está caída no se insiste con toda la suite
  maxFailures: isCI ? 10 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    // En GitHub Actions cada fallo aparece como anotación en el resumen de la ejecución
    ...(isCI ? [['github'] as const] : []),
  ],

  metadata: { ambiente: env.name, baseURL: env.baseURL },

  use: {
    baseURL: env.baseURL,
    // La app expone atributos data-test: getByTestId('login-submit') → [data-test="login-submit"]
    testIdAttribute: 'data-test',
    // EVIDENCE=1 (lo activa el workflow de CI): trace, video y screenshot de todos los tests
    trace: evidence ? 'on' : 'retain-on-failure',
    screenshot: evidence ? 'on' : 'only-on-failure',
    video: evidence ? 'on' : 'retain-on-failure',
  },

  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
