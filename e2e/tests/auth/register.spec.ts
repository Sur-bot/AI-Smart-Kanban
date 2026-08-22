/**
 * register.spec.ts — E2E Tests cho tính năng Register
 *
 * TC-AUTH-006: Hiển thị form đăng ký đúng
 * TC-AUTH-007: Hiện lỗi khi email đã tồn tại
 * TC-AUTH-008: Validate password không khớp
 * TC-AUTH-009: Validate format email sai
 * TC-AUTH-010: Điều hướng sang trang verify email sau khi đăng ký
 */
import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/register.page';

// Chạy không cần đăng nhập
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Auth — Register', () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-AUTH-006: Hiển thị form đăng ký với đủ các trường', async () => {
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.submitBtn).toBeVisible();
    await expect(registerPage.loginLink).toBeVisible();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-AUTH-007: Hiện lỗi khi email đã tồn tại trong hệ thống', async () => {
    const existingEmail = process.env['E2E_TEST_EMAIL']!;

    await registerPage.register(existingEmail, 'AnyPassword123!');
    await registerPage.expectError(/đã tồn tại|already|exist/i);
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-AUTH-008: Hiện lỗi khi password và confirm password không khớp', async () => {
    await registerPage.register(
      'newuser@example.com',
      'Password123!',
      'DifferentPassword456!'
    );
    await registerPage.expectError(/không khớp|mismatch|do not match/i);
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-AUTH-009: Validate format email không hợp lệ', async ({ page }) => {
    await registerPage.emailInput.fill('email-khong-hop-le');
    await registerPage.passwordInput.fill('Password123!');
    await registerPage.submitBtn.click();

    // Browser validation hoặc custom error
    const invalidInputs = await page.locator(':invalid').count();
    const errorVisible = await registerPage.errorMessage.isVisible();

    expect(invalidInputs > 0 || errorVisible).toBeTruthy();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-AUTH-010: Link "Đã có tài khoản" điều hướng về trang Login', async ({ page }) => {
    await registerPage.loginLink.click();
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
  });
});
