/**
 * register.page.ts — Page Object Model cho trang Register
 */
import { type Page, type Locator, expect } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitBtn: Locator;
  readonly errorMessage: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/^mật khẩu$|^password$/i);
    this.confirmPasswordInput = page.getByLabel(/xác nhận|confirm|nhập lại/i);
    this.submitBtn = page.getByRole('button', { name: /đăng ký|register|sign up|tạo tài khoản/i });
    this.errorMessage = page.locator('[role="alert"], .error-message, .alert-danger');
    this.loginLink = page.getByRole('link', { name: /đăng nhập|sign in|login/i });
  }

  async goto() {
    await this.page.goto('/register');
    await expect(this.submitBtn).toBeVisible();
  }

  async register(email: string, password: string, confirmPassword?: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    if (this.confirmPasswordInput) {
      await this.confirmPasswordInput.fill(confirmPassword ?? password);
    }
    await this.submitBtn.click();
  }

  async expectError(messagePattern?: RegExp) {
    await expect(this.errorMessage).toBeVisible();
    if (messagePattern) {
      await expect(this.errorMessage).toContainText(messagePattern);
    }
  }

  async expectRedirectToVerifyEmail() {
    await expect(this.page).toHaveURL(/verify/, { timeout: 10_000 });
  }
}
