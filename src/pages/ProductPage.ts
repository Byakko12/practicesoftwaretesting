import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Detalle de producto (/product/:id). */
export class ProductPage extends BasePage {
  readonly name: Locator;
  readonly unitPrice: Locator;
  readonly quantity: Locator;
  readonly addToCartButton: Locator;
  readonly toast: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.quantity = page.getByTestId('quantity');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.toast = page.getByRole('alert');
  }

  async expectAvailable(productName: string): Promise<void> {
    await expect(this.name).toHaveText(productName);
    await expect(this.addToCartButton, `"${productName}" no tiene stock en este momento`).toBeEnabled();
  }

  async addToCart(quantity = 1): Promise<void> {
    await this.quantity.fill(String(quantity));
    await this.addToCartButton.click();
    await expect(this.header.cartQuantity).toHaveText(String(quantity));
  }
}
