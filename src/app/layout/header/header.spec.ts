import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideTranslateService } from '@ngx-translate/core';

// Mock ResizeObserver for JSDOM
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('ResizeObserver', MockResizeObserver);

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        provideTranslateService()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle setting popup', () => {
    expect(component.isPopupOpen).toBe(false);
    component.togglePopup();
    expect(component.isPopupOpen).toBe(true);
    component.togglePopup();
    expect(component.isPopupOpen).toBe(false);
  });

  it('should toggle invite popup', () => {
    expect(component.isInviteOpen).toBe(false);
    component.toggleInvite();
    expect(component.isInviteOpen).toBe(true);
    component.toggleInvite();
    expect(component.isInviteOpen).toBe(false);
  });

  it('should toggle profile popup', () => {
    expect(component.isProfileOpen).toBe(false);
    component.toggleProfile();
    expect(component.isProfileOpen).toBe(true);
    component.toggleProfile();
    expect(component.isProfileOpen).toBe(false);
  });

  it('should switch view', () => {
    component.switchView('list');
    expect(component.currentView()).toBe('list');
    
    component.switchView('board');
    expect(component.currentView()).toBe('board');
  });

  it('should close popups on document click outside', () => {
    component.togglePopup();
    expect(component.activePopup).toBe('setting');
    
    const target = document.createElement('div');
    component.onDocumentClick({ target } as unknown as Event);
    expect(component.activePopup).toBeNull();
  });

  it('should NOT close popups on document click inside setting dropdown', () => {
    component.togglePopup();
    
    const target = document.createElement('div');
    target.classList.add('setting-slider-dropdown');
    component.onDocumentClick({ target } as unknown as Event);
    expect(component.activePopup).toBe('setting');
  });
});
