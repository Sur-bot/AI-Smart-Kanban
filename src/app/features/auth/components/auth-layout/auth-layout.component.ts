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

    // 2. Preload ảnh nền cục bộ để đảm bảo giao diện hiển thị đồng nhất
    const bgImg = new Image();
    bgImg.src = '/assets/images/auth-bg.jpg';
    bgImg.onload = () => {
      this.isLoaded.set(true);
    };
    bgImg.onerror = () => {
      this.isLoaded.set(true);
    };

    // Timeout an toàn tối đa 600ms phòng trường hợp render chậm
    setTimeout(() => {
      this.isLoaded.set(true);
    }, 600);
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
