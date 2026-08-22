/**
 * login.spec.ts — E2E Tests cho tính năng Login
 * Form login dùng 2 bước: email → Tiếp tục → password → Đăng nhập
 *
 * TC-AUTH-001: Hiển thị form login bước 1 (email)
 * TC-AUTH-002: Login thành công 2 bước với thông tin hợp lệ
 * TC-AUTH-003: Lỗi khi sai password (ở bước 2)
 * TC-AUTH-004: Nút Tiếp tục disabled khi email trống
 * TC-AUTH-005: Redirect khỏi /login sau khi login thành công
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';

// Chạy không cần đăng nhập sẵn
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Auth — Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-AUTH-001: Hiển thị form login bước 1 với ô nhập email và nút Tiếp tục', async () => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.continueBtn).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
    // Bước 1 không hiển thị password
    await expect(loginPage.passwordInput).toBeHidden();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-AUTH-002: Login thành công 2 bước với email/password hợp lệ', async () => {
    const email = process.env['E2E_TEST_EMAIL']!;
    const password = process.env['E2E_TEST_PASSWORD']!;

    await loginPage.login(email, password);
    await loginPage.waitForSuccessRedirect();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-AUTH-003: Hiển thị lỗi khi nhập sai password ở bước 2', async () => {
    const email = process.env['E2E_TEST_EMAIL']!;

    // Bước 1: nhập email hợp lệ
    await loginPage.submitEmail(email);

    // Bước 2: nhập sai password
    await expect(loginPage.passwordInput).toBeVisible({ timeout: 8_000 });
    await loginPage.passwordInput.fill('SaiPassword@999');
    await loginPage.loginBtn.click();

    // Hiển thị toast lỗi
    await loginPage.expectError();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-AUTH-004: Nút Tiếp tục bị disabled khi email để trống', async ({ page }) => {
    // Không điền gì, nút Tiếp tục phải ở trạng thái disabled
    await expect(loginPage.continueBtn).toBeDisabled();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-AUTH-005: Sau login thành công, URL không còn là /login', async () => {
    const email = process.env['E2E_TEST_EMAIL']!;
    const password = process.env['E2E_TEST_PASSWORD']!;

    await loginPage.login(email, password);
    await loginPage.waitForSuccessRedirect();

    expect(loginPage.page.url()).not.toContain('/login');
  });
});
