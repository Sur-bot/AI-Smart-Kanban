import { Component, Input, Output, EventEmitter, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TaskItem, Project } from '../../../../core/models/task.model';
import { PermissionService } from '../../../../core/services/permission.service';
import { TaskStore } from '../../../../core/state/task.store';
import { DueDatePickerComponent } from '../../due-date-picker/due-date-picker';
import { ProjectPopoverComponent } from '../../project-popover/project-popover';
import { TagPopoverComponent } from '../../tag-popover/tag-popover';
import { OverlayModule, ConnectedPosition, CdkOverlayOrigin } from '@angular/cdk/overlay';

export interface TableColumn {
  id: string;
  label: string;
  width: number;
  sortable?: boolean;
  hasDropdown?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, DragDropModule, DueDatePickerComponent, ProjectPopoverComponent, TagPopoverComponent, OverlayModule],
  templateUrl: './data-table.html',
  styleUrls: ['./data-table.scss'],
})
export class DataTableComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  readonly permissionService = inject(PermissionService);
  readonly taskStore = inject(TaskStore);

  @Input() mode: 'task' | 'project' = 'task';
  @Input() currentUserId: string | null = null;

  private _data: any[] = [];
  pinnedItemIds = new Set<string>();

  @Input()
  set data(val: any[]) {
    this._data = val ? [...val] : [];
    this.sortData();
  }
  get data(): any[] {
    return this._data;
  }

  // Outputs cho Task
  @Output() itemSelected = new EventEmitter<any>();
  @Output() taskUpdated = new EventEmitter<TaskItem>();
  
  // Outputs cho Project
  @Output() memberManage = new EventEmitter<Project>();
  @Output() projectEdit = new EventEmitter<Project>();
  @Output() batchAction = new EventEmitter<{ action: string; itemIds: string[]; applyToAll: boolean }>();

  selectedIds = new Set<string>();
  applyToAll: boolean = false;
  showApplyAllModal: boolean = false;
  selectedAction: string = '';
  pageSize: number = 50;
  readonly pageSizeOptions: number[] = [5, 10, 20, 50];

  sortColumnId: string = '';
  sortDirection: 'asc' | 'desc' | 'none' = 'none';

  activePopoverId: string | null = null;
  activePopoverItem: any = null;
  activePopoverOrigin: CdkOverlayOrigin | null = null;

  readonly popoverPositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 }
  ];

  nameColumn: TableColumn = { id: 'name', label: 'Tên', width: 280, sortable: true, hasDropdown: true };
  draggableColumns: TableColumn[] = [];
  actionOptions: string[] = [];

  ngOnInit() {
    if (this.mode === 'task') {
      this.draggableColumns = [
        { id: 'activity', label: 'Hoạt động', width: 150, sortable: true },
        { id: 'dueDate', label: 'Hạn chót', width: 170, sortable: true },
        { id: 'creator', label: 'Người tạo', width: 180, sortable: true },
        { id: 'assignee', label: 'Người được phân công', width: 220, sortable: true },
        { id: 'project', label: 'Dự án', width: 150, sortable: true },
        { id: 'tags', label: 'Thẻ', width: 140, sortable: true },
      ];
      this.actionOptions = [
        'Ping', 'Hoàn thành', 'Đặt hạn chót', 'Gia hạn chót', 'Đẩy nhanh hạn chót',
        'Xem lại sau khi hoàn thành', 'Thay đổi người được phân công', 'Thay đổi người tạo ra',
        'Thêm người quan sát', 'Thêm người tham gia', 'Tắt tiếng', 'Bỏ tắt tiếng',
        'Thêm vào ưa thích', 'Xóa khỏi ưa thích', 'Đặt nhóm (Dự án)', 'Thêm vào luồng', 'Xóa'
      ];
    } else {
      this.draggableColumns = [
        { id: 'id', label: 'ID', width: 100, sortable: true },
        { id: 'activity', label: 'Hoạt động', width: 150, sortable: true },
        { id: 'performance', label: 'Performance', width: 140, sortable: true },
        { id: 'members', label: 'Xem các thành viên', width: 190, sortable: false },
        { id: 'role', label: 'Vai trò', width: 130, sortable: true },
        { id: 'privacy', label: 'Quyền riêng tư', width: 150, sortable: true },
      ];
      this.actionOptions = [
        'Thêm vào ưa thích', 'Xóa khỏi ưa thích', 'Lưu trữ', 'Kích hoạt lại',
        'Thay đổi quyền riêng tư', 'Xóa'
      ];
    }
  }

  get allColumns(): TableColumn[] {
    return [this.nameColumn, ...this.draggableColumns];
  }



  private resizingCol: TableColumn | null = null;
  private startX: number = 0;
  private startWidth: number = 0;

  get isAllSelected(): boolean {
    return this.data.length > 0 && this.selectedIds.size === this.data.length;
  }

  get isIndeterminate(): boolean {
    return this.selectedIds.size > 0 && this.selectedIds.size < this.data.length;
  }

  toggleSelectAll(checked: boolean) {
    if (checked) {
      this.data.forEach(t => this.selectedIds.add(t.id));
    } else {
      this.selectedIds.clear();
    }
  }

  toggleRowSelection(item: any, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    if (this.selectedIds.has(item.id)) {
      this.selectedIds.delete(item.id);
    } else {
      this.selectedIds.add(item.id);
    }
  }

  isRowSelected(item: any): boolean {
    return this.selectedIds.has(item.id);
  }

  onTitleClick(item: any, event: MouseEvent) {
    event.stopPropagation();
    this.itemSelected.emit(item);
  }

  onApplyBatchAction() {
    if (this.selectedIds.size === 0 || !this.selectedAction) return;
    this.batchAction.emit({
      action: this.selectedAction,
      itemIds: Array.from(this.selectedIds),
      applyToAll: this.applyToAll
    });
  }

  onApplyAllCheckboxClick(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
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

  togglePinItem(item: any, event: MouseEvent) {
    event.stopPropagation();
    if (this.pinnedItemIds.has(item.id)) {
      this.pinnedItemIds.delete(item.id);
      item.isPinned = false;
    } else {
      this.pinnedItemIds.add(item.id);
      item.isPinned = true;
    }
    this.sortData();
    this.cdr.detectChanges();
  }

  isItemPinned(item: any): boolean {
    return this.pinnedItemIds.has(item.id) || !!item.isPinned;
  }

  toggleSortColumn(colId: string, event?: MouseEvent) {
    if (event) event.stopPropagation();
    if (this.sortColumnId === colId) {
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortDirection = 'none';
        this.sortColumnId = '';
      } else {
        this.sortDirection = 'asc';
      }
    } else {
      this.sortColumnId = colId;
      this.sortDirection = 'asc';
    }
    this.sortData();
    this.cdr.detectChanges();
  }

  getSortIcon(colId: string): string {
    if (this.sortColumnId === colId) {
      return this.sortDirection === 'asc' ? 'expand_less' : 'expand_more';
    }
    return 'expand_more';
  }

  isColumnSorted(colId: string): boolean {
    return this.sortColumnId === colId && this.sortDirection !== 'none';
  }

  private sortData() {
    if (!this._data || this._data.length === 0) return;
    this._data.sort((a, b) => {
      // 1. Pinned items always stay at the top
      const aPinned = this.isItemPinned(a) ? 1 : 0;
      const bPinned = this.isItemPinned(b) ? 1 : 0;
      if (aPinned !== bPinned) {
        return bPinned - aPinned;
      }

      // 2. Column Sorting
      if (!this.sortColumnId || this.sortDirection === 'none') {
        return 0;
      }

      let comparison = 0;
      switch (this.sortColumnId) {
        case 'name': {
          const nameA = (a.title || a.name || '').toLowerCase();
          const nameB = (b.title || b.name || '').toLowerCase();
          comparison = nameA.localeCompare(nameB, 'vi');
          break;
        }
        case 'id': {
          const idA = (a.id || '').toLowerCase();
          const idB = (b.id || '').toLowerCase();
          comparison = idA.localeCompare(idB, 'vi');
          break;
        }
        case 'activity': {
          const timeA = new Date(a.updatedAt || a.createdAt || a.created_at || 0).getTime();
          const timeB = new Date(b.updatedAt || b.createdAt || b.created_at || 0).getTime();
          comparison = timeA - timeB;
          break;
        }
        case 'dueDate': {
          const timeA = a.dueDate ? new Date(a.dueDate).getTime() : (this.sortDirection === 'asc' ? Number.MAX_SAFE_INTEGER : -1);
          const timeB = b.dueDate ? new Date(b.dueDate).getTime() : (this.sortDirection === 'asc' ? Number.MAX_SAFE_INTEGER : -1);
          comparison = timeA - timeB;
          break;
        }
        case 'creator': {
          const creatorA = (a.creator?.name || '').toLowerCase();
          const creatorB = (b.creator?.name || '').toLowerCase();
          comparison = creatorA.localeCompare(creatorB, 'vi');
          break;
        }
        case 'assignee': {
          const assigneeA = (this.getAssignee(a)?.name || '').toLowerCase();
          const assigneeB = (this.getAssignee(b)?.name || '').toLowerCase();
          comparison = assigneeA.localeCompare(assigneeB, 'vi');
          break;
        }
        case 'project': {
          const projA = (a.projectName || (a as any).project?.name || '').toLowerCase();
          const projB = (b.projectName || (b as any).project?.name || '').toLowerCase();
          comparison = projA.localeCompare(projB, 'vi');
          break;
        }
        case 'tags': {
          const countA = a.labels?.length || 0;
          const countB = b.labels?.length || 0;
          comparison = countA - countB;
          break;
        }
        case 'performance': {
          comparison = 0;
          break;
        }
        case 'role': {
          const roleA = this.getRole(a).label;
          const roleB = this.getRole(b).label;
          comparison = roleA.localeCompare(roleB, 'vi');
          break;
        }
        case 'privacy': {
          const privA = this.getPrivacy(a).label;
          const privB = this.getPrivacy(b).label;
          comparison = privA.localeCompare(privB, 'vi');
          break;
        }
        default:
          comparison = 0;
      }

      return this.sortDirection === 'desc' ? -comparison : comparison;
    });
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getAssignee(task: TaskItem): any {
    return task.assignee || (task.assignees && task.assignees[0]) || null;
  }

  getAssigneeAvatar(task: TaskItem): string | null {
    const assignee = this.getAssignee(task);
    if (assignee?.avatar_url) return assignee.avatar_url;
    if (assignee?.avatar) return assignee.avatar;
    if (task.creator?.avatar_url && (task.assigneeId === task.creatorId || !task.assigneeId || assignee?.name === task.creator?.name || assignee?.id === task.creator?.id)) {
      return task.creator.avatar_url;
    }
    return null;
  }

  getCreatorAvatar(item: any): string | null {
    return item.creator?.avatar_url || (item.creator as any)?.avatar || null;
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  trackByColId(index: number, col: TableColumn): string {
    return col.id;
  }

  onColumnDrop(event: CdkDragDrop<TableColumn[]>) {
    moveItemInArray(this.draggableColumns, event.previousIndex, event.currentIndex);
  }

  startResize(event: MouseEvent, col: TableColumn) {
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

  onDueDateChange(item: any, newDueDate: string | null): void {
    item.dueDate = newDueDate || undefined;
    this.taskStore.updateTask(item.id, { dueDate: newDueDate === null ? (null as any) : newDueDate });
    this.taskUpdated.emit(item);
    this.cdr.detectChanges();
  }

  isTaskOverdue(item: any): boolean {
    if (this.mode !== 'task') return false;
    if (!item.dueDate || item.completedAt) return false;
    if (item.status?.category === 'done') return false;
    const dueTime = new Date(item.dueDate).getTime();
    return !isNaN(dueTime) && dueTime < Date.now();
  }

  // --- Project Specific Methods ---
  getRole(project: any): { label: string; className: string } {
    if (project.owner_id === this.currentUserId) {
      return { label: 'Chủ sở hữu', className: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    const member = project.project_members?.find((m: any) => m.user_id === this.currentUserId);
    if (member) {
      switch (member.role) {
        case 'admin': return { label: 'Quản trị viên', className: 'bg-purple-50 text-purple-700 border-purple-200' };
        case 'member': return { label: 'Thành viên', className: 'bg-blue-50 text-blue-700 border-blue-200' };
        case 'viewer': return { label: 'Người xem', className: 'bg-slate-50 text-slate-600 border-slate-200' };
      }
    }
    return { label: 'Thành viên', className: 'bg-blue-50 text-blue-700 border-blue-200' };
  }

  getPrivacy(project: any): { label: string; className: string; icon: string } {
    if (project.privacy === 'public' || project.is_public) {
      return { label: 'Công khai', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'public' };
    }
    return { label: 'Riêng tư', className: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'lock' };
  }

  getVisibleMembers(project: any, max: number = 4): any[] {
    return project.project_members?.slice(0, max) || [];
  }

  getRemainingMembersCount(project: any, max: number = 4): number {
    return Math.max(0, (project.project_members?.length || 0) - max);
  }

  onMemberClick(project: any, event: MouseEvent) {
    event.stopPropagation();
    this.memberManage.emit(project);
  }

  onEditClick(project: any, event: MouseEvent) {
    event.stopPropagation();
    this.projectEdit.emit(project);
  }

  // --- Popover Toggle Methods ---
  togglePopover(popoverType: 'project' | 'tag', item: any, event: MouseEvent, origin: CdkOverlayOrigin) {
    event.stopPropagation();
    const popoverId = `${popoverType}-${item.id}`;
    if (this.activePopoverId === popoverId) {
      this.closePopover();
    } else {
      this.activePopoverId = popoverId;
      this.activePopoverItem = item;
      this.activePopoverOrigin = origin;
    }
  }

  closePopover() {
    this.activePopoverId = null;
    this.activePopoverItem = null;
    this.activePopoverOrigin = null;
  }
}
