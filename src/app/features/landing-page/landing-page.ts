import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface FeatureTab {
  label: string;
  icon: string;
  features: string[];
}

@Component({
  selector: 'app-landing-page',
  imports: [RouterModule, MatIconModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPageComponent {
  activeTab = signal(0);

  readonly tabs: FeatureTab[] = [
    {
      label: 'Bảng Kanban',
      icon: 'dashboard',
      features: [
        'Kéo thả tác vụ trực quan',
        'Phân loại theo trạng thái & ưu tiên',
        'Bộ lọc thông minh',
        'Gán thành viên nhanh chóng',
        'Theo dõi tiến độ realtime',
        'Tùy chỉnh cột không giới hạn',
      ],
    },
    {
      label: 'Tối ưu Ảnh AI',
      icon: 'auto_awesome',
      features: [
        'Nén WebP 80% tự động ngầm',
        'Tạo Thumbnail không lag UI',
        'Xóa Metadata nhạy cảm',
        'Queue Worker xử lý hàng loạt',
        'Tiết kiệm 60-80% dung lượng',
        'Hỗ trợ PNG, JPG, WebP, GIF',
      ],
    },
    {
      label: 'Quản lý Dự án',
      icon: 'folder_special',
      features: [
        'Tạo dự án & giao tác vụ',
        'Gantt chart & Timeline',
        'Đánh giá KPI thành viên',
        'Báo cáo tiến độ tự động',
        'Bình luận & trao đổi tức thì',
        'Lịch sử hoạt động chi tiết',
      ],
    },
    {
      label: 'Lưu trữ Đám mây',
      icon: 'cloud_upload',
      features: [
        'Upload file không giới hạn định dạng',
        'Quản lý hạn ngạch người dùng',
        'Supabase Storage bảo mật',
        'Xem trước ảnh trực tiếp',
        'Tìm kiếm file nhanh chóng',
        'Backup & phục hồi dữ liệu',
      ],
    },
    {
      label: 'Bảo mật & Hệ thống',
      icon: 'shield',
      features: [
        'Kiến trúc Microservices tách biệt',
        'Row Level Security (RLS)',
        'API Key không lộ ra Frontend',
        'Service Role Key bảo mật',
        'Docker containerized',
        'Mã hóa SHA-256 mọi file',
      ],
    },
  ];

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

  setActiveTab(index: number): void {
    this.activeTab.set(index);
  }

  /** Trạng thái mở/đóng khung phản hồi */
  feedbackOpen = signal(false);

  toggleFeedback(): void {
    this.feedbackOpen.update(v => !v);
  }

  closeFeedback(): void {
    this.feedbackOpen.set(false);
    this.isTypeDropdownOpen.set(false);
  }

  /** Custom Dropdown cho Loại phản hồi */
  readonly feedbackTypes = [
    { value: 'suggestion', label: 'Góp ý cải tiến', icon: 'lightbulb' },
    { value: 'bug', label: 'Báo lỗi', icon: 'bug_report' },
    { value: 'compliment', label: 'Khen ngợi', icon: 'star' },
    { value: 'question', label: 'Câu hỏi', icon: 'help_outline' },
    { value: 'other', label: 'Khác', icon: 'article' },
  ];

  selectedFeedbackType = signal(this.feedbackTypes[0]);
  isTypeDropdownOpen = signal(false);

  toggleTypeDropdown(): void {
    this.isTypeDropdownOpen.update(v => !v);
  }

  selectFeedbackType(type: any): void {
    this.selectedFeedbackType.set(type);
    this.isTypeDropdownOpen.set(false);
  }
}
