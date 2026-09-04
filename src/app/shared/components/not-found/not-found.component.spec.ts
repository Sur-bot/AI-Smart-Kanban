import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotFoundComponent } from './not-found.component';
import { Location } from '@angular/common';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideTranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../core/services/theme.service';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;
  let locationSpy: any;

  beforeEach(async () => {
    locationSpy = { back: vi.fn() };
    
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: Location, useValue: locationSpy },
        { provide: ThemeService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should go back if history length > 1', () => {
    const originalHistoryLength = window.history.length;
    Object.defineProperty(window.history, 'length', { value: 2, configurable: true });
    
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
    
    Object.defineProperty(window.history, 'length', { value: originalHistoryLength, configurable: true });
  });
});
