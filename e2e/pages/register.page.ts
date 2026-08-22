/**
 * register.page.ts — Page Object Model cho trang Đăng ký
 * Dựa trên cấu trúc form thực tế trong Angular.
 */
import { type Page, type Locator, expect } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly agreeUpdatesCheckbox: Locator;
  readonly agreeTrainingCheckbox: Locator;
  readonly recaptchaCheckbox: Locator;
  readonly submitBtn: Locator;
  readonly loginLink: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    this.page = page;

    // Các field input
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    
    // Checkboxes (dựa vào formControlName)
    this.agreeUpdatesCheckbox = page.locator('input[formControlName="agreeUpdates"]');
    this.agreeTrainingCheckbox = page.locator('input[formControlName="agreeTraining"]');
    this.recaptchaCheckbox = page.locator('input[formControlName="recaptchaVerified"]');
    
    // Buttons và Links
    this.submitBtn = page.locator('button[type="submit"]');
    this.loginLink = page.getByRole('link', { name: /đăng nhập|login/i });
    
    // Error Toast
    this.errorToast = page.locator('.fixed.top-4.right-4[role="alert"]');
  }

  async goto() {
    await this.page.goto('/register');
    await expect(this.submitBtn).toBeVisible();
  }

  async register(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    // Check required recaptcha
    await this.recaptchaCheckbox.check({ force: true });
    
    await this.submitBtn.click();
  }
}
