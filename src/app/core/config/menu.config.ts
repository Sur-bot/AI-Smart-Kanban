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
  requiredPermission?: string; // Quyền cần thiết để hiển thị menu này
  action?: string; // Hành động khi click (nếu không dùng route)
}

export const BITRIX_SIDEBAR_MENU: MenuItem[] = [
  {
    id: 'tasks-projects',
    label: 'Tác vụ và Dự án',
    icon: 'check_box',
    route: '/kanban',
    isActive: true
  },
  {
    id: 'collaboration',
    label: 'Hợp tác',
    icon: 'hub',
    hasSubMenu: true,
    children: [
      {
        id: 'manage-members',
        label: 'Quản lý thành viên',
        icon: 'manage_accounts',
        action: 'manage-members',
        requiredPermission: 'member.invite'
      },
      {
        id: 'messenger',
        label: 'Trình nhắn tin',
        icon: 'chat_bubble',
        route: '/messenger',
        badge: 1
      },
      {
        id: 'copilot',
        label: 'CoPilot',
        icon: 'auto_awesome',
        route: '/copilot'
      },
      {
        id: 'collab-projects',
        label: 'Dự án hợp tác',
        icon: 'groups',
        route: '/collab-projects'
      },
      {
        id: 'news-feed',
        label: 'Bản tin',
        icon: 'article',
        route: '/news-feed'
      },
      {
        id: 'calendar',
        label: 'Lịch',
        icon: 'calendar_month',
        route: '/calendar'
      },
      {
        id: 'documents',
        label: 'Tài liệu',
        icon: 'description',
        route: '/documents'
      },
      {
        id: 'spreadsheets',
        label: 'Bảng',
        icon: 'table_chart',
        route: '/spreadsheets'
      },
      {
        id: 'drive',
        label: 'Drive',
        icon: 'cloud',
        route: '/drive'
      },
      {
        id: 'webmail',
        label: 'Webmail',
        icon: 'mail',
        route: '/webmail'
      },
      {
        id: 'workgroups',
        label: 'Nhóm Làm việc',
        icon: 'group',
        route: '/workgroups'
      }
    ]
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: 'filter_alt',
    route: '/crm',
    isComingSoon: true
  },
  {
    id: 'booking',
    label: 'Đặt chỗ',
    icon: 'event_available',
    route: '/booking',
    isComingSoon: true
  },
  {
    id: 'inventory',
    label: 'Quản lý kho hàng',
    icon: 'warehouse',
    route: '/inventory',
    isComingSoon: true
  },
  {
    id: 'marketing',
    label: 'Tiếp thị',
    icon: 'radar',
    route: '/marketing',
    isComingSoon: true
  },
  {
    id: 'website-stores',
    label: 'Website và cửa hàng',
    icon: 'shopping_cart',
    route: '/website',
    isComingSoon: true
  },
  {
    id: 'bi-builder',
    label: 'BI Builder',
    icon: 'analytics',
    route: '/bi-builder',
    isComingSoon: true
  },
  {
    id: 'employees',
    label: 'Nhân viên',
    icon: 'badge',
    route: '/employees',
    isComingSoon: true
  },
  {
    id: 'automation',
    label: 'Tự động',
    icon: 'smart_toy',
    route: '/automation',
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
    route: '/knowledge-base',
    isComingSoon: true
  },
  {
    id: 'esign-hr',
    label: 'Chữ ký điện tử cho Nhân sự',
    icon: 'edit_document',
    route: '/esign-hr',
    isComingSoon: true
  },
  {
    id: 'esign',
    label: 'Chữ ký điện tử',
    icon: 'draw',
    route: '/esign',
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
    route: '/settings'
  }
];
