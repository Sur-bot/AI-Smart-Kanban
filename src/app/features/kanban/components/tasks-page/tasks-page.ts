import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageToolbarComponent } from '../../../../shared/components/page-layout/page-toolbar/page-toolbar';
import { ViewFilterBarComponent, QuickFilter } from '../../../../shared/components/page-layout/view-filter-bar/view-filter-bar';
import { DataTableComponent } from '../../../../shared/components/page-layout/data-table/data-table';
import { DeadlineComponent } from './deadline/deadline';
import { TaskDetailModalComponent } from '../task-detail-modal/task-detail-modal';
import { TaskItem, TaskViewMode, ViewTab } from '../../../../shared/models/task-list.model';
import { Task } from '../../models/kanban.model';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [
    CommonModule,
    PageToolbarComponent,
    ViewFilterBarComponent,
    DataTableComponent,
    DeadlineComponent,
    TaskDetailModalComponent,
  ],
  templateUrl: './tasks-page.html',
  styleUrls: ['./tasks-page.scss'],
})
export class TasksPageComponent {
  tasks: TaskItem[] = [];
  activeView: TaskViewMode = 'list';
  selectedTask: Task | null = null;

  viewTabs: ViewTab[] = [
    { id: 'list', label: 'Danh sách' },
    { id: 'deadline', label: 'Hạn chót' },
    { id: 'planner', label: 'Trình lập kế hoạch' },
    { id: 'calendar', label: 'Lịch' },
    { id: 'gantt', label: 'Gantt' },
  ];

  quickFilters: QuickFilter[] = [
    { id: 'conversations', label: 'Cuộc trò chuyện tác vụ', icon: 'chat', count: 3, isActive: false, rightBarFeatureId: 'task_chat' },
    { id: 'overdue', label: 'Quá hạn', icon: 'clock', count: 0, isActive: false },
    { id: 'comments', label: 'Bình luận', icon: 'comment', count: 12, isActive: false },
  ];

  onViewChange(view: TaskViewMode) {
    this.activeView = view;
  }

  openTaskDetail(task: Task) {
    this.selectedTask = task;
  }

  closeTaskDetail() {
    this.selectedTask = null;
  }
}
