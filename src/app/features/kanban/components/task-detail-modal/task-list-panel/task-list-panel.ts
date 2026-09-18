import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskStore } from '../../../../../core/state/task.store';
import { TaskItem, TaskPriority, StatusCategory } from '../../../../../core/models/task.model';
import { JobRoleBadgeComponent } from '../../../../../shared/components/job-role-badge/job-role-badge';
import { TaskPipelineStatusComponent } from './task-pipeline-status/task-pipeline-status';

interface PriorityConfig {
  icon: string;
  color: string;
  label: string;
}

/** 1 estimate = 4 hours = 240 minutes */
const MINUTES_PER_ESTIMATE = 240;

const PRIORITY_CONFIG: Record<TaskPriority, PriorityConfig> = {
  urgent: { icon: 'local_fire_department',      color: '#dc2626', label: 'Urgent' },
  high:   { icon: 'keyboard_double_arrow_up',   color: '#ea580c', label: 'High'   },
  medium: { icon: 'drag_handle',                color: '#d97706', label: 'Medium' },
  low:    { icon: 'keyboard_double_arrow_down', color: '#2563eb', label: 'Low'    },
  none:   { icon: 'remove',                     color: '#94a3b8', label: 'None'   },
};

/** Icon và màu tương ứng cho từng category của status */
const STATUS_CATEGORY_CONFIG: Record<StatusCategory, { icon: string; color: string; label: string }> = {
  todo:        { icon: 'radio_button_unchecked', color: '#94a3b8', label: 'To Do'       },
  in_progress: { icon: 'timelapse',              color: '#3b82f6', label: 'In Progress' },
  review:      { icon: 'rate_review',            color: '#f59e0b', label: 'Review'      },
  done:        { icon: 'check_circle',           color: '#10b981', label: 'Done'        },
  cancelled:   { icon: 'cancel',                 color: '#6b7280', label: 'Cancelled'   },
};

@Component({
  selector: 'app-task-list-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule, JobRoleBadgeComponent, TaskPipelineStatusComponent],
  templateUrl: './task-list-panel.html',
  styleUrls: ['./task-list-panel.scss'],
})
export class TaskListPanelComponent {
  private readonly taskStore = inject(TaskStore);

  /** ID của task đang được mở ở right-panel (để highlight active) */
  @Input() activeTaskId: string | null = null;

  /** Emit khi người dùng click chọn một task khác */
  @Output() taskSelected = new EventEmitter<TaskItem>();

  /** Từ khoá tìm kiếm */
  readonly searchQuery = signal<string>('');

  /** Danh sách task được lọc theo searchQuery */
  readonly filteredTasks = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const tasks = this.taskStore.tasks();
    if (!query) return tasks;
    return tasks.filter(
      t =>
        t.title.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
    );
  });

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  onTaskClick(task: TaskItem): void {
    this.taskSelected.emit(task);
  }

  getPriorityConfig(priority: TaskPriority | string | undefined): PriorityConfig {
    return PRIORITY_CONFIG[(priority as TaskPriority) ?? 'none'] ?? PRIORITY_CONFIG['none'];
  }

  getStatusCategoryConfig(category: StatusCategory | string | undefined) {
    return STATUS_CATEGORY_CONFIG[(category as StatusCategory) ?? 'todo']
        ?? STATUS_CATEGORY_CONFIG['todo'];
  }

  /**
   * Trả về ngắn gọn task ID để hiển thị (VD: "XCOR-1234")
   * Nếu id là UUID thì cắt 8 ký tự đầu
   */
  getShortId(task: TaskItem): string {
    const id = task.id ?? '';
    if (/^[A-Z]+-\d+$/i.test(id)) return id.toUpperCase();
    return '#' + id.slice(0, 8).toUpperCase();
  }

  /**
   * Format due date → "Sep 12", "Oct 3", ...
   */
  formatDueDate(dueDate: string | undefined): string | null {
    if (!dueDate) return null;
    const d = new Date(dueDate);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  /**
   * Kiểm tra xem task có bị quá hạn không
   */
  isOverdue(dueDate: string | undefined, task: TaskItem): boolean {
    if (!dueDate || task.completedAt || task.status?.category === 'done') return false;
    return new Date(dueDate) < new Date();
  }

  /**
   * Hiển thị số estimates.
   * Ưu tiên storyPoints nếu có, fallback sang estimatedMinutes / 240.
   * 1 estimate = 4 giờ = 240 phút.
   */
  getEstimateDisplay(task: TaskItem): string | null {
    if (task.storyPoints != null && task.storyPoints > 0) {
      return String(task.storyPoints);
    }
    if (task.estimatedMinutes && task.estimatedMinutes > 0) {
      const estimates = Math.round(task.estimatedMinutes / MINUTES_PER_ESTIMATE);
      return estimates > 0 ? String(estimates) : null;
    }
    return null;
  }

  getEstimateTooltip(task: TaskItem): string {
    if (task.storyPoints != null && task.storyPoints > 0) {
      const hours = task.storyPoints * 4;
      return `${task.storyPoints} estimate${task.storyPoints > 1 ? 's' : ''} (~${hours}h)`;
    }
    if (task.estimatedMinutes && task.estimatedMinutes > 0) {
      const estimates = Math.round(task.estimatedMinutes / MINUTES_PER_ESTIMATE);
      const hours = task.estimatedMinutes / 60;
      return `${estimates} estimate${estimates > 1 ? 's' : ''} (~${hours.toFixed(1)}h | 1 est = 4h)`;
    }
    return 'Chưa có estimate';
  }

  getVisibleAssignees(task: TaskItem, max = 2) {
    return (task.assignees ?? []).slice(0, max);
  }

  getExtraAssigneeCount(task: TaskItem, max = 2): number {
    return Math.max(0, (task.assignees?.length ?? 0) - max);
  }

  getInitials(name: string): string {
    return (name ?? '?')
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  trackById(_index: number, task: TaskItem): string {
    return task.id;
  }
}
