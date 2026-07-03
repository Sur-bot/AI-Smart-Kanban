import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sub-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sub-nav.html',
})

export class SubNavComponent {
  // Định nghĩa mảng dữ liệu chuẩn quản lý tập trung
  menuList = [
    { id: 'tasks', label: 'Tác vụ', route: '/kanban/tasks', hasDropdown: false },
    { id: 'projects', label: 'Dự án', route: '/kanban/projects', hasDropdown: false },
    { id: 'stream', label: 'Luồng', route: '/kanban/stream', hasDropdown: false },
    { id: 'scrum', label: 'Scrum', route: '/kanban/scrum', hasDropdown: false },
    { id: 'efficiency', label: 'Hiệu suất', route: '/kanban/efficiency', hasDropdown: false, badge: '100%' },
    { id: 'analytics', label: 'Analytics', route: '', hasDropdown: true }, // Có dropdown mĩ tên
    { id: 'templates', label: 'Khuôn mẫu', route: '/kanban/templates', hasDropdown: false },
    { id: 'trash', label: 'Thùng Rác', route: '/kanban/trash', hasDropdown: false },
    { id: 'more', label: 'Thêm', route: '', hasDropdown: true }
  ];

  openMenu(id: string) {
    console.log('Mở dropdown cho mục:', id);
  }
}