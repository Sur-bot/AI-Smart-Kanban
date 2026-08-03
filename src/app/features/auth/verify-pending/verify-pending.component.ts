import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-verify-pending',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './verify-pending.component.html',
  styleUrl: './verify-pending.component.scss'
})
export class VerifyPendingComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Email hiển thị trên màn hình (lấy từ state navigation)
  email = signal<string>('');
  step = signal<number>(1);
  resending = signal<boolean>(false);
  resendCooldown = signal<number>(0);

  private cooldownTimer?: ReturnType<typeof setInterval>;
  private authSubscription?: { data: { subscription: { unsubscribe: () => void } } };

  ngOnInit() {
    // Lấy email từ state navigation (được truyền từ RegisterComponent)
    const nav = this.router.getCurrentNavigation();
    const stateEmail = nav?.extras?.state?.['email'] as string;

    if (stateEmail) {
      this.email.set(stateEmail);
    } else {
      // Nếu vào thẳng URL mà không có email → redirect về register
      this.router.navigate(['/register']);
      return;
    }

    // Lắng nghe Supabase Auth — khi user click link trong email và verify thành công
    // Supabase sẽ phát event SIGNED_IN. Tab/cửa sổ hiện tại sẽ tự động bắt được.
    const subscription = this.authService.getClient().auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // Điều hướng sang AuthCallback để hiện thông báo thành công rồi vào Kanban
        this.router.navigate(['/auth/callback'], {
          state: { fromVerification: true }
        });
      }
    });

    this.authSubscription = subscription as any;
  }

  ngOnDestroy() {
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }
  }

  /**
   * Gửi lại email xác nhận qua Supabase Auth
   */
  async resendEmail() {
    if (this.resendCooldown() > 0 || this.resending()) return;
    this.resending.set(true);

    try {
      const { error } = await this.authService.getClient().auth.resend({
        type: 'signup',
        email: this.email()
      });

      if (error) throw error;

      // Bắt đầu đếm ngược 60 giây
      this.startCooldown(60);
    } catch (err) {
      console.error('[VerifyPending] Lỗi gửi lại email:', err);
    } finally {
      this.resending.set(false);
    }
  }

  private startCooldown(seconds: number) {
    this.resendCooldown.set(seconds);
    this.cooldownTimer = setInterval(() => {
      const current = this.resendCooldown();
      if (current <= 1) {
        this.resendCooldown.set(0);
        clearInterval(this.cooldownTimer);
      } else {
        this.resendCooldown.set(current - 1);
      }
    }, 1000);
  }
}
