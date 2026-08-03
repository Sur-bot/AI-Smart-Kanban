import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // 1. Landing Page (Trang chủ)
  {
    path: '',
    loadComponent: () => import('./features/landing-page/landing-page').then(m => m.LandingPageComponent),
    title: 'AI Smart Kanban - Quản lý thông minh'
  },

  // 2. Trang Lưu trữ Hình ảnh (Đứng độc lập hoặc đưa vào app tùy thiết kế, tạm giữ nguyên nếu nó độc lập)
  {
    path: 'image-storage',
    loadComponent: () => import('./features/image-storage/components/image-storage-page/image-storage-page').then(m => m.ImageStoragePageComponent),
    title: 'Lưu trữ hình ảnh - AI Smart Kanban'
  },

  // 3. Bộ cấu trúc chính với Layout (Dashboard)
  {
    path: 'app',
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayoutComponent),
    title: 'AI Smart Kanban',
    // canActivate: [authGuard], // TODO: Tạm tắt để vào thẳng Kanban
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
      {
        path: '',
        redirectTo: 'kanban',
        pathMatch: 'full'
      }
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

  // 3. Trang 404 - Lỗi không tìm thấy (Phải đặt ở cuối cùng)
  // Tính năng 404 sẽ được mở khi Shared Module hoàn thiện
];