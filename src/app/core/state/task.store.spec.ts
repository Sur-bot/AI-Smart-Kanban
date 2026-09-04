import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { TaskStore } from './task.store';
import { TaskService } from '../services/task.service';
import { ProjectService } from '../services/project.service';
import { AuthService } from '../auth/auth.service';
import { PermissionService } from '../services/permission.service';
import { MemberService } from '../services/member.service';
import { TaskItem, Project } from '../models/task.model';

// ─── Factory Helpers ──────────────────────────────────────────────────────────

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'proj-1',
    workspace_id: 'ws-1',
    name: 'Dự án test',
    status: 'active',
    owner_id: 'user-1',
    privacy: 'private',
    project_type: 'project',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function makeTask(overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    id: 'task-1',
    workspaceId: 'ws-1',
    projectId: 'proj-1',
    statusId: 'status-1',
    title: 'Task test',
    priority: 'medium',
    taskType: 'task',
    creatorId: 'user-1',
    assignees: [],
    labels: [],
    actualMinutes: 0,
    sortOrder: 0,
    boardColumnOrder: 0,
    checklistCount: 0,
    checklistDoneCount: 0,
    commentCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ─── Mock Services ────────────────────────────────────────────────────────────

function makeAuthServiceMock(isAuth = true, isGuest = false, userId = 'user-1') {
  const _isAuthenticated = signal(isAuth);
  return {
    isAuthenticated: _isAuthenticated,
    isGuestMode: vi.fn().mockReturnValue(isGuest),
    user: vi.fn().mockReturnValue({ id: userId }),
    // helper để test effect
    _setAuthenticated: (v: boolean) => _isAuthenticated.set(v),
  };
}

function makeTaskServiceMock() {
  return {
    getTasks: vi.fn().mockReturnValue(of({ tasks: [], total: 0, page: 1, limit: 20, totalPages: 0 })),
    createTask: vi.fn(),
    updateTask: vi.fn().mockReturnValue(of({})),
    deleteTask: vi.fn().mockReturnValue(of({})),
    getTaskById: vi.fn(),
    addComment: vi.fn(),
    toggleChecklistItem: vi.fn(),
    bulkMoveTasks: vi.fn().mockReturnValue(of({})),
  };
}

function makeProjectServiceMock() {
  return {
    getProjects: vi.fn().mockReturnValue(of([])),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn().mockReturnValue(of({ success: true })),
    archiveProject: vi.fn().mockReturnValue(of({})),
    getProjectStatuses: vi.fn().mockReturnValue(of([])),
    getMembers: vi.fn().mockReturnValue(of([])),
    addMember: vi.fn(),
    updateMemberRole: vi.fn(),
    removeMember: vi.fn(),
    transferOwnership: vi.fn(),
    generateInviteLink: vi.fn(),
    joinByInviteToken: vi.fn(),
  };
}

function makeMemberServiceMock() {
  return {
    getMembers: vi.fn().mockReturnValue(of([])),
  };
}

function makePermissionServiceMock() {
  return {
    setRole: vi.fn(),
    clear: vi.fn(),
    currentRole: signal(null),
    can: vi.fn().mockReturnValue(true),
  };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('TaskStore', () => {
  let store: TaskStore;
  let taskServiceMock: ReturnType<typeof makeTaskServiceMock>;
  let projectServiceMock: ReturnType<typeof makeProjectServiceMock>;
  let authServiceMock: ReturnType<typeof makeAuthServiceMock>;
  let permissionServiceMock: ReturnType<typeof makePermissionServiceMock>;
  let memberServiceMock: ReturnType<typeof makeMemberServiceMock>;

  beforeEach(() => {
    taskServiceMock = makeTaskServiceMock();
    projectServiceMock = makeProjectServiceMock();
    authServiceMock = makeAuthServiceMock();
    permissionServiceMock = makePermissionServiceMock();
    memberServiceMock = makeMemberServiceMock();

    TestBed.configureTestingModule({
      providers: [
        TaskStore,
        { provide: TaskService, useValue: taskServiceMock },
        { provide: ProjectService, useValue: projectServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: PermissionService, useValue: permissionServiceMock },
        { provide: MemberService, useValue: memberServiceMock },
      ],
    });
    store = TestBed.inject(TaskStore);
  });

  // ── Khởi tạo ────────────────────────────────────────────────────────────────

  describe('khởi tạo — giá trị mặc định của signals', () => {
    it('tasks = []', () => expect(store.tasks()).toEqual([]));
    it('projects = []', () => expect(store.projects()).toEqual([]));
    it('statuses = []', () => expect(store.statuses()).toEqual([]));
    it('currentProjectId = null', () => expect(store.currentProjectId()).toBeNull());
    it('selectedTask = null', () => expect(store.selectedTask()).toBeNull());
    it('loading = false', () => expect(store.loading()).toBe(false));
    it('projectsLoading = true', () => expect(store.projectsLoading()).toBe(true));
    it('isProjectsInitialized = false', () => expect(store.isProjectsInitialized()).toBe(false));
    it('error = null', () => expect(store.error()).toBeNull());
    it('filter = { role: "all" }', () => expect(store.filter()).toEqual({ role: 'all' }));
  });

  // ── Computed: totalTasks ──────────────────────────────────────────────────────

  describe('totalTasks computed', () => {
    it('= 0 khi tasks rỗng', () => {
      expect(store.totalTasks()).toBe(0);
    });

    it('= số lượng tasks hiện có', () => {
      store.tasks.set([makeTask({ id: 'a' }), makeTask({ id: 'b' }), makeTask({ id: 'c' })]);
      expect(store.totalTasks()).toBe(3);
    });
  });

  // ── Computed: currentProject ──────────────────────────────────────────────────

  describe('currentProject computed', () => {
    it('= null khi currentProjectId là null', () => {
      store.projects.set([makeProject()]);
      expect(store.currentProject()).toBeNull();
    });

    it('= null khi project với id đó không tồn tại', () => {
      store.projects.set([makeProject({ id: 'proj-1' })]);
      store.currentProjectId.set('non-existent');
      expect(store.currentProject()).toBeNull();
    });

    it('trả về đúng project khi id khớp', () => {
      const p = makeProject({ id: 'proj-abc', name: 'Project ABC' });
      store.projects.set([makeProject({ id: 'proj-1' }), p]);
      store.currentProjectId.set('proj-abc');
      expect(store.currentProject()).toEqual(p);
    });
  });

  // ── Computed: deadlineColumns ─────────────────────────────────────────────────

  describe('deadlineColumns computed', () => {
    it('luôn trả về 7 columns với đúng ids', () => {
      const columns = store.deadlineColumns();
      const ids = columns.map((c) => c.id);
      expect(ids).toEqual(['overdue', 'today', 'this-week', 'next-week', 'no-deadline', 'two-weeks', 'completed']);
    });

    it('task không có dueDate → nằm trong cột no-deadline', () => {
      store.tasks.set([makeTask({ id: 'task-no-due', dueDate: undefined })]);
      const noDeadline = store.deadlineColumns().find((c) => c.id === 'no-deadline');
      expect(noDeadline?.count).toBe(1);
      expect(noDeadline?.tasks[0].id).toBe('task-no-due');
    });

    it('task đã hoàn thành (completedAt) → cột completed', () => {
      store.tasks.set([
        makeTask({ id: 'done-task', completedAt: '2024-01-01T00:00:00Z' }),
      ]);
      const completed = store.deadlineColumns().find((c) => c.id === 'completed');
      expect(completed?.count).toBe(1);
      expect(completed?.tasks[0].stripeColor).toBe('col-purple');
    });

    it('task status.category = "done" → cột completed', () => {
      store.tasks.set([
        makeTask({
          id: 'done-status-task',
          status: { id: 's1', name: 'Done', color: 'green', category: 'done', sort_order: 0 },
        }),
      ]);
      const completed = store.deadlineColumns().find((c) => c.id === 'completed');
      expect(completed?.count).toBe(1);
    });

    it('task quá hạn → cột overdue với stripeColor col-red và timeLabel "Quá hạn"', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 2);
      store.tasks.set([makeTask({ id: 'overdue-task', dueDate: yesterday.toISOString() })]);
      const overdue = store.deadlineColumns().find((c) => c.id === 'overdue');
      expect(overdue?.count).toBe(1);
      expect(overdue?.tasks[0].stripeColor).toBe('col-red');
      expect(overdue?.tasks[0].timeLabel).toBe('Quá hạn');
    });

    it('task hôm nay → cột today với stripeColor col-green và timeLabel "Hôm nay"', () => {
      const todayNoon = new Date();
      todayNoon.setHours(12, 0, 0, 0);
      store.tasks.set([makeTask({ id: 'today-task', dueDate: todayNoon.toISOString() })]);
      const today = store.deadlineColumns().find((c) => c.id === 'today');
      expect(today?.count).toBe(1);
      expect(today?.tasks[0].timeLabel).toBe('Hôm nay');
    });

    it('tasks được sort theo boardColumnOrder trong mỗi cột', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 2);
      store.tasks.set([
        makeTask({ id: 'b', dueDate: yesterday.toISOString(), boardColumnOrder: 2 }),
        makeTask({ id: 'a', dueDate: yesterday.toISOString(), boardColumnOrder: 1 }),
      ]);
      const overdue = store.deadlineColumns().find((c) => c.id === 'overdue');
      expect(overdue?.tasks[0].id).toBe('a');
      expect(overdue?.tasks[1].id).toBe('b');
    });

    it('tasks rỗng → tất cả columns có count = 0', () => {
      store.tasks.set([]);
      const counts = store.deadlineColumns().map((c) => c.count);
      expect(counts.every((c) => c === 0)).toBe(true);
    });
  });

  // ── resetState() ──────────────────────────────────────────────────────────────

  describe('resetState()', () => {
    beforeEach(() => {
      // Đặt state có dữ liệu rồi mới reset
      store.tasks.set([makeTask()]);
      store.projects.set([makeProject()]);
      store.currentProjectId.set('proj-1');
      store.selectedTask.set(makeTask() as any);
      store.error.set('Lỗi nào đó');
      store.loading.set(true);
      store.isProjectsInitialized.set(true);
      store.projectsLoading.set(false);
    });

    it('sau resetState → tasks = []', () => {
      store.resetState();
      expect(store.tasks()).toEqual([]);
    });

    it('sau resetState → projects = []', () => {
      store.resetState();
      expect(store.projects()).toEqual([]);
    });

    it('sau resetState → currentProjectId = null', () => {
      store.resetState();
      expect(store.currentProjectId()).toBeNull();
    });

    it('sau resetState → selectedTask = null', () => {
      store.resetState();
      expect(store.selectedTask()).toBeNull();
    });

    it('sau resetState → error = null', () => {
      store.resetState();
      expect(store.error()).toBeNull();
    });

    it('sau resetState → loading = false', () => {
      store.resetState();
      expect(store.loading()).toBe(false);
    });

    it('sau resetState → projectsLoading = true', () => {
      store.resetState();
      expect(store.projectsLoading()).toBe(true);
    });

    it('sau resetState → isProjectsInitialized = false', () => {
      store.resetState();
      expect(store.isProjectsInitialized()).toBe(false);
    });

    it('gọi permissionService.clear()', () => {
      store.resetState();
      expect(permissionServiceMock.clear).toHaveBeenCalledOnce();
    });
  });

  // ── clearSelectedTask() ───────────────────────────────────────────────────────

  describe('clearSelectedTask()', () => {
    it('selectedTask về null', () => {
      store.selectedTask.set(makeTask() as any);
      store.clearSelectedTask();
      expect(store.selectedTask()).toBeNull();
    });
  });

  // ── loadTasks() ───────────────────────────────────────────────────────────────

  describe('loadTasks()', () => {
    it('không gọi taskService nếu projects rỗng và không có customFilter.projectId', () => {
      store.projects.set([]);
      store.loadTasks();
      expect(taskServiceMock.getTasks).not.toHaveBeenCalled();
      expect(store.tasks()).toEqual([]);
      expect(store.loading()).toBe(false);
    });

    it('gọi taskService.getTasks khi có projects', () => {
      store.projects.set([makeProject()]);
      store.currentProjectId.set('proj-1');
      const mockTasks = [makeTask()];
      taskServiceMock.getTasks.mockReturnValue(
        of({ tasks: mockTasks, total: 1, page: 1, limit: 20, totalPages: 1 })
      );
      store.loadTasks();
      expect(taskServiceMock.getTasks).toHaveBeenCalledOnce();
      expect(store.tasks()).toEqual(mockTasks);
      expect(store.loading()).toBe(false);
    });

    it('set error khi API lỗi', () => {
      store.projects.set([makeProject()]);
      taskServiceMock.getTasks.mockReturnValue(
        throwError(() => ({ error: { message: 'Server error' } }))
      );
      store.loadTasks();
      expect(store.error()).toBe('Server error');
      expect(store.loading()).toBe(false);
    });

    it('dùng fallback error message khi không có error.message', () => {
      store.projects.set([makeProject()]);
      taskServiceMock.getTasks.mockReturnValue(throwError(() => ({})));
      store.loadTasks();
      expect(store.error()).toBe('Không thể tải danh sách tác vụ');
    });
  });

  // ── updateTaskDueDate() ───────────────────────────────────────────────────────

  describe('updateTaskDueDate()', () => {
    it('cập nhật dueDate của task trong signal', () => {
      const newDue = '2025-12-31T00:00:00Z';
      store.tasks.set([makeTask({ id: 'task-1' })]);
      taskServiceMock.updateTask.mockReturnValue(of({}));
      store.updateTaskDueDate('task-1', newDue);
      expect(store.tasks()[0].dueDate).toBe(newDue);
    });

    it('truyền null → xóa dueDate (undefined)', () => {
      store.tasks.set([makeTask({ id: 'task-1', dueDate: '2025-01-01' })]);
      taskServiceMock.updateTask.mockReturnValue(of({}));
      store.updateTaskDueDate('task-1', null);
      expect(store.tasks()[0].dueDate).toBeUndefined();
    });
  });
});
