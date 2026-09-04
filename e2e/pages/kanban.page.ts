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
  readonly sidebar: Locator;
  readonly createProjectBtn: Locator;
  readonly projectDrawerBtn: Locator;
  readonly inviteMemberBtn: Locator;
  readonly newProjectModal: Locator;
  readonly projectNameInput: Locator;
  readonly projectSubmitBtn: Locator;
  readonly memberEmailInput: Locator;
  readonly inviteSubmitBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.board = page.locator('.deadline-board').first();
    this.columns = page.locator('.deadline-col-body');
    this.addTaskBtn = page.locator('.btn-create-main');
    
    this.taskModal = page.locator('.create-task-dialog');
    this.taskTitleInput = page.locator('input[formControlName="title"]');
    this.taskDescInput = page.locator('textarea[formControlName="description"]');
    this.taskSubmitBtn = page.locator('button[type="submit"].btn-submit');
    this.taskCancelBtn = page.locator('button.btn-cancel');
    this.searchInput = page.locator('input.search-real-input');
    this.sidebar = page.locator('app-sidebar');
    this.createProjectBtn = page.getByRole('button', { name: /tạo dự án mới/i }).first();
    this.projectDrawerBtn = page.getByRole('button', { name: /thành viên dự án|thông tin dự án|project members/i }).first();
    this.newProjectModal = page.locator('.modal-container');
    this.projectNameInput = page.locator('input#projectName');
    this.projectSubmitBtn = this.newProjectModal.getByRole('button', { name: /tạo dự án/i });
    this.inviteMemberBtn = page.getByRole('button', { name: /mời thành viên|add member/i }).first();
    this.memberEmailInput = page.locator('input[type="email"], input[placeholder*="email"], input#inviteEmail');
    this.inviteSubmitBtn = page.getByRole('button', { name: /gửi lời mời/i }).first();
  }

  async goto() {
    await this.page.goto('/kanban');
    await this.page.waitForLoadState('networkidle');
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

  async createProject(name: string) {
    await this.createProjectBtn.click();
    await expect(this.newProjectModal).toBeVisible();
    await this.projectNameInput.fill(name);
    await this.projectSubmitBtn.click();
    await expect(this.newProjectModal).toBeHidden({ timeout: 10_000 });
  }

  async inviteMemberToProject(email: string) {
    if (await this.projectDrawerBtn.isVisible()) {
      await this.projectDrawerBtn.click();
    }
    
    if (await this.inviteMemberBtn.isVisible()) {
      await this.inviteMemberBtn.click();
    }

    const emailInput = this.page.getByRole('textbox', { name: /email/i }).first();
    await expect(emailInput).toBeVisible();
    await emailInput.fill(email);

    const confirmBtn = this.page.getByRole('button', { name: /gửi lời mời/i }).first();
    await confirmBtn.click();
  }
}
