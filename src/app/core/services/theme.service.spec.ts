import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [ThemeService]
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with default theme if nothing in localStorage', () => {
    service = TestBed.inject(ThemeService);
    expect(service.getCurrentTheme()).toBe('/assets/images/bg_abstract_10.jpg');
    
    // Subscribe to test observable
    let current = '';
    service.currentTheme$.subscribe(v => current = v);
    expect(current).toBe('/assets/images/bg_abstract_10.jpg');
  });

  it('should initialize with theme from localStorage if available', () => {
    localStorage.setItem('ai_smart_kanban_theme', '/assets/images/custom.jpg');
    service = TestBed.inject(ThemeService);
    expect(service.getCurrentTheme()).toBe('/assets/images/custom.jpg');
  });

  it('should set theme and save to localStorage', () => {
    service = TestBed.inject(ThemeService);
    service.setTheme('/assets/images/new_bg.jpg');
    
    expect(service.getCurrentTheme()).toBe('/assets/images/new_bg.jpg');
    expect(localStorage.getItem('ai_smart_kanban_theme')).toBe('/assets/images/new_bg.jpg');
  });
});
