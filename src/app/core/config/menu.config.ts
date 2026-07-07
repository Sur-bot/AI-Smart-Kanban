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
}

export const BITRIX_SIDEBAR_MENU: MenuItem[] = [
  {
    id: 'tasks-projects',
    label: 'Tác vụ và Dự án',
    icon: 'check-square',
    route: '/kanban',
    isActive: true
  },
  {
    id: 'collaboration',
    label: 'Hợp tác',
    icon: 'share-nodes',
    badge: 1,
    hasSubMenu: true,
    children: [
      {
        id: 'messenger',
        label: 'Trình nhắn tin',
        icon: 'chat-bubble',
        iconSvg: 'M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z',
        route: '/messenger',
        badge: 1
      },
      {
        id: 'copilot',
        label: 'CoPilot',
        icon: 'sparkles',
        iconSvg: 'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z',
        route: '/copilot'
      },
      {
        id: 'collab-projects',
        label: 'Dự án hợp tác',
        icon: 'user-group',
        iconSvg: 'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z',
        route: '/collab-projects'
      },
      {
        id: 'news-feed',
        label: 'Bản tin',
        icon: 'newspaper',
        iconSvg: 'M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6V7.5Z',
        route: '/news-feed'
      },
      {
        id: 'calendar',
        label: 'Lịch',
        icon: 'calendar-days',
        iconSvg: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z',
        route: '/calendar'
      },
      {
        id: 'documents',
        label: 'Tài liệu',
        icon: 'document-text',
        iconSvg: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
        route: '/documents'
      },
      {
        id: 'spreadsheets',
        label: 'Bảng',
        icon: 'table-cells',
        iconSvg: 'M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12c-.621 0-1.125.504-1.125 1.125M12 12c.621 0 1.125.504 1.125 1.125m0-2.25c.621 0 1.125.504 1.125 1.125m-2.25 0c0 .621.504 1.125 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125m0-3.75c0 .621.504 1.125 1.125 1.125',
        route: '/spreadsheets'
      },
      {
        id: 'drive',
        label: 'Drive',
        icon: 'cloud',
        iconSvg: 'M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z',
        route: '/drive'
      },
      {
        id: 'webmail',
        label: 'Webmail',
        icon: 'envelope',
        iconSvg: 'M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75',
        route: '/webmail'
      },
      {
        id: 'workgroups',
        label: 'Nhóm Làm việc',
        icon: 'users',
        iconSvg: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
        route: '/workgroups'
      }
    ]
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