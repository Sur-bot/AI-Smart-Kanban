import { test, expect } from '@playwright/test';
import { KanbanPage } from '../../pages/kanban.page';

const UID = Date.now().toString().slice(-6);
const TEST_PROJECT_TITLE = `[E2E] Project ${UID}`;
const INVITE_EMAIL = `test_invite_${UID}@example.com`;

test.describe('Kanban — Project Management', () => {
  let kanbanPage: KanbanPage;

  test.beforeEach(async ({ page }) => {
    kanbanPage = new KanbanPage(page);
    await kanbanPage.goto();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-PROJ-001: Tạo dự án mới thành công', async ({ page }) => {
    await kanbanPage.createProject(TEST_PROJECT_TITLE);

    const projectInSidebar = page.getByText(TEST_PROJECT_TITLE).first();
    await expect(projectInSidebar).toBeVisible({ timeout: 10_000 });
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-PROJ-002: Mời thành viên vào dự án', async ({ page }) => {
    await kanbanPage.createProject(TEST_PROJECT_TITLE + ' Invite');

    await page.waitForURL(/\/kanban\/projects\/.+/);

    await kanbanPage.inviteMemberToProject(INVITE_EMAIL);

    const toastMessage = page.getByText(/đã gửi lời mời|thành công/i).first();
    await expect(toastMessage).toBeVisible({ timeout: 10_000 });
  });
});
