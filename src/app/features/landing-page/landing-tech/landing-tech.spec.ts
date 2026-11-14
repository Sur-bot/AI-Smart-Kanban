import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { LandingTechComponent } from './landing-tech';
import { TECH_LAYER_GROUPS, TOTAL_TECHNOLOGIES_COUNT } from './landing-tech.data';

describe('LandingTechComponent', () => {
  let component: LandingTechComponent;
  let fixture: ComponentFixture<LandingTechComponent>;
  let rootElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingTechComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingTechComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    rootElement = fixture.nativeElement as HTMLElement;
  });

  it('khởi tạo mặc định tầng Frontend gọn gàng nhưng vẫn chứa đủ 17 công nghệ cho GEO', () => {
    expect(component).toBeTruthy();
    expect(component.activeCategory()).toBe('frontend');
    expect(component.layerGroups.length).toBe(4);
    expect(TOTAL_TECHNOLOGIES_COUNT).toBe(17);

    const allCards = rootElement.querySelectorAll('article.tech-card');
    expect(allCards.length).toBe(TOTAL_TECHNOLOGIES_COUNT);

    const visibleGroups = rootElement.querySelectorAll('section.tech-layer-group:not([hidden])');
    expect(visibleGroups.length).toBe(1);
    expect(visibleGroups[0].querySelectorAll('article.tech-card').length).toBe(6);
  });

  it('tuân thủ 100% Semantic HTML5 và chuẩn GEO/Schema.org (không dùng thẻ div)', () => {
    expect(rootElement.querySelectorAll('div').length).toBe(0);

    const section = rootElement.querySelector('section#tech');
    expect(section).not.toBeNull();
    expect(section?.getAttribute('itemtype')).toBe('https://schema.org/SoftwareApplication');

    const h2 = rootElement.querySelectorAll('h2');
    const h3 = rootElement.querySelectorAll('h3');
    const h4 = rootElement.querySelectorAll('h4');

    expect(h2.length).toBe(1);
    expect(h3.length).toBe(TECH_LAYER_GROUPS.length);
    expect(h4.length).toBe(TOTAL_TECHNOLOGIES_COUNT);
  });

  it('chuyển đổi tab tầng kiến trúc mượt mà và mở toàn bộ 17 công nghệ khi chọn Xem tất cả (Happy Path)', () => {
    const tabButtons = Array.from(
      rootElement.querySelectorAll<HTMLButtonElement>('button.tech-tab-btn')
    );

    expect(tabButtons.length).toBe(5);
    expect(tabButtons[0].getAttribute('aria-selected')).toBe('true');

    // Chuyển sang tầng AI Copilot & Backend (index 1)
    tabButtons[1].click();
    fixture.detectChanges();

    expect(component.activeCategory()).toBe('backend');
    expect(tabButtons[1].getAttribute('aria-selected')).toBe('true');

    const backendVisibleGroups = rootElement.querySelectorAll(
      'section.tech-layer-group:not([hidden])'
    );
    expect(backendVisibleGroups.length).toBe(1);
    expect(backendVisibleGroups[0].querySelectorAll('article.tech-card').length).toBe(3);

    // Chọn Xem tất cả (index 4)
    tabButtons[4].click();
    fixture.detectChanges();

    expect(component.activeCategory()).toBe('all');
    expect(tabButtons[4].getAttribute('aria-selected')).toBe('true');

    const allVisibleGroups = rootElement.querySelectorAll('section.tech-layer-group:not([hidden])');
    expect(allVisibleGroups.length).toBe(4);
  });

  it('render đầy đủ 17 ảnh logo SVG khi tải thành công', () => {
    const images = rootElement.querySelectorAll('img.tech-logo-img');
    const fallbacks = rootElement.querySelectorAll('mat-icon.tech-logo-fallback');

    expect(images.length).toBe(TOTAL_TECHNOLOGIES_COUNT);
    expect(fallbacks.length).toBe(0);
  });

  it('chuyển sang mat-icon fallback an toàn khi logo SVG tải lỗi (Error Path)', () => {
    const firstLogoImg = rootElement.querySelector<HTMLImageElement>('img.tech-logo-img');
    expect(firstLogoImg).not.toBeNull();

    firstLogoImg?.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(component.isIconFailed('angular')).toBe(true);
    expect(rootElement.querySelectorAll('img.tech-logo-img').length).toBe(
      TOTAL_TECHNOLOGIES_COUNT - 1
    );
    expect(rootElement.querySelectorAll('mat-icon.tech-logo-fallback').length).toBe(1);

    // Đảm bảo idempotency khi gọi lặp lại cùng một mã công nghệ
    component.handleImageError('angular');
    fixture.detectChanges();
    expect(component.failedIcons().size).toBe(1);
  });
});
