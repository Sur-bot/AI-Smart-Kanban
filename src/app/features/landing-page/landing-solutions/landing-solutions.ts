import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing-solutions',
  imports: [MatIconModule],
  templateUrl: './landing-solutions.html',
  styleUrl: './landing-solutions.scss'
})
export class LandingSolutionsComponent {
  readonly solutions = [
    {
      icon: 'task_alt',
      title: 'Quản lý Dự án',
      description: 'Theo dõi tác vụ, dự án và tiến độ nhóm từ A đến Z với bảng Kanban trực quan.',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: 'image',
      title: 'Xử lý Ảnh thông minh',
      description: 'Worker ngầm tự động nén ảnh, tạo thumbnail mà không ảnh hưởng hiệu năng.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: 'groups',
      title: 'Cộng tác Nhóm',
      description: 'Giao việc, bình luận, theo dõi hoạt động của thành viên theo thời gian thực.',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      icon: 'storage',
      title: 'Lưu trữ Đám mây',
      description: 'Upload, quản lý và tối ưu hình ảnh trên Supabase Storage với hạn ngạch linh hoạt.',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      icon: 'security',
      title: 'Bảo mật Dữ liệu',
      description: 'Supabase RLS, mã hóa SHA-256 và kiến trúc tách biệt Frontend/Backend.',
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      icon: 'settings_suggest',
      title: 'Tùy chỉnh Linh hoạt',
      description: 'Tùy biến quy trình, bộ lọc và giao diện phù hợp với từng nhóm làm việc.',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
  ];
}
