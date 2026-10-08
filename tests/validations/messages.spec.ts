import { test, expect } from '../../src/fixtures/test.fixtures';
import { MESSAGES, SEARCH_TERM } from '../../src/data/test-data';

/**
 * VALIDACIÓN DE MENSAJES
 */
test('M1 - mensajes de búsqueda y de producto agregado al carrito', { tag: '@messages' }, async ({
  catalogPage,
  productPage,
}) => {
  await catalogPage.open();
  await catalogPage.search(SEARCH_TERM);
  await expect(catalogPage.searchCaption).toHaveText(MESSAGES.searchCaption(SEARCH_TERM));

  const product = await catalogPage.openFirstInStockProduct();
  await productPage.expectAvailable(product);
  await productPage.addToCart();
  await expect(productPage.toast).toHaveText(MESSAGES.addedToCart);
});
