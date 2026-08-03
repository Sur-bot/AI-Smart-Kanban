import { Component, signal, HostListener, OnInit, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, MatIconModule],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayoutComponent implements OnInit {
  translate = inject(TranslateService);

  headerLinkText = input.required<string>();
  headerLinkRoute = input.required<string>();

  isLoaded = signal(false);
  isLangPopupOpen = signal(false);
  currentLang = signal('vi');

  languages = [
    { code: 'vi', label: 'VN', fullName: 'Việt Nam (Tiếng Việt)' },
    { code: 'en', label: 'EN', fullName: 'United Kingdom (English)' }
  ];

  ngOnInit() {
    // 1. Khởi tạo ngôn ngữ
    const savedLang = localStorage.getItem('appLang');
    if (savedLang) {
      this.currentLang.set(savedLang);
      this.translate.use(savedLang);
    } else {
      this.currentLang.set(this.translate.currentLang() || 'vi');
    }

    // 2. Preload ảnh nền kèm khoảng thời gian giả lập loading mượt mà (1.2s)
    const MIN_LOADING_TIME = 1200;
    const startTime = Date.now();

    const bgImg = new Image();
    bgImg.src = '/assets/images/auth-bg.jpg';

    const finishLoading = () => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);
      setTimeout(() => {
        this.isLoaded.set(true);
      }, remainingTime);
    };

    bgImg.onload = finishLoading;
    bgImg.onerror = finishLoading;

    // Timeout an toàn
    setTimeout(() => {
      this.isLoaded.set(true);
    }, 2000);
  }

  toggleLangPopup(event: Event) {
    event.stopPropagation();
    this.isLangPopupOpen.set(!this.isLangPopupOpen());
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem('appLang', lang);
    this.isLangPopupOpen.set(false);
  }

  @HostListener('document:click')
  onClickOutside() {
    this.isLangPopupOpen.set(false);
  }

  get currentLangLabel() {
    return this.languages.find(l => l.code === this.currentLang())?.label || 'VN';
  }
}
