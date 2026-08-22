/**
 * login.page.ts — Page Object Model cho trang Login
 * Form login dùng 2 bước: email → Tiếp tục → password → Đăng nhập
 * Không có <label for="..."> liên kết với input → dùng locator CSS trực tiếp.
 */
import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  // Step 1: Email
  readonly emailInput: Locator;
  readonly continueBtn: Locator;

  // Step 2: Password
  readonly passwordInput: Locator;
  readonly loginBtn: Locator;

  // Toast / Error
  readonly errorToast: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Step 1
    this.emailInput = page.locator('input[type="email"]');
    this.continueBtn = page.getByRole('button', { name: /tiếp tục|continue/i });

    // Step 2
    this.passwordInput = page.locator('input[type="password"]');
    this.loginBtn = page.getByRole('button', { name: /đăng nhập|login|sign in/i });

    // Error: toast notification
    this.errorToast = page.locator('.bg-red-100, [class*="bg-red"]').first();

    // Link sang trang Register
    this.registerLink = page.getByRole('link', { name: /đăng ký|register|sign up/i });
  }

  /** Điều hướng đến trang login */
  async goto() {
    await this.page.goto('/login');
    await expect(this.emailInput).toBeVisible({ timeout: 10_000 });
  }

  /** Thực hiện đăng nhập đầy đủ 2 bước */
  async login(email: string, password: string) {
    // Bước 1: Email
    await this.emailInput.fill(email);
    await this.continueBtn.click();

    // Bước 2: Password (chờ input password xuất hiện)
    await expect(this.passwordInput).toBeVisible({ timeout: 8_000 });
    await this.passwordInput.fill(password);
    await this.loginBtn.click();
  }

  /** Chỉ thực hiện bước 1: nhập email và bấm Tiếp tục */
  async submitEmail(email: string) {
    await this.emailInput.fill(email);
    await this.continueBtn.click();
  }

  /** Chờ redirect sau login thành công */
  async waitForSuccessRedirect() {
    await expect(this.page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  }

  /** Kiểm tra toast lỗi hiển thị */
  async expectError() {
    await expect(this.errorToast).toBeVisible({ timeout: 8_000 });
  }
}
