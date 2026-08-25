import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard bảo vệ các route cần đăng nhập.
 * Dùng Signal thay vì Observable — không cần take(1), map, pipe.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Nếu đang tải session lần đầu, chờ (trả về Promise)
  if (authService.loading()) {
    return new Promise<boolean | import('@angular/router').UrlTree>(resolve => {
      let attempts = 0;
      const MAX_ATTEMPTS = 100; // Timeout tối đa 5 giây (100 × 50ms)
      const interval = setInterval(() => {
        attempts++;
        if (!authService.loading() || attempts >= MAX_ATTEMPTS) {
          clearInterval(interval);
          resolve(authService.isAuthenticated() ? true : router.createUrlTree(['/login']));
        }
      }, 50);
    });
  }

  return authService.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

/**
 * Guard ngăn người dùng đã đăng nhập quay lại trang Login/Register.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.loading()) {
    return new Promise<boolean | import('@angular/router').UrlTree>(resolve => {
      let attempts = 0;
      const MAX_ATTEMPTS = 100; // Timeout tối đa 5 giây (100 × 50ms)
      const interval = setInterval(() => {
        attempts++;
        if (!authService.loading() || attempts >= MAX_ATTEMPTS) {
          clearInterval(interval);
          resolve(!authService.isAuthenticated() ? true : router.createUrlTree(['/app/kanban']));
        }
      }, 50);
    });
  }

  return !authService.isAuthenticated() ? true : router.createUrlTree(['/app/kanban']);
};
