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
    this.createProjectBtn = page.getByRole('button', { name: /tạo dự án/i }).first();
    this.projectDrawerBtn = page.locator('a.submenu-item').filter({ hasText: /quản lý thành viên/i }).first();
    this.newProjectModal = page.locator('.modal-container');
    this.projectNameInput = page.locator('input#projectName');
    this.projectSubmitBtn = this.newProjectModal.getByRole('button', { name: /tạo dự án/i });
    this.memberEmailInput = page.getByRole('textbox', { name: /user id/i }).first();
    this.inviteSubmitBtn = page.locator('button[type="submit"]').first();
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
    await card.click();
    
    const modal = this.page.locator('.modal-frame').first();
    await expect(modal).toBeVisible();

    const deleteBtn = modal.locator('button[matTooltip="Xóa tác vụ"]');
    await deleteBtn.click();
    
    await expect(this.getTaskCard(title)).toBeHidden({ timeout: 8_000 });
  }

  async dragTaskToColumn(taskTitle: string, targetColumnIndex: number) {
    const taskCard = this.getTaskCard(taskTitle);
    const targetColumn = this.columns.nth(targetColumnIndex);
    await taskCard.dragTo(targetColumn);
  }

  async createProject(name: string) {
    // Open project switcher dropdown first
    const switcherBtn = this.page.locator('.switcher-btn');
    if (await switcherBtn.isVisible()) {
      await switcherBtn.click();
      await expect(this.page.locator('.switcher-dropdown')).toBeVisible();
    }
    
    const createBtn = this.page.locator('.switcher-dropdown .create-btn');
    if (await createBtn.isVisible()) {
      await createBtn.click();
    } else {
      await this.createProjectBtn.click();
    }
    await expect(this.newProjectModal).toBeVisible();
    await this.projectNameInput.fill(name);
    await this.projectSubmitBtn.click();
    await expect(this.newProjectModal).toBeHidden({ timeout: 10_000 });
  }

  async inviteMemberToProject(email: string) {
    const switcherBtn = this.page.locator('.switcher-btn');
    if (await switcherBtn.isVisible()) {
      await switcherBtn.click();
      await expect(this.page.locator('.switcher-dropdown')).toBeVisible();
    }

    if (!(await this.projectDrawerBtn.isVisible())) {
      const hopTacMenu = this.page.locator('app-sidebar').getByText('Hợp tác');
      if (await hopTacMenu.isVisible()) {
        await hopTacMenu.click();
      }
      await this.projectDrawerBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    }

    this.page.once('dialog', async dialog => {
      console.log('DIALOG DETECTED: ' + dialog.message());
      await dialog.dismiss();
    });

    console.log('projectDrawerBtn visible?', await this.projectDrawerBtn.isVisible());
    await this.projectDrawerBtn.evaluate(node => (node as HTMLElement).click());
    
    // Check that the modal is visible
    await expect(this.page.locator('#member-modal-title')).toBeVisible({ timeout: 10_000 });

    await expect(this.memberEmailInput).toBeVisible();
    await this.memberEmailInput.fill(email);

    // Wait for the request to complete
    await Promise.all([
      this.page.waitForResponse(res => res.url().includes('/members') && res.status() === 201),
      this.inviteSubmitBtn.click()
    ]);

    // Close the modal
    await this.page.locator('button.close-btn').first().click();
  }
}
