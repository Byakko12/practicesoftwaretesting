import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Checkout en 4 pasos (/checkout): carrito → sesión → dirección → pago. */
export class CheckoutPage extends BasePage {
  readonly linePrice: Locator;
  readonly cartTotal: Locator;
  readonly proceedFromCart: Locator;
  readonly proceedFromSignIn: Locator;
  readonly street: Locator;
  readonly houseNumber: Locator;
  readonly proceedFromAddress: Locator;
  readonly paymentMethod: Locator;
  readonly checkPaymentButton: Locator;
  readonly paymentSuccess: Locator;
  readonly confirmButton: Locator;
  readonly orderConfirmation: Locator;

  constructor(page: Page) {
    super(page);
    this.linePrice = page.getByTestId('line-price');
    this.cartTotal = page.getByTestId('cart-total');
    this.proceedFromCart = page.getByTestId('proceed-1');
    this.proceedFromSignIn = page.getByTestId('proceed-2');
    this.street = page.getByTestId('street');
    this.houseNumber = page.getByTestId('house_number');
    this.proceedFromAddress = page.getByTestId('proceed-3');
    this.paymentMethod = page.getByTestId('payment-method');
    this.checkPaymentButton = page.getByRole('button', { name: 'Check payment' });
    this.paymentSuccess = page.getByTestId('payment-success-message');
    this.confirmButton = page.getByRole('button', { name: 'Confirm', exact: true });
    this.orderConfirmation = page.locator('#order-confirmation');
  }

  async openCart(): Promise<void> {
    await this.header.cartLink.click();
    await expect(this.proceedFromCart).toBeVisible();
  }

  /** Recorre los pasos 1→4 y deja el pago verificado, listo para confirmar. */
  async checkout(paymentMethod: string): Promise<void> {
    await this.proceedFromCart.click();
    await this.proceedFromSignIn.click();
    await expect(this.street).not.toHaveValue(''); // la dirección se precarga desde el perfil
    await this.houseNumber.fill('1');
    await expect(this.proceedFromAddress).toBeEnabled(); // se habilita cuando el formulario es válido
    await this.proceedFromAddress.click();
    await this.paymentMethod.selectOption(paymentMethod);
    await this.checkPaymentButton.click();
    await expect(this.paymentSuccess).toBeVisible();
  }

  async confirmOrder(): Promise<void> {
    await this.confirmButton.click();
    await expect(this.orderConfirmation).toBeVisible();
  }
}
