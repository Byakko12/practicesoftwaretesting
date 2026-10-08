import { Page, Locator, expect } from '@playwright/test';

/** Barra de navegación compartida por todas las páginas. */
export class Header {
  readonly userMenu: Locator;
  readonly signOutLink: Locator;
  readonly cartLink: Locator;
  readonly cartQuantity: Locator;

  constructor(page: Page) {
    this.userMenu = page.getByTestId('nav-menu');
    this.signOutLink = page.getByTestId('nav-sign-out');
    this.cartLink = page.getByTestId('nav-cart');
    this.cartQuantity = page.getByTestId('cart-quantity');
  }

  async logout(): Promise<void> {
    await this.userMenu.click();
    await expect(this.signOutLink).toBeVisible(); // espera a que abra el dropdown
    await this.signOutLink.click();
    await expect(this.userMenu).toBeHidden();
  }
}
