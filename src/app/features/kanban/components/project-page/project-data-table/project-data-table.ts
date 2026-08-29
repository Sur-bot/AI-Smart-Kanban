import { Component, Input, Output, EventEmitter, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Project } from '../../../../../core/models/task.model';
import { PermissionService } from '../../../../../core/services/permission.service';

export interface ProjectTableColumn {
  id: string;
  label: string;
  width: number;
  sortable?: boolean;
  hasDropdown?: boolean;
}

@Component({
  selector: 'app-project-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, DragDropModule],
  templateUrl: './project-data-table.html',
  styleUrls: ['./project-data-table.scss'],
})
export class ProjectDataTableComponent {
  private cdr = inject(ChangeDetectorRef);
  readonly permissionService = inject(PermissionService);

  @Input() projects: Project[] = [];
  @Input() currentUserId: string | null = null;

  @Output() projectSelected = new EventEmitter<Project>();
  @Output() memberManage = new EventEmitter<Project>();
  @Output() projectEdit = new EventEmitter<Project>();
  @Output() batchAction = new EventEmitter<{ action: string; projectIds: string[]; applyToAll: boolean }>();

  selectedIds = new Set<string>();
  applyToAll: boolean = false;
  showApplyAllModal: boolean = false;
  selectedAction: string = '';
  pageSize: number = 50;
  readonly pageSizeOptions: number[] = [5, 10, 20, 50];

  nameColumn: ProjectTableColumn = { id: 'name', label: 'Tên', width: 280, sortable: true, hasDropdown: true };

  draggableColumns: ProjectTableColumn[] = [
    { id: 'id', label: 'ID', width: 100, sortable: true },
    { id: 'activity', label: 'Hoạt động', width: 150, sortable: true },
    { id: 'performance', label: 'Performance', width: 140, sortable: true },
    { id: 'members', label: 'Xem các thành viên', width: 190, sortable: false },
    { id: 'role', label: 'Vai trò', width: 130, sortable: true },
    { id: 'privacy', label: 'Quyền riêng tư', width: 150, sortable: true },
  ];

  get allColumns(): ProjectTableColumn[] {
    return [this.nameColumn, ...this.draggableColumns];
  }

  readonly actionOptions: string[] = [
    'Thêm vào ưa thích',
    'Xóa khỏi ưa thích',
    'Lưu trữ',
    'Kích hoạt lại',
    'Thay đổi quyền riêng tư',
    'Xóa'
  ];

  private resizingCol: ProjectTableColumn | null = null;
  private startX: number = 0;
  private startWidth: number = 0;

  get isAllSelected(): boolean {
    return this.projects.length > 0 && this.selectedIds.size === this.projects.length;
  }

  get isIndeterminate(): boolean {
    return this.selectedIds.size > 0 && this.selectedIds.size < this.projects.length;
  }

  toggleSelectAll(checked: boolean) {
    if (checked) {
      this.projects.forEach(p => this.selectedIds.add(p.id));
    } else {
      this.selectedIds.clear();
    }
  }

  toggleRowSelection(project: Project, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    if (this.selectedIds.has(project.id)) {
      this.selectedIds.delete(project.id);
    } else {
      this.selectedIds.add(project.id);
    }
  }

  isRowSelected(project: Project): boolean {
    return this.selectedIds.has(project.id);
  }

  onTitleClick(project: Project, event: MouseEvent) {
    event.stopPropagation();
    this.projectSelected.emit(project);
  }

  onEditClick(project: Project, event: MouseEvent) {
    event.stopPropagation();
    this.projectEdit.emit(project);
  }

  onMemberClick(project: Project, event: MouseEvent) {
    event.stopPropagation();
    this.memberManage.emit(project);
  }

  onApplyBatchAction() {
    if (this.selectedIds.size === 0 || !this.selectedAction) return;
    this.batchAction.emit({
      action: this.selectedAction,
      projectIds: Array.from(this.selectedIds),
      applyToAll: this.applyToAll
    });
  }

  onApplyAllCheckboxClick(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.showApplyAllModal = true;
    } else {
      this.applyToAll = false;
    }
  }

  confirmApplyAll() {
    this.applyToAll = true;
    this.showApplyAllModal = false;
  }

  cancelApplyAll() {
    this.applyToAll = false;
    this.showApplyAllModal = false;
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate();
    const month = date.getMonth() + 1;
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = hours.toString().padStart(2, '0');
    return `${day} Thg ${month}, ${formattedHours}:${minutes} ${ampm}`;
  }

  getRole(project: Project): { label: string; className: string } {
    if (project.owner_id === this.currentUserId) {
      return { label: 'Chủ sở hữu', className: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    const member = (project as any).project_members?.find((m: any) => m.user_id === this.currentUserId);
    if (member) {
      switch (member.role) {
        case 'admin': return { label: 'Quản trị viên', className: 'bg-purple-50 text-purple-700 border-purple-200' };
        case 'member': return { label: 'Thành viên', className: 'bg-blue-50 text-blue-700 border-blue-200' };
        case 'viewer': return { label: 'Người xem', className: 'bg-slate-50 text-slate-600 border-slate-200' };
      }
    }
    return { label: 'Thành viên', className: 'bg-blue-50 text-blue-700 border-blue-200' };
  }

  getPrivacy(project: Project): { label: string; className: string; icon: string } {
    if (project.is_public) {
      return { label: 'Công khai', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'public' };
    }
    return { label: 'Riêng tư', className: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'lock' };
  }

  getInitials(name?: string): string {
    if (!name) return 'DA';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  onColumnDrop(event: CdkDragDrop<ProjectTableColumn[]>) {
    moveItemInArray(this.draggableColumns, event.previousIndex, event.currentIndex);
  }

  startResize(event: MouseEvent, col: ProjectTableColumn) {
    event.stopPropagation();
    event.preventDefault();
    this.resizingCol = col;
    this.startX = event.clientX;
    this.startWidth = col.width;

    const onMouseMove = (e: MouseEvent) => {
      if (!this.resizingCol) return;
      const diff = e.clientX - this.startX;
      this.resizingCol.width = Math.max(80, this.startWidth + diff);
      this.cdr.detectChanges();
    };

    const onMouseUp = () => {
      this.resizingCol = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      this.cdr.detectChanges();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
}
