import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

/**
 * VerifyEmailComponent — trang xử lý redirect từ link email cũ (legacy).
 * Kể từ khi chuyển sang Supabase Auth, route /verify-email không còn được dùng
 * trong luồng chính. Route mới là /auth/callback.
 * Component này chỉ giữ lại để không bị 404 khi user click link email cũ.
 */
@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, TranslatePipe],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private translate = inject(TranslateService);

  status = signal<'loading' | 'success' | 'error'>('loading');
  message = signal('Đang xử lý xác minh...');

  async ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status.set('error');
      this.message.set('Liên kết xác minh không hợp lệ.');
      return;
    }

    try {
      // Kiểm tra session hiện tại (Supabase có thể đã tự xử lý token từ URL)
      const { data } = await this.authService.getClient().auth.getSession();

      if (data.session) {
        this.status.set('success');
        this.message.set('Xác minh thành công! Đang chuyển hướng...');
        setTimeout(() => this.router.navigate(['/auth/callback'], {
          state: { fromVerification: true }
        }), 1500);
      } else {
        this.status.set('error');
        this.message.set('Liên kết xác minh đã hết hạn. Vui lòng đăng ký lại hoặc yêu cầu gửi lại email.');
      }
    } catch (err: any) {
      this.status.set('error');
      this.message.set(err.message || 'Có lỗi xảy ra khi xác minh.');
    }
  }
}
