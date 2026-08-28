import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from '../../../core/config/menu.config';
import { MatIconModule } from '@angular/material/icon';
import { PermissionService } from '../../../core/services/permission.service';
import { TaskStore } from '../../../core/state/task.store';
import { MatDialog } from '@angular/material/dialog';
import { MemberManagementModalComponent } from '../../../features/kanban/components/member-management-modal/member-management-modal';

@Component({
  selector: 'app-collaboration',
  templateUrl: './collaboration.html',
  styleUrls: ['./collaboration.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule
  ],
})
export class CollaborationComponent {
  /** Danh sách các mục con của Hợp tác */
  @Input() children: MenuItem[] = [];

  /** Trạng thái mở rộng submenu */
  @Input() isExpanded = true;

  /** Trạng thái đang hiển thị các mục con */
  @Input() isOpen = true;

  readonly permissionService = inject(PermissionService);
  readonly taskStore = inject(TaskStore);
  private dialog = inject(MatDialog);

  /** Kiểm tra mục con có được phép hiển thị không */
  canShowChild(child: MenuItem): boolean {
    if (!child.requiredPermission) {
      return true;
    }
    // Cần có dự án đang hoạt động và người dùng có quyền tương ứng
    if (!this.taskStore.currentProjectId()) {
      return false;
    }
    return this.permissionService.can(child.requiredPermission);
  }

  onChildClick(child: MenuItem, event: Event) {
    if (child.action === 'manage-members') {
      event.preventDefault();
      const currentProjectId = this.taskStore.currentProjectId();
      if (!currentProjectId) {
        alert('Vui lòng chọn một dự án trước khi quản lý thành viên.');
        return;
      }
      if (!this.permissionService.can('member.invite')) {
        alert('Bạn không có quyền quản lý thành viên trên dự án này.');
        return;
      }
      this.dialog.open(MemberManagementModalComponent, {
        width: '600px',
        panelClass: 'custom-dialog-container',
        autoFocus: false
      });
    }
  }
}
