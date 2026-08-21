import { Injectable, computed, inject, signal } from '@angular/core';
import { TaskService } from '../services/task.service';
import { ProjectService } from '../services/project.service';
import {
  TaskItem,
  TaskDetail,
  Project,
  TaskStatus,
  TaskFilterParams,
  CreateTaskPayload,
  UpdateTaskPayload
} from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskStore {
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);

  // ─── Signals ──────────────────────────────────────────
  readonly tasks = signal<TaskItem[]>([]);
  readonly selectedTask = signal<TaskDetail | null>(null);
  readonly projects = signal<Project[]>([]);
  readonly currentProjectId = signal<string | null>(null);
  readonly statuses = signal<TaskStatus[]>([]);
  readonly loading = signal<boolean>(false);
  readonly detailLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal<TaskFilterParams>({ role: 'all' });

  // ─── Computed Selectors ───────────────────────────────
  readonly totalTasks = computed(() => this.tasks().length);

  /**
   * Gom nhóm tác vụ theo Cột Hạn chót (Deadline View)
   */
  readonly deadlineColumns = computed(() => {
    const all = this.tasks();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    
    // Tuần này (đến Chủ nhật)
    const dayOfWeek = now.getDay(); // 0 = CN, 1 = T2
    const diffToSunday = (7 - dayOfWeek) % 7;
    const endOfWeek = new Date(todayStart.getTime() + (diffToSunday + 1) * 24 * 60 * 60 * 1000 - 1);
    const endOfNextWeek = new Date(endOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endOfTwoWeeks = new Date(endOfNextWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

    const overdue: TaskItem[] = [];
    const today: TaskItem[] = [];
    const thisWeek: TaskItem[] = [];
    const nextWeek: TaskItem[] = [];
    const twoWeeks: TaskItem[] = [];
    const noDeadline: TaskItem[] = [];
    const completed: TaskItem[] = [];

    all.forEach(task => {
      // Nếu đã hoàn thành
      if (task.completedAt || (task.status && task.status.category === 'done')) {
        completed.push({ ...task, stripeColor: 'col-purple' });
        return;
      }

      if (!task.dueDate) {
        noDeadline.push({ ...task, stripeColor: 'col-gray' });
        return;
      }

      const due = new Date(task.dueDate);

      if (due < todayStart) {
        // Quá hạn
        overdue.push({
          ...task,
          stripeColor: 'col-red',
          timeColor: 'red',
          timeLabel: 'Quá hạn'
        });
      } else if (due <= todayEnd) {
        // Hôm nay
        today.push({
          ...task,
          stripeColor: 'col-green',
          timeColor: 'green',
          timeLabel: 'Hôm nay'
        });
      } else if (due <= endOfWeek) {
        // Tuần này
        thisWeek.push({
          ...task,
          stripeColor: 'col-teal',
          timeColor: 'default',
          timeLabel: `${due.getDate()}/${due.getMonth() + 1}`
        });
      } else if (due <= endOfNextWeek) {
        // Tuần tới
        nextWeek.push({
          ...task,
          stripeColor: 'col-cyan',
          timeColor: 'default',
          timeLabel: `${due.getDate()}/${due.getMonth() + 1}`
        });
      } else if (due <= endOfTwoWeeks) {
        // 2 tuần nữa
        twoWeeks.push({
          ...task,
          stripeColor: 'col-blue',
          timeColor: 'default',
          timeLabel: `${due.getDate()}/${due.getMonth() + 1}`
        });
      } else {
        noDeadline.push({ ...task, stripeColor: 'col-gray' });
      }
    });

    const sortByOrder = (a: TaskItem, b: TaskItem) => a.boardColumnOrder - b.boardColumnOrder;

    return [
      { id: 'overdue', labelKey: 'TASKS_PAGE.DEADLINE.COL_OVERDUE', color: 'col-red', count: overdue.length, tasks: overdue.sort(sortByOrder) },
      { id: 'today', labelKey: 'TASKS_PAGE.DEADLINE.COL_TODAY', color: 'col-green', count: today.length, tasks: today.sort(sortByOrder) },
      { id: 'this-week', labelKey: 'TASKS_PAGE.DEADLINE.COL_THIS_WEEK', color: 'col-teal', count: thisWeek.length, tasks: thisWeek.sort(sortByOrder) },
      { id: 'next-week', labelKey: 'TASKS_PAGE.DEADLINE.COL_NEXT_WEEK', color: 'col-cyan', count: nextWeek.length, tasks: nextWeek.sort(sortByOrder) },
      { id: 'no-deadline', labelKey: 'TASKS_PAGE.DEADLINE.COL_NO_DEADLINE', color: 'col-gray', count: noDeadline.length, tasks: noDeadline.sort(sortByOrder) },
      { id: 'two-weeks', labelKey: 'TASKS_PAGE.DEADLINE.COL_TWO_WEEKS', color: 'col-blue', count: twoWeeks.length, tasks: twoWeeks.sort(sortByOrder) },
      { id: 'completed', labelKey: 'TASKS_PAGE.DEADLINE.COL_COMPLETED', color: 'col-purple', count: completed.length, tasks: completed.sort(sortByOrder) }
    ];
  });

  // ─── Actions ──────────────────────────────────────────

  /**
   * Tải danh sách tác vụ
   */
  loadTasks(customFilter?: TaskFilterParams) {
    this.loading.set(true);
    this.error.set(null);

    const mergedFilter: TaskFilterParams = {
      ...this.filter(),
      ...customFilter,
      projectId: this.currentProjectId() || undefined
    };

    this.taskService.getTasks(mergedFilter).subscribe({
      next: res => {
        this.tasks.set(res.tasks);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.error?.message || 'Không thể tải danh sách tác vụ');
        this.loading.set(false);
      }
    });
  }

  /**
   * Tải danh sách dự án
   */
  loadProjects() {
    this.projectService.getProjects().subscribe({
      next: projects => {
        this.projects.set(projects);
        if (projects.length > 0 && !this.currentProjectId()) {
          this.setCurrentProject(projects[0].id);
        }
      },
      error: err => {
        console.error('[TaskStore:loadProjects] Error:', err);
      }
    });
  }

  /**
   * Đổi dự án hiện tại
   */
  setCurrentProject(projectId: string) {
    this.currentProjectId.set(projectId);
    this.loadStatuses(projectId);
    this.loadTasks({ projectId });
  }

  /**
   * Tải danh sách trạng thái của dự án
   */
  loadStatuses(projectId: string) {
    this.projectService.getProjectStatuses(projectId).subscribe({
      next: statuses => {
        this.statuses.set(statuses);
      },
      error: err => {
        console.error('[TaskStore:loadStatuses] Error:', err);
      }
    });
  }

  /**
   * Tạo tác vụ mới
   */
  createTask(payload: CreateTaskPayload, callback?: (task: TaskItem) => void) {
    this.loading.set(true);
    const fullPayload: CreateTaskPayload = {
      ...payload,
      projectId: payload.projectId || this.currentProjectId() || undefined
    };

    this.taskService.createTask(fullPayload).subscribe({
      next: created => {
        this.tasks.update(list => [created, ...list]);
        this.loading.set(false);
        if (callback) callback(created);
      },
      error: err => {
        this.error.set(err.error?.message || 'Không thể tạo tác vụ');
        this.loading.set(false);
      }
    });
  }

  /**
   * Cập nhật tác vụ
   */
  updateTask(id: string, payload: UpdateTaskPayload) {
    this.taskService.updateTask(id, payload).subscribe({
      next: updated => {
        // Cập nhật trong danh sách
        this.tasks.update(list => list.map(t => t.id === id ? { ...t, ...updated } : t));
        // Cập nhật chi tiết nếu đang mở
        if (this.selectedTask()?.id === id) {
          this.selectedTask.set(updated);
        }
      },
      error: err => {
        this.error.set(err.error?.message || 'Không thể cập nhật tác vụ');
      }
    });
  }

  /**
   * Xóa tác vụ
   */
  deleteTask(id: string) {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks.update(list => list.filter(t => t.id !== id));
        if (this.selectedTask()?.id === id) {
          this.selectedTask.set(null);
        }
      },
      error: err => {
        this.error.set(err.error?.message || 'Không thể xóa tác vụ');
      }
    });
  }

  /**
   * Mở chi tiết tác vụ
   */
  selectTask(id: string) {
    this.detailLoading.set(true);
    this.taskService.getTaskById(id).subscribe({
      next: detail => {
        this.selectedTask.set(detail);
        this.detailLoading.set(false);
      },
      error: err => {
        console.error('[TaskStore:selectTask] Error:', err);
        this.detailLoading.set(false);
      }
    });
  }

  /**
   * Đóng modal chi tiết
   */
  clearSelectedTask() {
    this.selectedTask.set(null);
  }

  /**
   * Cập nhật thứ tự và trạng thái hàng loạt (Kéo thả Kanban)
   */
  updateTaskDueDate(taskId: string, newDueDate: string | undefined | null) {
    this.tasks.update(list => list.map(t => t.id === taskId ? { ...t, dueDate: newDueDate === null ? undefined : newDueDate } : t));
    this.taskService.updateTask(taskId, { dueDate: newDueDate === null ? undefined : newDueDate }).subscribe();
  }

  bulkMoveTasks(moves: { taskId: string, statusId?: string, boardColumnOrder: number }[]) {
    // Optimistic update
    this.tasks.update(list => {
      const listCopy = [...list];
      moves.forEach(move => {
        const idx = listCopy.findIndex(t => t.id === move.taskId);
        if (idx !== -1) {
          listCopy[idx] = {
            ...listCopy[idx],
            boardColumnOrder: move.boardColumnOrder,
            ...(move.statusId ? { statusId: move.statusId } : {})
          };
        }
      });
      return listCopy;
    });

    this.taskService.bulkMoveTasks(moves).subscribe({
      error: err => {
        this.error.set(err.error?.message || 'Không thể cập nhật thứ tự tác vụ');
        this.loadTasks(); // Rollback về trạng thái server
      }
    });
  }

  /**
   * Thêm bình luận
   */
  addComment(taskId: string, content: string) {
    this.taskService.addComment(taskId, content).subscribe({
      next: newComment => {
        const cur = this.selectedTask();
        if (cur && cur.id === taskId) {
          const comments = cur.comments || [];
          this.selectedTask.set({
            ...cur,
            comments: [...comments, newComment],
            commentCount: (cur.commentCount || 0) + 1
          });
        }
      }
    });
  }

  /**
   * Toggle Checklist Item
   */
  toggleChecklistItem(itemId: string, isDone: boolean) {
    this.taskService.toggleChecklistItem(itemId, isDone).subscribe({
      next: updatedItem => {
        const cur = this.selectedTask();
        if (cur && cur.checklists) {
          const newChecklists = cur.checklists.map(cl => ({
            ...cl,
            task_checklist_items: (cl.task_checklist_items || []).map(item =>
              item.id === itemId ? { ...item, is_done: isDone } : item
            )
          }));
          this.selectedTask.set({ ...cur, checklists: newChecklists });
        }
      }
    });
  }
}



