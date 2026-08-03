import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ThemeBackground {
  id: string;
  url: string;
  name?: string;
  isDefault?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'ai_smart_kanban_theme';
  
  // Danh sách các hình nền
  readonly availableThemes: ThemeBackground[] = [
    { id: 'abstract_1', url: '/assets/images/bg_abstract_1.jpg', name: 'Sóng lụa xanh' },
    { id: 'abstract_2', url: '/assets/images/bg_abstract_2.jpg', name: 'Gradient mượt mà' },
    { id: 'abstract_3', url: '/assets/images/bg_abstract_3.jpg', name: 'Mạch điện tử Neon' },
    { id: 'abstract_4', url: '/assets/images/bg_abstract_4.jpg', name: 'Ánh sáng cầu vồng' },
    { id: 'abstract_5', url: '/assets/images/bg_abstract_5.jpg', name: 'Nghệ thuật Fluid' },
    { id: 'abstract_6', url: '/assets/images/bg_abstract_6.jpg', name: 'Lưới Gradient Mesh' },
    { id: 'abstract_7', url: '/assets/images/bg_abstract_7.jpg', name: 'Sóng tím ảo diệu' },
    { id: 'abstract_8', url: '/assets/images/bg_abstract_8.jpg', name: 'Khối 3D lơ lửng' },
    { id: 'abstract_9', url: '/assets/images/bg_abstract_9.jpg', name: 'Cọ vẽ nham thạch' },
    { id: 'abstract_10', url: '/assets/images/bg_abstract_10.jpg', name: 'Khối vuông Gradient', isDefault: true },
    { id: 'abstract_11', url: '/assets/images/bg_abstract_11.jpg', name: 'Năng lượng mặt trời' },
    { id: 'abstract_12', url: '/assets/images/bg_abstract_12.jpg', name: 'Mây mờ ảo' }
  ];

  private readonly defaultThemeUrl = '/assets/images/bg_abstract_10.jpg';
  private themeSubject = new BehaviorSubject<string>(this.defaultThemeUrl);
  
  currentTheme$: Observable<string> = this.themeSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadTheme();
  }

  private loadTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem(this.THEME_KEY);
      if (savedTheme) {
        this.themeSubject.next(savedTheme);
      }
    }
  }

  setTheme(url: string): void {
    this.themeSubject.next(url);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.THEME_KEY, url);
    }
  }

  getCurrentTheme(): string {
    return this.themeSubject.value;
  }
}
