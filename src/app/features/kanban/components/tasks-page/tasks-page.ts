import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksToolbarComponent } from './tasks-toolbar/tasks-toolbar';
import { TasksFilterBarComponent } from './tasks-filter-bar/tasks-filter-bar';
import { TasksTableComponent } from './tasks-table/tasks-table';
import { DeadlineComponent } from './tasks-filter-bar/deadline/deadline';
import { TaskItem, TaskViewMode } from '../../models/task-list.model';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [
    CommonModule,
    TasksToolbarComponent,
    TasksFilterBarComponent,
    TasksTableComponent,
    DeadlineComponent,
  ],
  templateUrl: './tasks-page.html',
  styleUrls: ['./tasks-page.scss'],
})
export class TasksPageComponent {
  /** Danh sách tác vụ — để trống theo yêu cầu (hiển thị empty state) */
  tasks: TaskItem[] = [];

  /** Chế độ xem hiện tại — được chia sẻ từ filter-bar */
  activeView: TaskViewMode = 'list';

  onViewChange(view: TaskViewMode) {
    this.activeView = view;
  }
}
