import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

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
  message = signal('');

  ngOnInit() {
    this.message.set(this.translate.instant('AUTH_MSG.VERIFYING'));
    const token = this.route.snapshot.queryParamMap.get('token');
    
    if (!token) {
      this.status.set('error');
      this.message.set(this.translate.instant('AUTH_MSG.VERIFY_ERROR_MSG'));
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: (res) => {
        this.status.set('success');
        this.message.set(res.message || this.translate.instant('AUTH_MSG.VERIFY_SUCCESS_MSG'));
        // Tự động chuyển hướng về trang login sau 3 giây
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.status.set('error');
        this.message.set(err.error?.error || this.translate.instant('AUTH_MSG.VERIFY_ERROR_MSG'));
      }
    });
  }
}
