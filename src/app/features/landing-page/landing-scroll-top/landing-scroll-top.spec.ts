import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LandingScrollTopComponent,
  SCROLL_TOP_THRESHOLD_PX,
} from './landing-scroll-top';

describe('LandingScrollTopComponent', () => {
  let component: LandingScrollTopComponent;
  let fixture: ComponentFixture<LandingScrollTopComponent>;
  let rootElement: HTMLElement;

  beforeEach(async () => {
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [LandingScrollTopComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingScrollTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    rootElement = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('ẩn nút mặc định khi ở đầu trang và tuân thủ 100% Semantic HTML5 (0 thẻ div)', () => {
    expect(component).toBeTruthy();
    expect(component.isVisible()).toBe(false);
    expect(rootElement.querySelector('button.scroll-top-btn')).toBeNull();
    expect(rootElement.querySelectorAll('div').length).toBe(0);
  });

  it('hiển thị nút khi cuộn vượt ngưỡng 300px và gọi window.scrollTo mượt mà khi click', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    Object.defineProperty(window, 'scrollY', {
      value: SCROLL_TOP_THRESHOLD_PX + 50,
      writable: true,
      configurable: true,
    });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(component.isVisible()).toBe(true);
    expect(rootElement.querySelectorAll('div').length).toBe(0);

    const btn = rootElement.querySelector<HTMLButtonElement>('button.scroll-top-btn');
    expect(btn).not.toBeNull();
    expect(btn?.querySelector('mat-icon')?.textContent?.trim()).toBe('arrow_upward');

    btn?.click();
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('ẩn tạm thời nút cuộn khi hộp thoại Feedback đang mở (suppressed = true)', () => {
    Object.defineProperty(window, 'scrollY', {
      value: SCROLL_TOP_THRESHOLD_PX + 100,
      writable: true,
      configurable: true,
    });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(component.isVisible()).toBe(true);

    fixture.componentRef.setInput('suppressed', true);
    fixture.detectChanges();

    expect(component.isVisible()).toBe(false);
    expect(rootElement.querySelector('button.scroll-top-btn')).toBeNull();
  });
});

