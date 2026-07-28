import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
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
  private translate = inject(TranslateService);
  
  registerForm: FormGroup = this.fb.group({
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
  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  showPassword = signal(false);

  get isFormValid() {
    return this.registerForm.valid;
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const { email, password } = this.registerForm.value;

    this.authService.register({ email, password }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toastMessage.set(res.message || this.translate.instant('AUTH_MSG.REGISTER_SUCCESS'));
        this.toastType.set('success');
        this.showToast.set(true);
        
        setTimeout(() => {
          this.showToast.set(false);
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.isLoading.set(false);
        const errorMsg = err.error?.error || this.translate.instant('AUTH_MSG.REGISTER_ERROR');
        this.toastMessage.set(errorMsg);
        this.toastType.set('error');
        this.showToast.set(true);

        setTimeout(() => this.showToast.set(false), 3000);
      }
    });
  }
}
