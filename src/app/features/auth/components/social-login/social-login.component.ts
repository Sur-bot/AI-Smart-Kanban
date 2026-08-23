import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-social-login',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './social-login.html',
  styleUrl: './social-login.scss',
})
export class SocialLoginComponent {
  private authService = inject(AuthService);
  
  isLoading = signal<boolean>(false); // Dành cho Google (hoặc dùng chung)
  isFacebookLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  async loginWithGoogle() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.signInWithGoogle();
      // Auth service sẽ tự điều hướng tới Supabase OAuth
    } catch (error: any) {
      console.error('Lỗi đăng nhập Google:', error);
      this.errorMessage.set(error.message || 'Đã có lỗi xảy ra khi đăng nhập bằng Google.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loginWithFacebook() {
    this.isFacebookLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.signInWithFacebook();
    } catch (error: any) {
      console.error('Lỗi đăng nhập Facebook:', error);
      this.errorMessage.set(error.message || 'Đã có lỗi xảy ra khi đăng nhập bằng Facebook.');
    } finally {
      this.isFacebookLoading.set(false);
    }
  }
}
