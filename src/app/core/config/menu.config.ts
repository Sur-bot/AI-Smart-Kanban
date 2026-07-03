// Định nghĩa cấu trúc dữ liệu cho một Menu Item
export interface MenuItem {
  id: string;
  label: string;
  icon: string;          // Tên icon (sau này dùng để map với SVG hoặc FontAwesome/Heroicons)
  route?: string;        // Đường dẫn URL (nếu có)
  badge?: number;        // Số lượng thông báo (chấm đỏ)
  hasSubMenu?: boolean;  // Có mũi tên xổ xuống hay không
  isActive?: boolean;    // Trạng thái đang được chọn mặc định
  isDivider?: boolean;   // Dùng để tạo dải phân cách (nếu cần)
}

export const BITRIX_SIDEBAR_MENU: MenuItem[] = [
  {
    id: 'tasks-projects',
    label: 'Tác vụ và Dự án',
    icon: 'check-square', // Bạn có thể thay bằng SVG path thật sau
    route: '/kanban',
    isActive: true        // Đang được chọn như trong ảnh
  },
  {
    id: 'collaboration',
    label: 'Hợp tác',
    icon: 'share-nodes',
    badge: 1,             // Có thông báo đỏ số 1
    hasSubMenu: true
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: 'funnel',
    route: '/crm'
  },
  {
    id: 'booking',
    label: 'Đặt chỗ',
    icon: 'calendar',
    route: '/booking'
  },
  {
    id: 'inventory',
    label: 'Quản lý kho hàng',
    icon: 'warehouse',
    route: '/inventory'
  },
  {
    id: 'marketing',
    label: 'Tiếp thị',
    icon: 'bullseye',
    route: '/marketing'
  },
  {
    id: 'website-stores',
    label: 'Website và cửa hàng',
    icon: 'shopping-cart',
    route: '/website'
  },
  {
    id: 'bi-builder',
    label: 'BI Builder',
    icon: 'chart-column',
    route: '/bi-builder'
  },
  {
    id: 'employees',
    label: 'Nhân viên',
    icon: 'id-card',
    route: '/employees'
  },
  {
    id: 'automation',
    label: 'Tự động',
    icon: 'robot',
    route: '/automation'
  },
  {
    id: 'applications',
    label: 'Ứng dụng',
    icon: 'cube',
    hasSubMenu: true     // Có mũi tên xổ xuống
  },
  {
    id: 'kb-2',
    label: 'Knowledge base 2.0',
    icon: 'book-open',
    route: '/knowledge-base'
  },
  {
    id: 'esign-hr',
    label: 'Chữ ký điện tử cho Nh...',
    icon: 'file-signature',
    route: '/esign-hr'
  },
  {
    id: 'esign',
    label: 'Chữ ký điện tử',
    icon: 'pen-nib',
    route: '/esign'
  },
  {
    id: 'show-all',
    label: 'Hiển thị tất cả',
    icon: 'chevron-down',
    hasSubMenu: false
  },
  {
    id: 'settings',
    label: 'Cài đặt',
    icon: 'gear',
    route: '/settings'
  }
];