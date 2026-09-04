import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeModalComponent } from './theme-modal';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MatDialogRef } from '@angular/material/dialog';
import { ThemeService } from '../../../core/services/theme.service';

describe('ThemeModalComponent', () => {
  let component: ThemeModalComponent;
  let fixture: ComponentFixture<ThemeModalComponent>;
  let mockThemeService: any;
  let mockDialogRef: any;

  beforeEach(async () => {
    mockThemeService = {
      availableThemes: [{ url: 'theme1.jpg' }],
      getCurrentTheme: vi.fn().mockReturnValue('theme1.jpg'),
      setTheme: vi.fn()
    };
    
    mockDialogRef = {
      close: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ThemeModalComponent],
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.initialThemeUrl).toBe('theme1.jpg');
  });

  it('should select theme', () => {
    component.selectTheme({ url: 'theme2.jpg' } as any);
    expect(component.selectedThemeUrl).toBe('theme2.jpg');
    expect(mockThemeService.setTheme).toHaveBeenCalledWith('theme2.jpg');
  });

  it('should save and close', () => {
    component.save();
    expect(component.isSaved).toBe(true);
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should cancel and close', () => {
    component.cancel();
    expect(component.isSaved).toBe(false);
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should restore initial theme on destroy if not saved', () => {
    component.isSaved = false;
    component.ngOnDestroy();
    expect(mockThemeService.setTheme).toHaveBeenCalledWith('theme1.jpg');
  });

  it('should NOT restore initial theme on destroy if saved', () => {
    component.isSaved = true;
    mockThemeService.setTheme.mockClear();
    component.ngOnDestroy();
    expect(mockThemeService.setTheme).not.toHaveBeenCalled();
  });
});
