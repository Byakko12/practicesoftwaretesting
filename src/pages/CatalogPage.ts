import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Catálogo y buscador de productos (/). */
export class CatalogPage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchCaption: Locator;
  readonly productCards: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByTestId('search-query');
    this.searchButton = page.getByTestId('search-submit');
    this.searchCaption = page.getByTestId('search-caption');
    // Cada tarjeta es un <a data-test="product-<id>">
    this.productCards = page.locator('a[data-test^="product-"]');
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await expect(this.productCards.first()).toBeVisible(); // la grilla se carga async desde la API
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    // Espera la respuesta real de la API en lugar de un sleep fijo
    await Promise.all([
      this.page.waitForResponse((r) => r.url().includes('/products/search') && r.ok()),
      this.searchButton.click(),
    ]);
    await expect(this.searchCaption).toContainText(term);
  }

  /**
   * Abre el primer producto con stock y devuelve su nombre.
   * Es una demo compartida: las compras agotan productos, así que no se fija uno en particular.
   */
  async openFirstInStockProduct(): Promise<string> {
    const card = this.productCards.filter({ hasNot: this.page.getByTestId('out-of-stock') }).first();
    const name = (await card.getByTestId('product-name').innerText()).trim();
    await card.click();
    await this.page.waitForURL(/\/product\//);
    return name;
  }
}
