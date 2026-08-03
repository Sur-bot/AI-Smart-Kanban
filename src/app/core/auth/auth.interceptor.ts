import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from, switchMap, catchError } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Interceptor tự động đính kèm Supabase Access Token vào mọi request tới Backend API.
 * Không cần quản lý refresh token thủ công — Supabase tự xử lý.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  // Chỉ đính kèm token vào request tới Backend API của chúng ta
  const isApiRequest = req.url.includes('/api/');
  if (!isApiRequest) {
    return next(req);
  }

  const token = authService.accessToken();

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Nếu 401: Supabase sẽ tự refresh token ở lần gọi tiếp theo qua onAuthStateChange
      if (error.status === 401) {
        console.warn('[AuthInterceptor] 401 — Token có thể đã hết hạn, Supabase sẽ tự refresh.');
      }
      return throwError(() => error);
    })
  );
};
