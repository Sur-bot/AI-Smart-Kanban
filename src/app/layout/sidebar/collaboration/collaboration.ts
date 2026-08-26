import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from '../../../core/config/menu.config';
import { MatIconModule } from '@angular/material/icon';
import { inject } from '@angular/core';
import { PermissionService } from '../../../core/services/permission.service';
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
  private dialog = inject(MatDialog);

  onChildClick(child: MenuItem, event: Event) {
    if (child.action === 'manage-members') {
      event.preventDefault();
      this.dialog.open(MemberManagementModalComponent, {
        width: '600px',
        panelClass: 'custom-dialog-container',
        autoFocus: false
      });
    }
  }
}
