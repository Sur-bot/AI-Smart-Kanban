/**
 * register.spec.ts — E2E Tests cho tính năng Register
 * TC-AUTH-006: Hiển thị form đăng ký với đủ các trường
 * TC-AUTH-007: Lỗi khi email đã tồn tại
 * TC-AUTH-008: Nút đăng ký disabled khi chưa tick reCAPTCHA
 * TC-AUTH-009: Lỗi format email / password (validation)
 * TC-AUTH-010: Link "Đã có tài khoản" điều hướng về trang Login
 */
import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/register.page';

// Chạy không cần đăng nhập sẵn
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
    await expect(registerPage.recaptchaCheckbox).toBeAttached(); // nó có thể hidden bởi CSS
    await expect(registerPage.submitBtn).toBeVisible();
    await expect(registerPage.loginLink).toBeVisible();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-AUTH-007: Supabase ẩn lỗi trùng email (bảo mật), điều hướng sang trang xác nhận', async ({ page }) => {
    const existingEmail = process.env['E2E_TEST_EMAIL'] || 'test@gmail.com'; // email đã có trong hệ thống
    const password = 'ValidPass@123';

    await registerPage.register(existingEmail, password);

    // Hành vi thật: Supabase trả về 200 (ẩn lỗi). Frontend sẽ điều hướng sang trang verify-pending.
    await expect(page).toHaveURL(/\/auth\/verify-pending/, { timeout: 15_000 });
    
    // Kiểm tra UI có hiện thông báo "Kiểm tra hộp thư" (text trong verify-pending)
    await expect(page.getByText(/Kiểm tra hộp thư của bạn/i)).toBeVisible();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-AUTH-008: Nút Đăng ký bị disabled khi chưa tick reCAPTCHA', async ({ page }) => {
    await registerPage.emailInput.fill('newuser@example.com');
    await registerPage.passwordInput.fill('ValidPass@123');
    
    // Chưa check recaptcha -> Nút phải disabled
    await expect(registerPage.submitBtn).toBeDisabled();

    // Check recaptcha -> Nút sẽ enabled
    await registerPage.recaptchaCheckbox.check({ force: true });
    await expect(registerPage.submitBtn).toBeEnabled();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-AUTH-009: Báo lỗi khi email sai định dạng', async ({ page }) => {
    await registerPage.emailInput.fill('invalid-email');
    await registerPage.passwordInput.fill('ValidPass@123');
    
    // blur để trigger validation
    await registerPage.passwordInput.focus();

    // Text báo lỗi "Email không đúng định dạng"
    await expect(page.getByText(/không hợp lệ|invalid|sai định dạng|không đúng định dạng/i)).toBeVisible();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-AUTH-010: Link "Đăng nhập" điều hướng về trang Login', async ({ page }) => {
    await registerPage.loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });
});
