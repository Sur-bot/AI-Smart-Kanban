import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);

  // Since we use HttpOnly cookies, we don't need to manually attach the token to headers.
  // We just pass the request through, but catch 401 errors to trigger the refresh token flow.

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(req: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((tokenResponse: any) => {
        isRefreshing = false;
        // Notify any waiting requests that refresh is done
        refreshTokenSubject.next(tokenResponse);
        // Retry the original request
        return next(req);
      }),
      catchError((error) => {
        isRefreshing = false;
        authService.logout().subscribe(); // Force logout if refresh fails
        return throwError(() => error);
      })
    );
  } else {
    // Wait until refresh is done
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(() => next(req))
    );
  }
}
