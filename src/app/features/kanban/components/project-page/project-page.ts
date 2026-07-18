import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageToolbarComponent } from '../../../../shared/components/page-layout/page-toolbar/page-toolbar';
import { ViewFilterBarComponent, QuickFilter } from '../../../../shared/components/page-layout/view-filter-bar/view-filter-bar';
import { DataTableComponent } from '../../../../shared/components/page-layout/data-table/data-table';
import { TaskItem, TaskViewMode } from '../../../../shared/models/task-list.model';

@Component({
  selector: 'app-project-page',
  standalone: true,
  imports: [
    CommonModule,
    PageToolbarComponent,
    ViewFilterBarComponent,
    DataTableComponent,
  ],
  templateUrl: './project-page.html',
  styleUrls: ['./project-page.scss'],
})
export class ProjectPageComponent {
  tasks: TaskItem[] = [];
  activeView: TaskViewMode = 'list';

  quickFilters: QuickFilter[] = [
    { id: 'overdue', label: 'Quá hạn', icon: 'clock', count: 0, isActive: false },
    { id: 'comments', label: 'Bình luận', icon: 'comment', count: 0, isActive: false },
    { id: 'markatread', label: 'Đánh dấu đã đọc', icon: 'eye', count: 0, isActive: false },
  ];

  projectSearchFilters = [
    { id: 'in_progress', label: 'Đang tiến hành' },
    { id: 'completed', label: 'Đã hoàn thành' },
    { id: 'delayed', label: 'Đang trì hoãn' },
    { id: 'overdue', label: 'Quá hạn' },
    { id: 'not_started', label: 'Chưa bắt đầu' },
  ];

  onViewChange(view: TaskViewMode) {
    this.activeView = view;
  }
}
