import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageToolbarComponent, ToolbarField } from '../../../../shared/components/page-layout/page-toolbar/page-toolbar';
import { ViewFilterBarComponent, QuickFilter } from '../../../../shared/components/page-layout/view-filter-bar/view-filter-bar';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner';
import { ProjectDataTableComponent } from './project-data-table/project-data-table';
import { MemberManagementModalComponent } from '../member-management-modal/member-management-modal';
import { CreateProjectModalComponent } from '../create-project-modal/create-project-modal';
import { AuthService } from '../../../../core/auth/auth.service';
import { TaskStore } from '../../../../core/state/task.store';
import { Project } from '../../../../core/models/task.model';
import { TaskViewMode } from '../../../../shared/models/task-list.model';

@Component({
  selector: 'app-project-page',
  standalone: true,
  imports: [
    CommonModule,
    PageToolbarComponent,
    ViewFilterBarComponent,
    LoadingSpinnerComponent,
    ProjectDataTableComponent,
  ],
  templateUrl: './project-page.html',
  styleUrls: ['./project-page.scss'],
})
export class ProjectPageComponent implements OnInit {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  readonly taskStore = inject(TaskStore);

  activeView: TaskViewMode = 'list';

  get currentUserId(): string | null {
    return this.authService.user()?.id || null;
  }

  quickFilters: QuickFilter[] = [
    { id: 'overdue', label: 'Quá hạn', icon: 'clock', count: 0, isActive: false },
    { id: 'comments', label: 'Bình luận', icon: 'comment', count: 0, isActive: false },
    { id: 'markallread', label: 'Đánh dấu đã đọc tất cả', icon: 'eye', count: 0, isActive: false },
  ];

  projectFields: ToolbarField[] = [
    { id: 'id', label: 'ID', checked: false, type: 'text' },
    { id: 'name', label: 'Tên', checked: true, type: 'text', isDefault: true },
    { id: 'owner', label: 'Chủ sở hữu / Giám sát viên', checked: false, type: 'select' },
    { id: 'participants', label: 'Thành viên', checked: true, type: 'tags', isDefault: true, options: ['Văn Anh Nguyễn'] },
    { id: 'keywords', label: 'Các từ khoá', checked: false, type: 'text' },
    { id: 'visible_to_all', label: 'Hiển thị cho tất cả mọi người', checked: false, type: 'select' },
    { id: 'public', label: 'Công khai', checked: false, type: 'select' },
    { id: 'archived', label: 'Lưu trữ', checked: false, type: 'select' },
    { id: 'date', label: 'Ngày bắt đầu và kết thúc', checked: false, type: 'date' },
    { id: 'bitrix_sites', label: 'Đăng trên Bitrix24 Sites', checked: false, type: 'select' },
    { id: 'favorite', label: 'Ưa thích', checked: false, type: 'select' },
    { id: 'urgent', label: 'Bao gồm các tác vụ khẩn cấp', checked: false, type: 'select' },
  ];

  ngOnInit() {
    if (!this.taskStore.isProjectsInitialized()) {
      this.taskStore.loadProjects();
    }
  }

  onViewChange(view: TaskViewMode) {
    this.activeView = view;
  }

  /**
   * Khi click vào Tên dự án -> Chuyển hướng sang trang Tác vụ (Danh sách / Kanban)
   */
  onProjectSelect(project: Project) {
    this.taskStore.setCurrentProject(project.id);
    this.router.navigate(['/kanban'], { queryParams: { view: 'list' } });
  }

  /**
   * Mở modal quản lý thành viên của dự án
   */
  openMemberModal(project: Project) {
    this.taskStore.setCurrentProject(project.id);
    this.dialog.open(MemberManagementModalComponent, {
      width: '560px',
      panelClass: 'custom-dialog-container',
      autoFocus: false,
    });
  }

  /**
   * Mở modal chỉnh sửa dự án
   */
  openEditProject(project: Project) {
    this.taskStore.setCurrentProject(project.id);
    this.dialog.open(CreateProjectModalComponent, {
      width: '500px',
      panelClass: 'custom-dialog-container',
      autoFocus: false,
    });
  }

  /**
   * Xử lý hành động hàng loạt
   */
  onBatchAction(event: { action: string; projectIds: string[]; applyToAll: boolean }) {
    const { action, projectIds } = event;
    if (projectIds.length === 0) return;

    switch (action) {
      case 'Xóa':
        projectIds.forEach(id => this.taskStore.deleteProject(id));
        break;
      case 'Lưu trữ':
        projectIds.forEach(id => this.taskStore.archiveProject(id));
        break;
      case 'Kích hoạt lại':
        projectIds.forEach(id => this.taskStore.updateProject(id, { status: 'active' }));
        break;
      case 'Thay đổi quyền riêng tư':
        projectIds.forEach(id => {
          const p = this.taskStore.projects().find(item => item.id === id);
          if (p) {
            this.taskStore.updateProject(id, { is_public: !p.is_public });
          }
        });
        break;
    }
  }
}

