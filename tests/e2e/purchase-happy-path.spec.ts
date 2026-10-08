import { test, expect } from '../../src/fixtures/test.fixtures';
import { MESSAGES, PAYMENT_METHOD, SEARCH_TERM } from '../../src/data/test-data';

/**
 * HAPPY PATH
 * Login → búsqueda → acción principal (compra) → validación → logout
 */
test('Happy Path - usuario compra un producto y cierra sesión', { tag: '@smoke' }, async ({
  page,
  testUser,
  loginPage,
  catalogPage,
  productPage,
  checkoutPage,
}) => {
  await test.step('1. Login', async () => {
    await loginPage.open();
    await loginPage.login(testUser.email, testUser.password);
    await loginPage.expectLoggedInAs(testUser.fullName);
  });

  await test.step('2. Búsqueda', async () => {
    await catalogPage.open();
    await catalogPage.search(SEARCH_TERM);
    const product = await catalogPage.openFirstInStockProduct();
    await productPage.expectAvailable(product);
  });

  await test.step('3. Acción principal: comprar', async () => {
    await productPage.addToCart();
    await checkoutPage.openCart();
    await checkoutPage.checkout(PAYMENT_METHOD);
    await checkoutPage.confirmOrder();
  });

  await test.step('4. Validación', async () => {
    await expect(checkoutPage.orderConfirmation).toHaveText(MESSAGES.orderConfirmation);
  });

  await test.step('5. Logout', async () => {
    await checkoutPage.header.logout();
    // /account es una ruta protegida: sin sesión redirige al login
    await page.goto('/account');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
