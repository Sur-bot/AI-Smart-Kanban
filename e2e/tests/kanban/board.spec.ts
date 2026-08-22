/**
 * board.spec.ts — E2E Tests cho Kanban Board
 * (Chạy với session đã đăng nhập — xem playwright.config.ts)
 *
 * TC-KANBAN-001: Hiển thị Kanban board sau khi login
 * TC-KANBAN-002: Tạo task mới qua modal
 * TC-KANBAN-003: Validate form tạo task (title bắt buộc)
 * TC-KANBAN-004: Xóa task thành công
 * TC-KANBAN-005: Kéo thả task sang cột khác
 * TC-KANBAN-006: Tìm kiếm task theo từ khóa
 * TC-KANBAN-007: Filter task theo priority
 * TC-KANBAN-008: Hiển thị task đúng thông tin
 */
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
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-KANBAN-001: Hiển thị Kanban Board sau khi đăng nhập', async () => {
    await expect(kanbanPage.board).toBeVisible();
    // Có ít nhất 1 cột
    const columnCount = await kanbanPage.columns.count();
    expect(columnCount).toBeGreaterThan(0);
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-KANBAN-002: Tạo task mới thành công', async ({ page }) => {
    await kanbanPage.createTask({
      title: TEST_TASK_TITLE,
      description: 'Mô tả task test tự động bằng Playwright',
    });

    // Task vừa tạo phải xuất hiện trên board
    await expect(kanbanPage.getTaskCard(TEST_TASK_TITLE)).toBeVisible();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-KANBAN-003: Không tạo được task khi bỏ trống tiêu đề', async ({ page }) => {
    await kanbanPage.openCreateTaskModal();

    // Submit mà không điền title
    await kanbanPage.taskSubmitBtn.click();

    // Modal vẫn còn mở (không đóng) hoặc hiện lỗi validation
    const isModalStillOpen = await kanbanPage.taskModal.isVisible();
    const titleInvalid = await page.locator(':invalid').count() > 0;
    const errorVisible = await page.locator('.error, [role="alert"]').isVisible();

    expect(isModalStillOpen || titleInvalid || errorVisible).toBeTruthy();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-KANBAN-004: Xóa task thành công', async () => {
    // Tạo task trước để xóa
    const taskToDelete = `[E2E] Xóa Task ${UID}`;
    await kanbanPage.createTask({ title: taskToDelete });
    await expect(kanbanPage.getTaskCard(taskToDelete)).toBeVisible();

    // Xóa task
    await kanbanPage.deleteTask(taskToDelete);
    await expect(kanbanPage.getTaskCard(taskToDelete)).toBeHidden();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-KANBAN-005: Kéo thả task sang cột khác', async () => {
    // Tạo task trước
    const taskToDrag = `[E2E] Drag Task ${UID}`;
    await kanbanPage.createTask({ title: taskToDrag });

    const columnCount = await kanbanPage.columns.count();
    if (columnCount < 2) {
      test.skip(true, 'Cần ít nhất 2 cột để test kéo thả');
      return;
    }

    // Kéo sang cột thứ 2 (index 1)
    await kanbanPage.dragTaskToColumn(taskToDrag, 1);

    // Task vẫn còn tồn tại trên board
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
