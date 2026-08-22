/**
 * auth.setup.ts
 * Chạy một lần trước tất cả tests để lưu trạng thái đăng nhập.
 * Form login dùng 2 bước: email → Tiếp tục → password → Đăng nhập
 */
import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env['E2E_TEST_EMAIL'];
  const password = process.env['E2E_TEST_PASSWORD'];

  if (!email || !password) {
    throw new Error(
      '❌ Thiếu biến môi trường E2E_TEST_EMAIL hoặc E2E_TEST_PASSWORD.\n' +
      '   Hãy sao chép .env.test.example thành .env.test và điền thông tin tài khoản test.'
    );
  }

  // Đảm bảo thư mục .auth tồn tại
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Điều hướng đến trang login
  await page.goto('/login');

  // ─── Bước 1: Nhập Email ───────────────────────────────────────────────────
  // Form dùng formControlName="email", selector an toàn là input[type="email"]
  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toBeVisible({ timeout: 10_000 });
  await emailInput.fill(email);

  // Nhấn nút "Tiếp tục" (step 1) — text được lấy từ i18n key LOGIN.CONTINUE
  const continueBtn = page.getByRole('button', { name: /tiếp tục|continue/i });
  await expect(continueBtn).toBeEnabled();
  await continueBtn.click();

  // ─── Bước 2: Nhập Password ────────────────────────────────────────────────
  // Sau khi chuyển sang step 2, input password xuất hiện
  const passwordInput = page.locator('input[type="password"]');
  await expect(passwordInput).toBeVisible({ timeout: 8_000 });
  await passwordInput.fill(password);

  // Nhấn nút "Đăng nhập" (step 2) — text từ i18n key LOGIN.LOGIN_BTN
  const loginBtn = page.getByRole('button', { name: /đăng nhập|login|sign in/i });
  await expect(loginBtn).toBeEnabled();
  await loginBtn.click();

  // Chờ rời khỏi trang login (redirect thành công)
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });

  // Lưu storage state để tái sử dụng cho tất cả tests
  await page.context().storageState({ path: authFile });

  console.log('✅ Auth setup hoàn tất — storage state đã lưu tại:', authFile);
});
