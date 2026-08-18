import { Component, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { QuickTaskInputComponent } from './quick-task-input/quick-task-input';
import { TaskCardComponent } from '../../../components/task-card/task-card';
import { TaskStore } from '../../../../../core/state/task.store';
import { TaskItem } from '../../../../../core/models/task.model';

@Component({
  selector: 'app-deadline',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe, QuickTaskInputComponent, TaskCardComponent],
  templateUrl: './deadline.html',
  styleUrls: ['./deadline.scss'],
})
export class DeadlineComponent implements OnInit {
  readonly taskStore = inject(TaskStore);

  @Output() taskSelected = new EventEmitter<TaskItem>();

  activeQuickTaskCol: string | null = null;

  get columns() {
    return this.taskStore.deadlineColumns();
  }

  ngOnInit() {
    this.taskStore.loadProjects();
    this.taskStore.loadTasks();
  }

  isEmpty(): boolean {
    const noTasks = this.columns.every(col => col.tasks.length === 0);
    return noTasks && !this.activeQuickTaskCol;
  }

  openQuickTask(colId: string, event: MouseEvent) {
    event.stopPropagation();
    this.activeQuickTaskCol = colId;
  }

  closeQuickTask() {
    this.activeQuickTaskCol = null;
  }

  onQuickTaskCreate(taskTitle: string, colId: string) {
    if (!taskTitle || !taskTitle.trim()) return;

    let dueDate: string | undefined = undefined;
    const now = new Date();

    if (colId === 'today') {
      dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
    } else if (colId === 'this-week') {
      const day = now.getDay();
      const diffToFriday = (5 - day + 7) % 7 || 7;
      const friday = new Date(now.getTime() + diffToFriday * 24 * 60 * 60 * 1000);
      dueDate = new Date(friday.getFullYear(), friday.getMonth(), friday.getDate(), 18, 0, 0).toISOString();
    } else if (colId === 'next-week') {
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      dueDate = new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 18, 0, 0).toISOString();
    } else if (colId === 'two-weeks') {
      const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      dueDate = new Date(twoWeeks.getFullYear(), twoWeeks.getMonth(), twoWeeks.getDate(), 18, 0, 0).toISOString();
    }

    this.taskStore.createTask({
      title: taskTitle.trim(),
      dueDate: dueDate,
      priority: 'medium'
    });

    this.closeQuickTask();
  }

  onTaskClick(task: TaskItem) {
    this.taskStore.selectTask(task.id);
    this.taskSelected.emit(task);
  }

  onTaskStart(task: TaskItem) {
    const inProgressStatus = this.taskStore.statuses().find(s => s.category === 'in_progress');
    if (inProgressStatus) {
      this.taskStore.updateTask(task.id, { statusId: inProgressStatus.id });
    }
  }

  onTaskComplete(task: TaskItem) {
    const doneStatus = this.taskStore.statuses().find(s => s.category === 'done');
    if (doneStatus) {
      this.taskStore.updateTask(task.id, { statusId: doneStatus.id });
    }
  }
}
