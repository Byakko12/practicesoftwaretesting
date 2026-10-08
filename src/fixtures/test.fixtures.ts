import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CatalogPage } from '../pages/CatalogPage';
import { ProductPage } from '../pages/ProductPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { registerUser, TestUser } from '../utils/api';

type Fixtures = {
  loginPage: LoginPage;
  catalogPage: CatalogPage;
  productPage: ProductPage;
  checkoutPage: CheckoutPage;
  /** Usuario desechable con datos sintéticos, creado vía API para cada test que lo pide. */
  testUser: TestUser;
};

/**
 * Cada test recibe una página nueva (aislamiento por BrowserContext)
 * y sus Page Objects ya instanciados.
 */
export const test = base.extend<Fixtures>({
  testUser: async ({ request }, use) => use(await registerUser(request)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  catalogPage: async ({ page }, use) => use(new CatalogPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
});

export { expect };
