/**
 * kanban.page.ts — Page Object Model cho Kanban Board (View Hạn chót)
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
    // Kanban board chính là Deadline View trong hệ thống
    this.board = page.locator('.deadline-board').first();
    this.columns = page.locator('.deadline-col-body');
    
    // Nút tạo task ở toolbar
    this.addTaskBtn = page.locator('.btn-create-main');
    
    // Dialog tạo task
    this.taskModal = page.locator('.create-task-dialog');
    this.taskTitleInput = page.locator('input[formControlName="title"]');
    this.taskDescInput = page.locator('textarea[formControlName="description"]');
    this.taskSubmitBtn = page.locator('button[type="submit"].btn-submit');
    this.taskCancelBtn = page.locator('button.btn-cancel');
    
    // Search filter ở toolbar
    this.searchInput = page.locator('input.search-real-input');
  }

  async goto() {
    await this.page.goto('/app/kanban');
    await expect(this.board).toBeVisible({ timeout: 10_000 });
  }

  async openCreateTaskModal() {
    await this.addTaskBtn.click();
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
    const confirmBtn = this.page.getByRole('button', { name: /xác nhận|confirm|yes|ok|xóa/i }).first();
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
