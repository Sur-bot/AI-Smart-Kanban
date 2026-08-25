import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // 1. Landing Page (Trang chủ)
  {
    path: '',
    loadComponent: () => import('./features/landing-page/landing-page').then(m => m.LandingPageComponent),
    title: 'AI Smart Kanban - Quản lý thông minh',
    pathMatch: 'full'
  },

  // 2. Trang Lưu trữ Hình ảnh
  {
    path: 'image-storage',
    loadComponent: () => import('./features/image-storage/components/image-storage-page/image-storage-page').then(m => m.ImageStoragePageComponent),
    title: 'Lưu trữ hình ảnh - AI Smart Kanban',
    canActivate: [authGuard]
  },

  // 3. Bộ cấu trúc chính với Layout (Dashboard)
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayoutComponent),
    title: 'AI Smart Kanban',
    canActivate: [authGuard],
    children: [
      // Trang Tác vụ (Tasks Page) - Mặc định cho kanban
      {
        path: 'kanban',
        loadComponent: () => import('./features/kanban/components/tasks-page/tasks-page').then(m => m.TasksPageComponent),
        title: 'Tác vụ của tôi - AI Smart Kanban'
      },

      // Redirect kanban/tasks cũ về kanban
      {
        path: 'kanban/tasks',
        redirectTo: 'kanban',
        pathMatch: 'full'
      },

      {
        path: 'kanban/projects',
        loadComponent: () => import('./features/kanban/components/project-page/project-page').then(m => m.ProjectPageComponent),
        title: 'Dự án - AI Smart Kanban'
      },

      // Default route - Redirect từ '' sang 'kanban'
      // Route này sẽ bắt trường hợp / nhưng không khớp pathMatch 'full' (nếu có)
      // Tuy nhiên do Landing Page đã dùng path: '' và pathMatch 'full',
      // route này sẽ bắt các trường hợp fallback khác (nếu cần thiết)
      // Nhưng thực tế sẽ ít chạy vào đây, để an toàn ta vẫn giữ redirect
    ]
  },

  // 2. Tuyến đường cho trang Đăng ký (Register - Giao diện độc lập)
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Tạo tài khoản - Digit24',
    canActivate: [guestGuard]
  },

  // Tuyến đường cho trang Đăng nhập (Login - Giao diện độc lập)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Đăng nhập - Digit24',
    canActivate: [guestGuard]
  },

  // Tuyến đường Xác minh Email (Cũ - giữ để tương thích)
  {
    path: 'verify-email',
    loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
    title: 'Xác minh Email - Digit24'
  },

  // ─── Auth flows Supabase ─────────────────────────────────
  // Màn hình chờ sau khi đăng ký — hiển thị hướng dẫn kiểm tra email
  {
    path: 'auth/verify-pending',
    loadComponent: () => import('./features/auth/verify-pending/verify-pending.component').then(m => m.VerifyPendingComponent),
    title: 'Xác nhận Email - AI Smart Kanban'
  },

  // Callback page — Supabase redirect về đây sau khi user click link trong email
  {
    path: 'auth/callback',
    loadComponent: () => import('./features/auth/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent),
    title: 'Đang kích hoạt tài khoản... - AI Smart Kanban'
  },

  // ─── 404 Not Found ──────────────────────────────────────────────────────────
  // Phải đặt CUỐI CÙNG — Angular khớp route theo thứ tự từ trên xuống
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Trang không tìm thấy - AI Smart Kanban'
  }
];