import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/auth/auth.service';

type CallbackStatus = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.scss'
})
export class AuthCallbackComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  status = signal<CallbackStatus>('loading');
  countdown = signal<number>(3);
  errorMessage = signal<string>('Liên kết xác nhận đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.');

  async ngOnInit() {
    // Trường hợp 1: Được điều hướng từ VerifyPendingComponent sau khi Supabase phát SIGNED_IN
    const nav = this.router.getCurrentNavigation();
    const fromVerification = nav?.extras?.state?.['fromVerification'] as boolean;

    if (fromVerification && this.authService.isAuthenticated()) {
      this.showSuccess();
      return;
    }

    // Trường hợp 2: Người dùng click link trong email → Supabase redirect về /auth/callback?access_token=...
    // supabase-js tự động phát hiện token trong URL fragment/query và cập nhật session
    try {
      const { data, error } = await this.authService.getClient().auth.getSession();

      if (error) throw error;

      if (data.session) {
        this.showSuccess();
      } else {
        // Chờ 2 giây để supabase-js xử lý token từ URL (có thể chậm hơn ngOnInit)
        setTimeout(async () => {
          const { data: retryData } = await this.authService.getClient().auth.getSession();
          if (retryData.session) {
            this.showSuccess();
          } else {
            this.status.set('error');
          }
        }, 2000);
      }
    } catch (err: any) {
      console.error('[AuthCallback] Error:', err);
      this.errorMessage.set(err.message || 'Có lỗi xảy ra khi xác nhận tài khoản.');
      this.status.set('error');
    }
  }

  private showSuccess() {
    this.status.set('success');

    // Đếm ngược 3 giây rồi chuyển vào Kanban
    const timer = setInterval(() => {
      const current = this.countdown();
      if (current <= 1) {
        clearInterval(timer);
        this.router.navigate(['/app/kanban']);
      } else {
        this.countdown.set(current - 1);
      }
    }, 1000);
  }
}
