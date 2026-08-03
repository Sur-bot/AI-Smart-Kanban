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
  errorMessage = signal<string>('Liên kết xác nhận đã hết hạn hoặc không hợp lệ.');

  async ngOnInit() {
    // ─── Bước 1: Kiểm tra lỗi từ URL hash (Supabase redirect về với #error=...) ───
    const hash = window.location.hash;

    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const errorCode = params.get('error_code') || '';
      const errorDesc = params.get('error_description') || '';

      this.showError(this.mapErrorMessage(errorCode, errorDesc));
      return;
    }

    // ─── Bước 2: Kiểm tra nếu được điều hướng từ VerifyPendingComponent (SIGNED_IN event) ───
    const nav = this.router.getCurrentNavigation();
    const fromVerification = nav?.extras?.state?.['fromVerification'] as boolean;

    if (fromVerification && this.authService.isAuthenticated()) {
      this.showSuccess();
      return;
    }

    // ─── Bước 3: Supabase redirect về /auth/callback với token trong hash hoặc query ───
    // supabase-js v2 tự động phát hiện và xử lý token từ URL → cập nhật session
    // Chờ 2 giây để quá trình này hoàn tất
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const { data, error } = await this.authService.getClient().auth.getSession();

      if (error) throw error;

      if (data.session) {
        this.showSuccess();
      } else {
        this.showError('Không thể xác nhận tài khoản. Link có thể đã hết hạn.');
      }
    } catch (err: any) {
      this.showError(err.message || 'Có lỗi xảy ra khi xác nhận tài khoản.');
    }
  }

  private showSuccess() {
    this.status.set('success');

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

  private showError(message: string) {
    this.errorMessage.set(message);
    this.status.set('error');
  }

  /**
   * Ánh xạ mã lỗi Supabase sang thông điệp tiếng Việt thân thiện
   */
  private mapErrorMessage(errorCode: string, errorDesc: string): string {
    const messages: Record<string, string> = {
      'otp_expired': 'Liên kết xác nhận đã hết hạn (24 giờ). Vui lòng đăng ký lại hoặc yêu cầu gửi lại email.',
      'access_denied': 'Liên kết không hợp lệ. Vui lòng thử lại.',
      'invalid_token': 'Token xác nhận không đúng. Vui lòng yêu cầu gửi lại email.',
    };
    return messages[errorCode] || decodeURIComponent(errorDesc.replace(/\+/g, ' ')) || 'Xác nhận thất bại. Vui lòng thử lại.';
  }
}
