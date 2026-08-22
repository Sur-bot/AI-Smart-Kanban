/**
 * kanban.page.ts — Page Object Model cho Kanban Board
 */
import { type Page, type Locator, expect } from '@playwright/test';

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export class KanbanPage {
  readonly page: Page;

  readonly board: Locator;
  readonly columns: Locator;
  readonly addTaskBtn: Locator;
  readonly taskModal: Locator;
  readonly taskTitleInput: Locator;
  readonly taskDescInput: Locator;
  readonly taskSubmitBtn: Locator;
  readonly taskCancelBtn: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    // Board container — sử dụng semantic role hoặc data-testid
    this.board = page.locator('main, [data-testid="kanban-board"]').first();
    this.columns = page.locator('[data-testid="kanban-column"], .kanban-column');
    this.addTaskBtn = page.getByRole('button', { name: /thêm task|tạo task|new task|add task|\+/i });
    this.taskModal = page.locator('[role="dialog"], mat-dialog-container, .modal');
    this.taskTitleInput = page.getByLabel(/tiêu đề|title/i);
    this.taskDescInput = page.getByLabel(/mô tả|description/i);
    this.taskSubmitBtn = page.getByRole('button', { name: /tạo|create|lưu|save/i }).last();
    this.taskCancelBtn = page.getByRole('button', { name: /hủy|cancel/i });
    this.searchInput = page.getByRole('searchbox').or(page.getByPlaceholder(/tìm kiếm|search/i));
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.board).toBeVisible({ timeout: 10_000 });
  }

  async openCreateTaskModal() {
    await this.addTaskBtn.first().click();
    await expect(this.taskModal).toBeVisible();
  }

  async createTask(data: CreateTaskData) {
    await this.openCreateTaskModal();
    await this.taskTitleInput.fill(data.title);
    if (data.description) {
      await this.taskDescInput.fill(data.description);
    }
    await this.taskSubmitBtn.click();
    // Chờ modal đóng
    await expect(this.taskModal).toBeHidden({ timeout: 8_000 });
  }

  async searchTask(keyword: string) {
    await this.searchInput.fill(keyword);
  }

  getTaskCard(title: string): Locator {
    return this.page.getByText(title, { exact: false }).first();
  }

  async deleteTask(title: string) {
    const card = this.getTaskCard(title);
    await card.hover();
    const deleteBtn = card.locator('[aria-label*="xóa"], [aria-label*="delete"], [title*="xóa"]');
    await deleteBtn.click();
    // Confirm nếu có dialog
    const confirmBtn = this.page.getByRole('button', { name: /xác nhận|confirm|yes|ok/i });
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
    await expect(this.getTaskCard(title)).toBeHidden({ timeout: 8_000 });
  }

  async dragTaskToColumn(taskTitle: string, targetColumnIndex: number) {
    const taskCard = this.getTaskCard(taskTitle);
    const targetColumn = this.columns.nth(targetColumnIndex);
    await taskCard.dragTo(targetColumn);
  }
}
