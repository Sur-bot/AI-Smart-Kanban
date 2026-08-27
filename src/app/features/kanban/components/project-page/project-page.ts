import { Component, ChangeDetectorRef, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageToolbarComponent, ToolbarField } from '../../../../shared/components/page-layout/page-toolbar/page-toolbar';
import { ViewFilterBarComponent, QuickFilter } from '../../../../shared/components/page-layout/view-filter-bar/view-filter-bar';
import { PreferencesService } from '../../../../core/services/preferences.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { TaskViewMode } from '../../../../shared/models/task-list.model';
import { TaskItem } from '../../../../core/models/task.model';

@Component({
  selector: 'app-project-page',
  standalone: true,
  imports: [
    CommonModule,
    PageToolbarComponent,
    ViewFilterBarComponent,
    MatIconModule,
  ],
  templateUrl: './project-page.html',
  styleUrls: ['./project-page.scss'],
})
export class ProjectPageComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private preferencesService = inject(PreferencesService);
  private authService = inject(AuthService);
  private readonly CONTEXT_KEY = 'kanban_projects';

  tasks: TaskItem[] = [];
  activeView: TaskViewMode = 'list';

  projectColumns = [
    { id: 'id', label: 'ID', width: 60 },
    { id: 'name', label: 'Tên', width: 280 },
    { id: 'activity', label: 'Hoạt động', width: 150 },
    { id: 'performance', label: 'Performance', width: 120 },
    { id: 'members', label: 'Xem các thành viên', width: 180 },
    { id: 'role', label: 'Vai trò', width: 120 },
    { id: 'privacy', label: 'Quyền riêng tư', width: 150 },
  ];

  private resizingCol: any = null;
  private startX: number = 0;
  private startWidth: number = 0;

  quickFilters: QuickFilter[] = [
    { id: 'overdue', label: 'Quá hạn', icon: 'clock', count: 0, isActive: false },
    { id: 'comments', label: 'Bình luận', icon: 'comment', count: 0, isActive: false },
    { id: 'markallread', label: 'Đánh dấu đã đọc tất cả', icon: 'eye', count: 0, isActive: false },
  ];

  constructor() {
    effect(() => {
      const user = this.authService.user();
      if (user || this.authService.isGuestMode()) {
        this.loadColumnState();
        this.cdr.detectChanges();
      }
    });
  }

  ngOnInit() {
    this.loadColumnState();
  }

  private loadColumnState() {
    const savedCols = this.preferencesService.getColumnWidths(this.CONTEXT_KEY);
    if (savedCols && Array.isArray(savedCols) && savedCols.length === this.projectColumns.length) {
      this.projectColumns.forEach(col => {
        const savedCol = savedCols.find(c => c.id === col.id);
        if (savedCol && savedCol.width) {
          col.width = savedCol.width;
        }
      });
    }
  }

  private saveColumnState() {
    this.preferencesService.saveColumnWidths(this.CONTEXT_KEY, this.projectColumns);
  }

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

  onViewChange(view: TaskViewMode) {
    this.activeView = view;
  }

  startResize(event: MouseEvent, col: any) {
    event.stopPropagation();
    event.preventDefault();
    this.resizingCol = col;
    this.startX = event.clientX;
    this.startWidth = col.width;

    const onMouseMove = (e: MouseEvent) => {
      if (!this.resizingCol) return;
      const diff = e.clientX - this.startX;
      // name column needs minimum 150px, others 60px
      const minWidth = this.resizingCol.id === 'name' ? 150 : 60;
      this.resizingCol.width = Math.max(minWidth, this.startWidth + diff);
      this.cdr.detectChanges();
    };

    const onMouseUp = () => {
      this.resizingCol = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      this.saveColumnState();
      this.cdr.detectChanges();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
}
