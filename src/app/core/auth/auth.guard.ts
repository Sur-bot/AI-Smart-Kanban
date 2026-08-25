import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard báº£o vá»‡ cÃ¡c route cáº§n Ä‘Äƒng nháº­p.
 * DÃ¹ng Signal thay vÃ¬ Observable â€” khÃ´ng cáº§n take(1), map, pipe.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Náº¿u Ä‘ang táº£i session láº§n Ä‘áº§u, chá» (tráº£ vá» Promise)
  if (authService.loading()) {
    return new Promise<boolean | import('@angular/router').UrlTree>(resolve => {
      let attempts = 0;
      const MAX_ATTEMPTS = 100; // Timeout tá»‘i Ä‘a 5 giÃ¢y (100 Ã— 50ms)
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
 * Guard ngÄƒn ngÆ°á»i dÃ¹ng Ä‘Ã£ Ä‘Äƒng nháº­p quay láº¡i trang Login/Register.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.loading()) {
    return new Promise<boolean | import('@angular/router').UrlTree>(resolve => {
      let attempts = 0;
      const MAX_ATTEMPTS = 100; // Timeout tá»‘i Ä‘a 5 giÃ¢y (100 Ã— 50ms)
      const interval = setInterval(() => {
        attempts++;
        if (!authService.loading() || attempts >= MAX_ATTEMPTS) {
          clearInterval(interval);
          resolve(!authService.isAuthenticated() ? true : router.createUrlTree(['/kanban']));
        }
      }, 50);
    });
  }

  return !authService.isAuthenticated() ? true : router.createUrlTree(['/kanban']);
};

