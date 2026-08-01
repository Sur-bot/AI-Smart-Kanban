// Định nghĩa cấu trúc dữ liệu cho một Menu Item
export interface MenuItem {
  id: string;
  label: string;
  icon: string;          // Tên icon (sau này dùng để map với SVG hoặc FontAwesome/Heroicons)
  iconSvg?: string;      // SVG path tùy chỉnh cho icon
  route?: string;        // Đường dẫn URL (nếu có)
  badge?: number;        // Số lượng thông báo (chấm đỏ)
  hasSubMenu?: boolean;  // Có mũi tên xổ xuống hay không
  isActive?: boolean;    // Trạng thái đang được chọn mặc định
  isDivider?: boolean;   // Dùng để tạo dải phân cách (nếu cần)
  children?: MenuItem[]; // Các mục con (sub-menu)
  isComingSoon?: boolean; // Cờ đánh dấu tính năng chưa phát triển
}

export const BITRIX_SIDEBAR_MENU: MenuItem[] = [
  {
    id: 'tasks-projects',
    label: 'Tác vụ và Dự án',
    icon: 'check_box',
    route: '/app/kanban',
    isActive: true
  },
  {
    id: 'collaboration',
    label: 'Hợp tác',
    icon: 'hub',
    isComingSoon: true,
    hasSubMenu: true,
    children: [
      {
        id: 'messenger',
        label: 'Trình nhắn tin',
        icon: 'chat_bubble',
        route: '/app/messenger',
        badge: 1
      },
      {
        id: 'copilot',
        label: 'CoPilot',
        icon: 'auto_awesome',
        route: '/app/copilot'
      },
      {
        id: 'collab-projects',
        label: 'Dự án hợp tác',
        icon: 'groups',
        route: '/app/collab-projects'
      },
      {
        id: 'news-feed',
        label: 'Bản tin',
        icon: 'article',
        route: '/app/news-feed'
      },
      {
        id: 'calendar',
        label: 'Lịch',
        icon: 'calendar_month',
        route: '/app/calendar'
      },
      {
        id: 'documents',
        label: 'Tài liệu',
        icon: 'description',
        route: '/app/documents'
      },
      {
        id: 'spreadsheets',
        label: 'Bảng',
        icon: 'table_chart',
        route: '/app/spreadsheets'
      },
      {
        id: 'drive',
        label: 'Drive',
        icon: 'cloud',
        route: '/app/drive'
      },
      {
        id: 'webmail',
        label: 'Webmail',
        icon: 'mail',
        route: '/app/webmail'
      },
      {
        id: 'workgroups',
        label: 'Nhóm Làm việc',
        icon: 'group',
        route: '/app/workgroups'
      }
    ]
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: 'filter_alt',
    route: '/app/crm',
    isComingSoon: true
  },
  {
    id: 'booking',
    label: 'Đặt chỗ',
    icon: 'event_available',
    route: '/app/booking',
    isComingSoon: true
  },
  {
    id: 'inventory',
    label: 'Quản lý kho hàng',
    icon: 'warehouse',
    route: '/app/inventory',
    isComingSoon: true
  },
  {
    id: 'marketing',
    label: 'Tiếp thị',
    icon: 'radar',
    route: '/app/marketing',
    isComingSoon: true
  },
  {
    id: 'website-stores',
    label: 'Website và cửa hàng',
    icon: 'shopping_cart',
    route: '/app/website',
    isComingSoon: true
  },
  {
    id: 'bi-builder',
    label: 'BI Builder',
    icon: 'analytics',
    route: '/app/bi-builder',
    isComingSoon: true
  },
  {
    id: 'employees',
    label: 'Nhân viên',
    icon: 'badge',
    route: '/app/employees',
    isComingSoon: true
  },
  {
    id: 'automation',
    label: 'Tự động',
    icon: 'smart_toy',
    route: '/app/automation',
    isComingSoon: true
  },
  {
    id: 'applications',
    label: 'Ứng dụng',
    icon: 'inventory_2',
    hasSubMenu: true,
    isComingSoon: true
  },
  {
    id: 'kb-2',
    label: 'Knowledge base',
    icon: 'menu_book',
    route: '/app/knowledge-base',
    isComingSoon: true
  },
  {
    id: 'esign-hr',
    label: 'Chữ ký điện tử cho Nhân sự',
    icon: 'edit_document',
    route: '/app/esign-hr',
    isComingSoon: true
  },
  {
    id: 'esign',
    label: 'Chữ ký điện tử',
    icon: 'draw',
    route: '/app/esign',
    isComingSoon: true
  },
  {
    id: 'show-all',
    label: 'Hiển thị tất cả',
    icon: 'expand_more',
    hasSubMenu: false,
  },
  {
    id: 'settings',
    label: 'Cài đặt',
    icon: 'settings',
    route: '/app/settings'
  }
];