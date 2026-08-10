import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageToolbarComponent, ToolbarField } from '../../../../shared/components/page-layout/page-toolbar/page-toolbar';
import { ViewFilterBarComponent, QuickFilter } from '../../../../shared/components/page-layout/view-filter-bar/view-filter-bar';
import { DataTableComponent } from '../../../../shared/components/page-layout/data-table/data-table';
import { TaskViewMode } from '../../../../shared/models/task-list.model';
import { TaskItem } from '../../../../core/models/task.model';

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
}
