import { Component, Input, Output, EventEmitter, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TaskItem } from '../../../../core/models/task.model';

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

  @Input() tasks: TaskItem[] = [];
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
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} Thg ${month}, ${hours}:${minutes}`;
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
