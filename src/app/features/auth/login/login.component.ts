import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthLayoutComponent } from '../components/auth-layout/auth-layout.component';
import { SocialLoginComponent } from '../components/social-login/social-login.component';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
    AuthLayoutComponent,
    SocialLoginComponent
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false]
  });

  loginStep = signal<1 | 2>(1);
  isLoading = signal(false);
  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  showPassword = signal(false);

  get isFormValid() { 
    if (this.loginStep() === 1) {
      return this.loginForm.get('email')?.valid;
    }
    return this.loginForm.valid; 
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  goBackToEmail() {
    this.loginStep.set(1);
    this.loginForm.get('password')?.setValue('');
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    
    if (this.loginStep() === 1) {
      if (this.loginForm.get('email')?.invalid) {
        this.loginForm.get('email')?.markAsTouched();
        return;
      }
      this.loginStep.set(2);
      return;
    }

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const { email, password } = this.loginForm.value;

    try {
      await this.authService.signIn(email, password);

      this.toastMessage.set('Đăng nhập thành công!');
      this.toastType.set('success');
      this.showToast.set(true);

      setTimeout(() => {
        this.showToast.set(false);
        this.router.navigate(['/app/kanban']);
      }, 1500);
    } catch (err: any) {
      const errorMsg = err.message || 'Email hoặc mật khẩu không đúng.';
      this.toastMessage.set(errorMsg);
      this.toastType.set('error');
      this.showToast.set(true);
      setTimeout(() => this.showToast.set(false), 3000);
    } finally {
      this.isLoading.set(false);
    }
  }
}
