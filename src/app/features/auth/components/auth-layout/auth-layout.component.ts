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

  isLangPopupOpen = signal(false);
  currentLang = signal('vi');

  languages = [
    { code: 'vi', label: 'VN', fullName: 'Việt Nam (Tiếng Việt)' },
    { code: 'en', label: 'EN', fullName: 'United Kingdom (English)' }
  ];

  ngOnInit() {
    const savedLang = localStorage.getItem('appLang');
    if (savedLang) {
      this.currentLang.set(savedLang);
      this.translate.use(savedLang);
    } else {
      this.currentLang.set(this.translate.currentLang() || 'vi');
    }
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
