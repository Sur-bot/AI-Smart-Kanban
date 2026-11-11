import { test, expect } from '@playwright/test';
import { KanbanPage } from '../../pages/kanban.page';

import { createClient } from '@supabase/supabase-js';

const UID = Date.now().toString().slice(-6);
const TEST_PROJECT_TITLE = `[E2E] Project ${UID}`;
const INVITE_UUID = process.env.E2E_TEST_INVITE_UUID || '123e4567-e89b-12d3-a456-426614174000';

test.describe('Kanban — Project Management', () => {
  let kanbanPage: KanbanPage;

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
    kanbanPage = new KanbanPage(page);
    await kanbanPage.goto();
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-PROJ-001: Tạo dự án mới thành công', async ({ page }) => {
    await kanbanPage.createProject(TEST_PROJECT_TITLE);

    const projectInToolbar = page.locator('app-page-toolbar').getByText(TEST_PROJECT_TITLE);
    await expect(projectInToolbar).toBeVisible({ timeout: 10_000 });
  });

  // ────────────────────────────────────────────────────────────────────────────
  test('TC-PROJ-002: Mời thành viên vào dự án', async ({ page }) => {
    await kanbanPage.createProject(TEST_PROJECT_TITLE + ' Invite');

    // Wait for the new project to be selected in the toolbar
    await expect(page.locator('app-page-toolbar').getByText(TEST_PROJECT_TITLE + ' Invite')).toBeVisible({ timeout: 10_000 });

    if (INVITE_UUID === '123e4567-e89b-12d3-a456-426614174000') {
      console.warn('WARNING: Using fake INVITE_UUID. TC-PROJ-002 will fail at backend validation unless a real UUID is provided in .env.test');
    }

    await kanbanPage.inviteMemberToProject(INVITE_UUID);
  });
});
