import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface FeatureTab {
  label: string;
  icon: string;
  features: string[];
}

@Component({
  selector: 'app-landing-hero',
  imports: [RouterModule, MatIconModule],
  templateUrl: './landing-hero.html',
  styleUrl: './landing-hero.scss'
})
export class LandingHeroComponent {
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

  setActiveTab(index: number): void {
    this.activeTab.set(index);
  }
}
