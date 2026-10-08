import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Inicio de sesión (/auth/login). */
export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly loginError: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.submitButton = page.getByTestId('login-submit');
    this.emailError = page.getByTestId('email-error');
    this.passwordError = page.getByTestId('password-error');
    this.loginError = page.getByTestId('login-error');
  }

  async open(): Promise<void> {
    await this.page.goto('/auth/login');
    await expect(this.submitButton).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectLoggedInAs(fullName: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/account$/);
    await expect(this.header.userMenu).toHaveText(fullName);
  }
}
