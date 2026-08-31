import { Component, Input, Output, EventEmitter, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TaskItem } from '../../../../core/models/task.model';
import { PermissionService } from '../../../../core/services/permission.service';

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
  imports: [CommonModule, FormsModule, MatIconModule, DragDropModule],
  templateUrl: './data-table.html',
  styleUrls: ['./data-table.scss'],
})
export class DataTableComponent {
  private cdr = inject(ChangeDetectorRef);
  readonly permissionService = inject(PermissionService);

  private _tasks: TaskItem[] = [];
  pinnedTaskIds = new Set<string>();

  @Input()
  set tasks(val: TaskItem[]) {
    this._tasks = val ? [...val] : [];
    this.sortTasks();
  }
  get tasks(): TaskItem[] {
    return this._tasks;
  }

  @Output() taskSelected = new EventEmitter<TaskItem>();

  selectedIds = new Set<string>();
  applyToAll: boolean = false;
  showApplyAllModal: boolean = false;
  selectedAction: string = '';
  pageSize: number = 50;
  readonly pageSizeOptions: number[] = [5, 10, 20, 50];

  nameColumn: TableColumn = { id: 'name', label: 'Tên', width: 280, sortable: true, hasDropdown: true };

  draggableColumns: TableColumn[] = [
    { id: 'activity', label: 'Hoạt động', width: 150, sortable: true },
    { id: 'dueDate', label: 'Hạn chót', width: 170, sortable: true },
    { id: 'creator', label: 'Người tạo', width: 180, sortable: true },
    { id: 'assignee', label: 'Người được phân công', width: 220, sortable: true },
    { id: 'project', label: 'Dự án', width: 150, sortable: true },
    { id: 'tags', label: 'Thẻ', width: 140, sortable: false },
  ];

  get allColumns(): TableColumn[] {
    return [this.nameColumn, ...this.draggableColumns];
  }

  readonly actionOptions: string[] = [
    'Ping',
    'Hoàn thành',
    'Đặt hạn chót',
    'Gia hạn chót',
    'Đẩy nhanh hạn chót',
    'Xem lại sau khi hoàn thành',
    'Thay đổi người được phân công',
    'Thay đổi người tạo ra',
    'Thêm người quan sát',
    'Thêm người tham gia',
    'Tắt tiếng',
    'Bỏ tắt tiếng',
    'Thêm vào ưa thích',
    'Xóa khỏi ưa thích',
    'Đặt nhóm (Dự án)',
    'Thêm vào luồng',
    'Xóa'
  ];

  private resizingCol: TableColumn | null = null;
  private startX: number = 0;
  private startWidth: number = 0;

  get isAllSelected(): boolean {
    return this.tasks.length > 0 && this.selectedIds.size === this.tasks.length;
  }

  get isIndeterminate(): boolean {
    return this.selectedIds.size > 0 && this.selectedIds.size < this.tasks.length;
  }

  toggleSelectAll(checked: boolean) {
    if (checked) {
      this.tasks.forEach(t => this.selectedIds.add(t.id));
    } else {
      this.selectedIds.clear();
    }
  }

  toggleRowSelection(task: TaskItem, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    if (this.selectedIds.has(task.id)) {
      this.selectedIds.delete(task.id);
    } else {
      this.selectedIds.add(task.id);
    }
  }

  isRowSelected(task: TaskItem): boolean {
    return this.selectedIds.has(task.id);
  }

  onTitleClick(task: TaskItem, event: MouseEvent) {
    event.stopPropagation();
    this.taskSelected.emit(task);
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

  togglePinTask(task: TaskItem, event: MouseEvent) {
    event.stopPropagation();
    if (this.pinnedTaskIds.has(task.id)) {
      this.pinnedTaskIds.delete(task.id);
      task.isPinned = false;
    } else {
      this.pinnedTaskIds.add(task.id);
      task.isPinned = true;
    }
    this.sortTasks();
    this.cdr.detectChanges();
  }

  isTaskPinned(task: TaskItem): boolean {
    return this.pinnedTaskIds.has(task.id) || !!task.isPinned;
  }

  private sortTasks() {
    if (!this._tasks || this._tasks.length === 0) return;
    this._tasks.sort((a, b) => {
      const aPinned = this.isTaskPinned(a) ? 1 : 0;
      const bPinned = this.isTaskPinned(b) ? 1 : 0;
      if (aPinned !== bPinned) {
        return bPinned - aPinned;
      }
      return 0;
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

  getCreatorAvatar(task: TaskItem): string | null {
    return task.creator?.avatar_url || (task.creator as any)?.avatar || null;
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
}
