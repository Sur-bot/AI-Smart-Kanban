/**
 * storage.page.ts — Page Object Model cho trang Image Storage
 */
import { type Page, type Locator, expect } from '@playwright/test';
import * as path from 'path';

export class StoragePage {
  readonly page: Page;

  readonly quotaCard: Locator;
  readonly quotaProgressBar: Locator;
  readonly quotaBadge: Locator;
  readonly uploadBtn: Locator;
  readonly fileInput: Locator;
  readonly searchInput: Locator;
  readonly errorBanner: Locator;
  readonly warningBanner: Locator;
  readonly imageGrid: Locator;

  constructor(page: Page) {
    this.page = page;
    this.quotaCard = page.locator('.quota-card');
    this.uploadBtn = page.locator('.upload-cta-btn');
    
    // Components
    this.uploadZone = page.locator('app-image-upload-zone');
    this.fileInput = page.locator('input[type="file"]');
    this.searchInput = page.getByPlaceholder(/tìm kiếm|search/i);
    this.errorBanner = page.locator('.alert-banner.danger, [data-testid="error-banner"]');
    this.warningBanner = page.locator('.alert-banner.warning, [data-testid="warning-banner"]');
    this.imageGrid = page.locator('[data-testid="image-grid"], .image-grid');
  }

  async goto() {
    await this.page.goto('/image-storage');
    await expect(this.quotaCard).toBeVisible({ timeout: 10_000 });
  }

  /** Upload file ảnh theo đường dẫn tuyệt đối */
  async uploadFile(absolutePath: string) {
    await this.fileInput.setInputFiles(absolutePath);
  }

  /** Lấy text hiển thị % quota */
  async getQuotaPercentage(): Promise<number> {
    const text = await this.quotaProgressBar.getAttribute('aria-valuenow')
      ?? await this.quotaBadge.textContent()
      ?? '0';
    return parseFloat(text.replace('%', '').trim());
  }

  /** Lấy class màu của thanh progress để kiểm tra trạng thái */
  async getQuotaStatus(): Promise<'safe' | 'warning' | 'danger'> {
    const classList = await this.quotaProgressBar.getAttribute('class') ?? '';
    if (classList.includes('danger')) return 'danger';
    if (classList.includes('warning')) return 'warning';
    return 'safe';
  }

  async searchImage(keyword: string) {
    await this.searchInput.fill(keyword);
  }

  /** Xóa ảnh theo tên file */
  async deleteImage(imageName: string) {
    const imageCard = this.page.getByText(imageName, { exact: false }).first();
    await imageCard.hover();
    const deleteBtn = imageCard.locator(
      '[aria-label*="xóa"], [aria-label*="delete"], button[title*="xóa"]'
    );
    await deleteBtn.click();
    const confirmBtn = this.page.getByRole('button', { name: /xác nhận|confirm|yes|ok/i });
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
  }
}
