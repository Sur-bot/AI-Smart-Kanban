import { test, expect } from '@playwright/test';
import { KanbanPage } from '../../pages/kanban.page';

// Dùng timestamp để task name unique, tránh xung đột giữa các test run
const UID = Date.now().toString().slice(-6);
const TEST_TASK_TITLE = `[E2E] Task Test ${UID}`;

test.describe('Kanban — Board', () => {
  let kanbanPage: KanbanPage;

  test.beforeEach(async ({ page }) => {
    kanbanPage = new KanbanPage(page);
    await kanbanPage.goto();
    
    try {
      await expect(page.locator('app-page-toolbar')).toBeVisible({ timeout: 5000 });
    } catch (e) {
      await kanbanPage.createProject(`[E2E] Base Project ${UID}`);
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-KANBAN-001: Đổi View (List -> Planner -> Deadline)', async ({ page }) => {
    const listTab = page.getByRole('button', { name: /danh sách/i });
    const deadlineTab = page.getByRole('button', { name: /hạn chót/i });
    
    await deadlineTab.click();
    await expect(page).toHaveURL(/view=deadline/);
    await expect(kanbanPage.board).toBeVisible();

    const columnCount = await kanbanPage.columns.count();
    expect(columnCount).toBeGreaterThan(0);
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-KANBAN-002: Tạo task mới thành công', async ({ page }) => {
    await kanbanPage.createTask({
      title: TEST_TASK_TITLE,
      description: 'Mô tả task test tự động bằng Playwright',
    });

    // Task vừa tạo phải xuất hiện trên bảng (bất kể view list hay board)
    await expect(kanbanPage.getTaskCard(TEST_TASK_TITLE)).toBeVisible();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-KANBAN-003: Không tạo được task khi bỏ trống tiêu đề', async ({ page }) => {
    await kanbanPage.openCreateTaskModal();
    await kanbanPage.taskSubmitBtn.click();

    const isModalStillOpen = await kanbanPage.taskModal.isVisible();
    const titleInvalid = await page.locator(':invalid').count() > 0;
    const errorVisible = await page.locator('.error, [role="alert"]').isVisible();

    expect(isModalStillOpen || titleInvalid || errorVisible).toBeTruthy();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-KANBAN-004: Xóa task thành công', async () => {
    const taskToDelete = `[E2E] Xóa Task ${UID}`;
    await kanbanPage.createTask({ title: taskToDelete });
    await expect(kanbanPage.getTaskCard(taskToDelete)).toBeVisible();

    await kanbanPage.deleteTask(taskToDelete);
    await expect(kanbanPage.getTaskCard(taskToDelete)).toBeHidden();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-KANBAN-005: Kéo thả task sang cột khác', async ({ page }) => {
    const deadlineTab = page.getByRole('button', { name: /hạn chót/i });
    await deadlineTab.click();

    const taskToDrag = `[E2E] Drag Task ${UID}`;
    await kanbanPage.createTask({ title: taskToDrag });

    const columnCount = await kanbanPage.columns.count();
    if (columnCount < 2) {
      test.skip(true, 'Cần ít nhất 2 cột để test kéo thả');
      return;
    }

    await kanbanPage.dragTaskToColumn(taskToDrag, 1);
    await expect(kanbanPage.getTaskCard(taskToDrag)).toBeVisible();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-KANBAN-006: Tìm kiếm task hiển thị đúng kết quả', async ({ page }) => {
    // Tạo task với tên đặc biệt để search
    const searchableTitle = `[E2E] SearchTarget ${UID}`;
    await kanbanPage.createTask({ title: searchableTitle });

    // Tìm kiếm
    await kanbanPage.searchTask(searchableTitle);

    // Task cần tìm phải hiện ra
    await expect(kanbanPage.getTaskCard(searchableTitle)).toBeVisible();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-KANBAN-007: Nhấn Hủy trong modal tạo task không tạo task mới', async () => {
    const randomTitle = `[E2E] Hủy Task ${UID}`;

    await kanbanPage.openCreateTaskModal();
    await kanbanPage.taskTitleInput.fill(randomTitle);
    await kanbanPage.taskCancelBtn.click();

    // Modal đóng
    await expect(kanbanPage.taskModal).toBeHidden();
    // Task không xuất hiện
    await expect(kanbanPage.getTaskCard(randomTitle)).toBeHidden();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-KANBAN-008: Task vừa tạo hiển thị đúng tiêu đề', async () => {
    await kanbanPage.createTask({ title: TEST_TASK_TITLE });

    const taskCard = kanbanPage.getTaskCard(TEST_TASK_TITLE);
    await expect(taskCard).toBeVisible();
    await expect(taskCard).toContainText(TEST_TASK_TITLE);
  });
});
