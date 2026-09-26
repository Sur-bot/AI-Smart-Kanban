import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        console.error('[Error Interceptor] 403 Forbidden:', error.error?.message || 'Access Denied');
        snackBar.open('Lỗi quyền truy cập: Bạn không có quyền thực hiện hành động này.', 'Đóng', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['bg-red-600', 'text-white']
        });
      }
      return throwError(() => error);
    })
  );
};
