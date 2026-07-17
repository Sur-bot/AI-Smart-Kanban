import { Routes } from '@angular/router';

export const routes: Routes = [
  // 1. Bộ cấu trúc chính với Layout (Dashboard)
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayoutComponent),
    title: 'AI Smart Kanban',
    children: [
      // Kanban Board - Tác vụ và Dự án
      {
        path: 'kanban',
        loadComponent: () => import('./features/kanban/components/kanban-board/kanban-board').then(m => m.KanbanBoardComponent),
        title: 'Bảng Kanban - Tác vụ và Dự án'
      },

      // Trang Tác vụ (Tasks Page)
      {
        path: 'kanban/tasks',
        loadComponent: () => import('./features/kanban/components/tasks-page/tasks-page').then(m => m.TasksPageComponent),
        title: 'Tác vụ của tôi - AI Smart Kanban'
      },

      {
        path: 'kanban/projects',
        loadComponent: () => import('./features/kanban/components/project-page/project-page').then(m => m.ProjectPageComponent),
        title: 'Dự án - AI Smart Kanban'
      },

      // Các trang khác (CRM, Booking, Inventory, Marketing, etc.)
      // Để mở rộng sau này:
      // {
      //   path: 'crm',
      //   loadComponent: () => import('./features/crm/crm.ts').then(m => m.CrmComponent),
      //   title: 'CRM - Quản lý khách hàng'
      // },
      // {
      //   path: 'booking',
      //   loadComponent: () => import('./features/booking/booking.ts').then(m => m.BookingComponent),
      //   title: 'Đặt chỗ'
      // },
      // {
      //   path: 'inventory',
      //   loadComponent: () => import('./features/inventory/inventory.ts').then(m => m.InventoryComponent),
      //   title: 'Quản lý kho hàng'
      // },

      // Default route - Redirect từ '' sang 'kanban'
      {
        path: '',
        redirectTo: 'kanban',
        pathMatch: 'full'
      }
    ]
  },

  // 2. Tuyến đường cho trang Login (Giao diện độc lập, không dùng Layout)
  // {
  //   path: 'login',
  //   loadComponent: () => import('./features/auth/login/login.ts').then(m => m.LoginComponent),
  //   title: 'Đăng nhập - AI Smart Kanban'
  // },

  // 3. Trang 404 - Lỗi không tìm thấy (Phải đặt ở cuối cùng)
  // {
  //   path: '**',
  //   loadComponent: () => import('./shared/components/not-found/not-found.ts').then(m => m.NotFoundComponent),
  //   title: '404 - Không tìm thấy trang'
  // }
];