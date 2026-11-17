import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { LandingCtaComponent } from './landing-cta';

describe('LandingCtaComponent', () => {
  let component: LandingCtaComponent;
  let fixture: ComponentFixture<LandingCtaComponent>;
  let rootElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingCtaComponent],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingCtaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    rootElement = fixture.nativeElement as HTMLElement;
  });

  it('khởi tạo thành công và tuân thủ 100% Semantic HTML5 (không dùng thẻ div)', () => {
    expect(component).toBeTruthy();
    expect(rootElement.querySelectorAll('div').length).toBe(0);

    const section = rootElement.querySelector('section.cta-section');
    expect(section).not.toBeNull();
    expect(section?.getAttribute('itemtype')).toBe('https://schema.org/WebPageElement');

    const brandMeta = section?.querySelector('meta[itemprop="name"]');
    expect(brandMeta?.getAttribute('content')).toBe('Digit24');
  });

  it('hiển thị nút CTA điều hướng đến trang đăng ký kèm mat-icon', () => {
    const ctaLink = rootElement.querySelector<HTMLAnchorElement>('a.cta-button');
    expect(ctaLink).not.toBeNull();
    expect(ctaLink?.getAttribute('href')).toBe('/register');

    const icon = ctaLink?.querySelector('mat-icon');
    expect(icon?.textContent?.trim()).toBe('arrow_forward');
  });
});

