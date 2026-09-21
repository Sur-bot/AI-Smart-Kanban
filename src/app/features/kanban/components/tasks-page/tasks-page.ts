import { Component, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { PageToolbarComponent } from '../../../../shared/components/page-layout/page-toolbar/page-toolbar';
import { ViewFilterBarComponent, QuickFilter } from '../../../../shared/components/page-layout/view-filter-bar/view-filter-bar';
import { DataTableComponent } from '../../../../shared/components/page-layout/data-table/data-table';
import { DeadlineComponent } from './deadline/deadline';
import { TaskDetailModalComponent } from '../task-detail-modal/task-detail-modal';
import { CreateProjectModalComponent } from '../create-project-modal/create-project-modal';
import { BatchEditModalComponent } from '../batch-edit-modal/batch-edit-modal';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner';
import { TaskViewMode, ViewTab } from '../../../../shared/models/task-list.model';
import { TaskItem } from '../../../../core/models/task.model';
import { TaskStore } from '../../../../core/state/task.store';
import { PermissionService } from '../../../../core/services/permission.service';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    PageToolbarComponent,
    ViewFilterBarComponent,
    DataTableComponent,
    DeadlineComponent,
    TaskDetailModalComponent,
  ],
  templateUrl: './tasks-page.html',
  styleUrls: ['./tasks-page.scss'],
})
export class TasksPageComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  readonly taskStore = inject(TaskStore);
  readonly permissionService = inject(PermissionService);

  activeView: TaskViewMode = 'list';
  selectedTask: TaskItem | any = null;

  constructor() {
    effect(() => {
      const project = this.taskStore.currentProject();
      if (project) {
        this.titleService.setTitle(`${project.name} - AI Smart Kanban`);
      } else {
        this.titleService.setTitle('Tác vụ của tôi - AI Smart Kanban');
      }
    });
  }

  viewTabs: ViewTab[] = [
    { id: 'list', label: 'Danh sách' },
    { id: 'deadline', label: 'Hạn chót' },
    { id: 'planner', label: 'Trình lập kế hoạch' },
    { id: 'calendar', label: 'Lịch' },
    { id: 'gantt', label: 'Gantt' },
  ];

  quickFilters: QuickFilter[] = [
    { id: 'conversations', label: 'Cuộc trò chuyện tác vụ', icon: 'chat', count: 0, isActive: false, rightBarFeatureId: 'task_chat' },
    { id: 'overdue', label: 'Quá hạn', icon: 'clock', count: 0, isActive: false },
    { id: 'comments', label: 'Bình luận', icon: 'comment', count: 0, isActive: false },
  ];

  get tasks() {
    return this.taskStore.tasks() as any;
  }

  get pageTitle(): string {
    const project = this.taskStore.currentProject();
    return project?.name || 'Tác vụ của tôi';
  }

  ngOnInit() {
    // Nếu chưa load projects thì fetch
    if (!this.taskStore.isProjectsInitialized()) {
      this.taskStore.loadProjects();
    }

    this.route.queryParams.subscribe(params => {
      if (params['view'] && ['list', 'deadline', 'planner', 'calendar', 'gantt'].includes(params['view'])) {
        this.activeView = params['view'] as TaskViewMode;
      } else if (!params['view']) {
        this.activeView = 'list';
      }
    });
  }

  onViewChange(view: TaskViewMode) {
    this.activeView = view;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view },
      queryParamsHandling: 'merge',
    });
  }

  openTaskDetail(task: TaskItem) {
    this.selectedTask = task;
    this.taskStore.selectTask(task.id);
  }

  handleBatchAction(event: { action: string; itemIds: string[]; applyToAll: boolean }) {
    if (event.action === 'XOÁ') {
      this.taskStore.bulkDeleteTasks(event.itemIds);
    } else if (event.action === 'MỞ') {
      const firstId = event.itemIds[0];
      const task = this.tasks.find((t: any) => t.id === firstId);
      if (task) {
        this.openTaskDetail(task);
      }
    } else if (event.action === 'SỬA') {
      const dialogRef = this.dialog.open(BatchEditModalComponent, {
        panelClass: 'custom-dialog-container',
        backdropClass: 'custom-backdrop',
        autoFocus: false,
        data: { taskIds: event.itemIds, count: event.itemIds.length }
      });
    } else {
      console.log('Chưa hỗ trợ batch action:', event.action, event.itemIds);
    }
  }

  openCreateProject() {
    this.dialog.open(CreateProjectModalComponent, {
      panelClass: 'custom-dialog-container',
      backdropClass: 'custom-backdrop',
      autoFocus: false,
      restoreFocus: true,
      hasBackdrop: true,
      disableClose: false,
    });
  }

  closeTaskDetail() {
    this.selectedTask = null;
    this.taskStore.clearSelectedTask();
  }
}

