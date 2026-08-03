import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthLayoutComponent } from '../components/auth-layout/auth-layout.component';
import { SocialLoginComponent } from '../components/social-login/social-login.component';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslatePipe,
    ReactiveFormsModule,
    MatIconModule,
    AuthLayoutComponent,
    SocialLoginComponent
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    fullName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    ]],
    agreeUpdates: [false],
    agreeTraining: [false],
    recaptchaVerified: [false, Validators.requiredTrue]
  });

  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  get isFormValid() { return this.registerForm.valid; }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password, fullName } = this.registerForm.value;

    try {
      await this.authService.signUp(email, password, fullName);

      // Chuyển sang màn hình chờ xác nhận email — truyền email qua navigation state
      this.router.navigate(['/auth/verify-pending'], {
        state: { email }
      });
    } catch (err: any) {
      const msg = err.message || 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.';
      this.errorMessage.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }
}
