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
  errorMessage = signal<string>('LiÃªn káº¿t xÃ¡c nháº­n Ä‘Ã£ háº¿t háº¡n hoáº·c khÃ´ng há»£p lá»‡.');

  async ngOnInit() {
    // â”€â”€â”€ BÆ°á»›c 1: Kiá»ƒm tra lá»—i tá»« URL hash (Supabase redirect vá» vá»›i #error=...) â”€â”€â”€
    const hash = window.location.hash;

    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const errorCode = params.get('error_code') || '';
      const errorDesc = params.get('error_description') || '';

      this.showError(this.mapErrorMessage(errorCode, errorDesc));
      return;
    }

    // â”€â”€â”€ BÆ°á»›c 2: Kiá»ƒm tra náº¿u Ä‘Æ°á»£c Ä‘iá»u hÆ°á»›ng tá»« VerifyPendingComponent (SIGNED_IN event) â”€â”€â”€
    const nav = this.router.getCurrentNavigation();
    const fromVerification = nav?.extras?.state?.['fromVerification'] as boolean;

    if (fromVerification && this.authService.isAuthenticated()) {
      this.showSuccess();
      return;
    }

    // â”€â”€â”€ BÆ°á»›c 3: Supabase redirect vá» /auth/callback vá»›i token trong hash hoáº·c query â”€â”€â”€
    // supabase-js v2 tá»± Ä‘á»™ng phÃ¡t hiá»‡n vÃ  xá»­ lÃ½ token tá»« URL â†’ cáº­p nháº­t session
    // Chá» 2 giÃ¢y Ä‘á»ƒ quÃ¡ trÃ¬nh nÃ y hoÃ n táº¥t
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const { data, error } = await this.authService.getClient().auth.getSession();

      if (error) throw error;

      if (data.session) {
        this.showSuccess();
      } else {
        this.showError('KhÃ´ng thá»ƒ xÃ¡c nháº­n tÃ i khoáº£n. Link cÃ³ thá»ƒ Ä‘Ã£ háº¿t háº¡n.');
      }
    } catch (err: any) {
      this.showError(err.message || 'CÃ³ lá»—i xáº£y ra khi xÃ¡c nháº­n tÃ i khoáº£n.');
    }
  }

  private showSuccess() {
    this.status.set('success');

    const timer = setInterval(() => {
      const current = this.countdown();
      if (current <= 1) {
        clearInterval(timer);
        this.router.navigate(['/kanban']);
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
   * Ãnh xáº¡ mÃ£ lá»—i Supabase sang thÃ´ng Ä‘iá»‡p tiáº¿ng Viá»‡t thÃ¢n thiá»‡n
   */
  private mapErrorMessage(errorCode: string, errorDesc: string): string {
    const messages: Record<string, string> = {
      'otp_expired': 'LiÃªn káº¿t xÃ¡c nháº­n Ä‘Ã£ háº¿t háº¡n (24 giá»). Vui lÃ²ng Ä‘Äƒng kÃ½ láº¡i hoáº·c yÃªu cáº§u gá»­i láº¡i email.',
      'access_denied': 'LiÃªn káº¿t khÃ´ng há»£p lá»‡. Vui lÃ²ng thá»­ láº¡i.',
      'invalid_token': 'Token xÃ¡c nháº­n khÃ´ng Ä‘Ãºng. Vui lÃ²ng yÃªu cáº§u gá»­i láº¡i email.',
    };
    return messages[errorCode] || decodeURIComponent(errorDesc.replace(/\+/g, ' ')) || 'XÃ¡c nháº­n tháº¥t báº¡i. Vui lÃ²ng thá»­ láº¡i.';
  }
}

