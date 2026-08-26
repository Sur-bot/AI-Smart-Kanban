// Äá»‹nh nghÄ©a cáº¥u trÃºc dá»¯ liá»‡u cho má»™t Menu Item
export interface MenuItem {
  id: string;
  label: string;
  icon: string;          // TÃªn icon (sau nÃ y dÃ¹ng Ä‘á»ƒ map vá»›i SVG hoáº·c FontAwesome/Heroicons)
  iconSvg?: string;      // SVG path tÃ¹y chá»‰nh cho icon
  route?: string;        // Ä Æ°á» ng dáº«n URL (náº¿u cÃ³)
  badge?: number;        // Sá»‘ lÆ°á»£ng thÃ´ng bÃ¡o (cháº¥m Ä‘á» )
  hasSubMenu?: boolean;  // CÃ³ mÅ©i tÃªn xá»• xuá»‘ng hay khÃ´ng
  isActive?: boolean;    // Tráº¡ng thÃ¡i Ä‘ang Ä‘Æ°á»£c chá» n máº·c Ä‘á»‹nh
  isDivider?: boolean;   // DÃ¹ng Ä‘á»ƒ táº¡o dáº£i phÃ¢n cÃ¡ch (náº¿u cáº§n)
  children?: MenuItem[]; // Các mục con (sub-menu)
  isComingSoon?: boolean; // Cờ đánh dấu tính năng chưa phát triển
  requiredPermission?: string; // Quyền cần thiết để hiển thị menu này
  action?: string; // Hành động khi click (nếu không dùng route)
}

export const BITRIX_SIDEBAR_MENU: MenuItem[] = [
  {
    id: 'tasks-projects',
    label: 'TÃ¡c vá»¥ vÃ  Dá»± Ã¡n',
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
        label: 'TrÃ¬nh nháº¯n tin',
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
        label: 'Dá»± Ã¡n há»£p tÃ¡c',
        icon: 'groups',
        route: '/collab-projects'
      },
      {
        id: 'news-feed',
        label: 'Báº£n tin',
        icon: 'article',
        route: '/news-feed'
      },
      {
        id: 'calendar',
        label: 'Lá»‹ch',
        icon: 'calendar_month',
        route: '/calendar'
      },
      {
        id: 'documents',
        label: 'TÃ i liá»‡u',
        icon: 'description',
        route: '/documents'
      },
      {
        id: 'spreadsheets',
        label: 'Báº£ng',
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
        label: 'NhÃ³m LÃ m viá»‡c',
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
    label: 'Äáº·t chá»—',
    icon: 'event_available',
    route: '/booking',
    isComingSoon: true
  },
  {
    id: 'inventory',
    label: 'Quáº£n lÃ½ kho hÃ ng',
    icon: 'warehouse',
    route: '/inventory',
    isComingSoon: true
  },
  {
    id: 'marketing',
    label: 'Tiáº¿p thá»‹',
    icon: 'radar',
    route: '/marketing',
    isComingSoon: true
  },
  {
    id: 'website-stores',
    label: 'Website vÃ  cá»­a hÃ ng',
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
    label: 'NhÃ¢n viÃªn',
    icon: 'badge',
    route: '/employees',
    isComingSoon: true
  },
  {
    id: 'automation',
    label: 'Tá»± Ä‘á»™ng',
    icon: 'smart_toy',
    route: '/automation',
    isComingSoon: true
  },
  {
    id: 'applications',
    label: 'á»¨ng dá»¥ng',
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
    label: 'Chá»¯ kÃ½ Ä‘iá»‡n tá»­ cho NhÃ¢n sá»±',
    icon: 'edit_document',
    route: '/esign-hr',
    isComingSoon: true
  },
  {
    id: 'esign',
    label: 'Chá»¯ kÃ½ Ä‘iá»‡n tá»­',
    icon: 'draw',
    route: '/esign',
    isComingSoon: true
  },
  {
    id: 'show-all',
    label: 'Hiá»ƒn thá»‹ táº¥t cáº£',
    icon: 'expand_more',
    hasSubMenu: false,
  },
  {
    id: 'settings',
    label: 'CÃ i Ä‘áº·t',
    icon: 'settings',
    route: '/settings'
  }
];
