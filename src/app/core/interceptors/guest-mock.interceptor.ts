import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { GUEST_TASKS, GUEST_PROJECT, GUEST_STATUSES } from './guest-mock.data';

export const guestMockInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (authService.isGuestMode()) {
    if (req.url.includes('/tasks') && req.method === 'GET') {
      const responseBody = {
        tasks: GUEST_TASKS,
        total: GUEST_TASKS.length,
        page: 1,
        limit: 100,
        totalPages: 1
      };
      
      return of(new HttpResponse({ status: 200, body: responseBody })).pipe(delay(300));
    }
    
    if (req.url.includes('/projects') && !req.url.includes('/statuses') && req.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: [GUEST_PROJECT] })).pipe(delay(100));
    }
    
    if (req.url.includes('/projects') && req.url.includes('/statuses') && req.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: GUEST_STATUSES })).pipe(delay(100));
    }

    if (req.url.includes('/users/me') && req.method === 'GET') {
      return of(new HttpResponse({
        status: 200,
        body: { id: 'user-1', name: 'Nguyễn Văn A (Guest)', email: 'guest@aismartkanban.local', avatar_url: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' }
      })).pipe(delay(100));
    }

    if ((req.url.includes('/tasks') || req.url.includes('/projects')) && ['POST', 'PATCH', 'DELETE'].includes(req.method)) {
      return of(new HttpResponse({ status: 200, body: { ...(req.body as any), id: 'mock-id-' + Date.now() } })).pipe(delay(300));
    }
  }

  return next(req);
};
