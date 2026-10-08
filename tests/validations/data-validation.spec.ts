import { test, expect } from '../../src/fixtures/test.fixtures';
import { SEARCH_TERM } from '../../src/data/test-data';
import { parseMoney } from '../../src/utils/money';

/**
 * VALIDACIÓN DE DATOS
 */
test('D1 - el carrito calcula subtotal y total según la cantidad', { tag: '@data' }, async ({
  catalogPage,
  productPage,
  checkoutPage,
}) => {
  const quantity = 2;

  await catalogPage.open();
  await catalogPage.search(SEARCH_TERM);
  const product = await catalogPage.openFirstInStockProduct();
  await productPage.expectAvailable(product);
  const unitPrice = parseMoney(await productPage.unitPrice.innerText());

  await productPage.addToCart(quantity);
  await checkoutPage.openCart();

  const linePrice = parseMoney(await checkoutPage.linePrice.innerText());
  const total = parseMoney(await checkoutPage.cartTotal.innerText());
  expect(linePrice, 'Subtotal = precio × cantidad').toBeCloseTo(unitPrice * quantity, 2);
  expect(total, 'Total = subtotal').toBe(linePrice);
});
