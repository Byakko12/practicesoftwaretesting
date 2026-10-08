import { test, expect } from '../../src/fixtures/test.fixtures';
import { buildInvalidCredentials, MESSAGES } from '../../src/data/test-data';

/**
 * CASOS NEGATIVOS de autenticación
 */
test.describe('Login - casos negativos', { tag: '@negative' }, () => {
  // Hook: todos los tests de este bloque arrancan en /auth/login
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('N1 - credenciales inválidas muestran error', async ({ page, loginPage }) => {
    const invalid = buildInvalidCredentials();

    await loginPage.login(invalid.email, invalid.password);

    await expect(loginPage.loginError).toHaveText(MESSAGES.invalidCredentials);
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('N2 - campos vacíos muestran errores de obligatoriedad', async ({ page, loginPage }) => {
    await loginPage.submitButton.click();

    await expect(loginPage.emailError).toHaveText(MESSAGES.emailRequired);
    await expect(loginPage.passwordError).toHaveText(MESSAGES.passwordRequired);
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
