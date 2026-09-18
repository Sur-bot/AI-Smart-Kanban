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
  private static hasLoadedBg = false;

  translate = inject(TranslateService);

  headerLinkText = input.required<string>();
  headerLinkRoute = input.required<string>();

  isLoaded = signal(AuthLayoutComponent.hasLoadedBg);
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

    // Set initial --vh value for Safari iOS fallback
    this.updateViewportHeight();

    if (AuthLayoutComponent.hasLoadedBg) {
      return;
    }

    const bgImg = new Image();
    bgImg.src = '/assets/images/auth-bg.jpg';
    bgImg.onload = () => {
      AuthLayoutComponent.hasLoadedBg = true;
      this.isLoaded.set(true);
    };
    bgImg.onerror = () => {
      AuthLayoutComponent.hasLoadedBg = true;
      this.isLoaded.set(true);
    };

    setTimeout(() => {
      AuthLayoutComponent.hasLoadedBg = true;
      this.isLoaded.set(true);
    }, 600);
  }

  /** Updates --vh on resize/orientation change for Safari iOS compatibility. */
  @HostListener('window:resize')
  @HostListener('window:orientationchange')
  protected updateViewportHeight(): void {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
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
