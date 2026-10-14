import { test, expect } from '../../src/fixtures/test.fixtures';
import { secrets } from '../../src/config/env';

/**
 * LOGIN CON USUARIO EXISTENTE
 * Las credenciales llegan como secretos (TEST_USER_EMAIL / TEST_USER_PASSWORD):
 * .env en local, GitHub Secrets en CI. Nunca están escritas en el código.
 */
test('C1 - usuario registrado inicia sesión con credenciales del ambiente', { tag: ['@smoke', '@critical', '@regression'] }, async ({
  page,
  loginPage,
}) => {
  const { userEmail, userPassword } = secrets;
  test.skip(!userEmail || !userPassword, 'Sin secretos TEST_USER_EMAIL / TEST_USER_PASSWORD en este ambiente');

  await loginPage.open();
  await loginPage.login(userEmail!, userPassword!);

  await expect(page).toHaveURL(/\/account$/);
  await expect(loginPage.header.userMenu).toBeVisible();
});
