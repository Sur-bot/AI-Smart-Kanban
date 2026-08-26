import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TaskItem, TaskLabel, UserSummary } from '../../../../core/models/task.model';
import { PermissionService } from '../../../../core/services/permission.service';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.html',
  styleUrls: ['./task-card.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, DatePipe, SlicePipe]
})
export class TaskCardComponent {
  @Input() task!: TaskItem;

  readonly permissionService = inject(PermissionService);

  @Output() cardClicked = new EventEmitter<TaskItem>();
  @Output() taskStarted = new EventEmitter<TaskItem>();
  @Output() taskCompleted = new EventEmitter<TaskItem>();
  @Output() taskMuted = new EventEmitter<TaskItem>();

  private readonly MAX_LABELS = 3;
  private readonly MAX_ASSIGNEES = 3;

  // ── Priority ──────────────────────────────────────────
  get priorityLabel(): string {
    const map: Record<string, string> = {
      urgent: 'Urgent',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      none: ''
    };
    return map[this.task.priority] ?? '';
  }

  // ── Task Type icon ─────────────────────────────────────
  get taskTypeIcon(): string {
    const map: Record<string, string> = {
      bug: 'bug_report',
      story: 'auto_stories',
      epic: 'bolt',
      feature: 'star',
      milestone: 'flag',
      task: 'task_alt'
    };
    return map[this.task.taskType] ?? 'task_alt';
  }

  // ── Labels ─────────────────────────────────────────────
  get visibleLabels(): TaskLabel[] {
    return (this.task.labels ?? []).slice(0, this.MAX_LABELS);
  }

  get extraLabelCount(): number {
    const total = (this.task.labels ?? []).length;
    return total > this.MAX_LABELS ? total - this.MAX_LABELS : 0;
  }

  // ── Assignees ──────────────────────────────────────────
  get visibleAssignees(): UserSummary[] {
    return (this.task.assignees ?? []).slice(0, this.MAX_ASSIGNEES);
  }

  get extraAssigneeCount(): number {
    const total = (this.task.assignees ?? []).length;
    return total > this.MAX_ASSIGNEES ? total - this.MAX_ASSIGNEES : 0;
  }

  // ── Due Date ───────────────────────────────────────────
  get isOverdue(): boolean {
    if (!this.task.dueDate || this.task.completedAt) return false;
    return new Date(this.task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
  }

  get isDueToday(): boolean {
    if (!this.task.dueDate) return false;
    const due = new Date(this.task.dueDate);
    const today = new Date();
    return due.getDate() === today.getDate()
      && due.getMonth() === today.getMonth()
      && due.getFullYear() === today.getFullYear();
  }

  // ── Status ─────────────────────────────────────────────
  get isStarted(): boolean {
    return this.task.status?.category === 'in_progress';
  }

  // ── Events ─────────────────────────────────────────────
  onCardClick(): void {
    this.cardClicked.emit(this.task);
  }

  onStart(event: MouseEvent): void {
    event.stopPropagation();
    this.taskStarted.emit(this.task);
  }

  onComplete(event: MouseEvent): void {
    event.stopPropagation();
    this.taskCompleted.emit(this.task);
  }

  onMute(event: MouseEvent): void {
    event.stopPropagation();
    this.taskMuted.emit(this.task);
  }
}
