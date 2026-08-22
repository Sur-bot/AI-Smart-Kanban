import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Nạp biến môi trường từ .env.test khi chạy local
dotenv.config({ path: '.env.test' });

export default defineConfig({
  // Thư mục chứa test specs
  testDir: './e2e/tests',

  // Chạy song song các file test
  fullyParallel: true,

  // Fail CI nếu có test.only còn sót lại
  forbidOnly: !!process.env['CI'],

  // Retry 2 lần trên CI, 0 lần local
  retries: process.env['CI'] ? 2 : 0,

  // Số workers song song
  workers: process.env['CI'] ? 1 : undefined,

  // Phóng to báo cáo HTML + line reporter khi local
  reporter: process.env['CI']
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'on-failure' }]],

  use: {
    // URL ứng dụng
    baseURL: process.env['E2E_BASE_URL'] ?? 'http://localhost:4200',

    // Chụp screenshot khi fail
    screenshot: 'only-on-failure',

    // Quay video khi retry
    video: 'on-first-retry',

    // Trace khi retry (dùng cho debug)
    trace: 'on-first-retry',

    // Timeout cho mỗi action (ms)
    actionTimeout: 10_000,

    // Locale tiếng Việt
    locale: 'vi-VN',
  },

  // Timeout cho mỗi test case (ms)
  timeout: 30_000,

  // Timeout để expect (ms)
  expect: {
    timeout: 8_000,
  },

  projects: [
    // ─── Setup: lưu trạng thái đăng nhập ─────────────────────────────
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },

    // ─── Chromium (luôn chạy) ─────────────────────────────────────────
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Dùng lại session đã login
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // ─── Firefox (chỉ local, không CI) ───────────────────────────────
    ...(!process.env['CI']
      ? [
          {
            name: 'firefox',
            use: {
              ...devices['Desktop Firefox'],
              storageState: 'e2e/.auth/user.json',
            },
            dependencies: ['setup'],
          },
        ]
      : []),
  ],

  // Tự động khởi động server khi chạy test (chỉ local)
  webServer: process.env['CI']
    ? undefined
    : {
        command: 'npm start',
        url: 'http://localhost:4200',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
