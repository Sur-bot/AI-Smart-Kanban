import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DueDatePickerComponent } from './due-date-picker';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideTranslateService } from '@ngx-translate/core';

describe('DueDatePickerComponent', () => {
  let component: DueDatePickerComponent;
  let fixture: ComponentFixture<DueDatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DueDatePickerComponent],
      providers: [provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(DueDatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sync value on init', () => {
    const d = new Date(2025, 5, 15, 12, 0, 0);
    component.value = d.toISOString();
    component.ngOnInit(); // trigger sync again
    
    expect(component.selectedDate).toBeTruthy();
    expect(component.selectedDate?.getFullYear()).toBe(2025);
  });

  it('should toggle popover', () => {
    const event = { stopPropagation: vi.fn() } as unknown as Event;
    expect(component.isOpen).toBe(false);
    
    component.togglePopover(event);
    expect(component.isOpen).toBe(true);
  });

  it('should clear date', () => {
    const event = { stopPropagation: vi.fn() } as unknown as Event;
    const emitSpy = vi.spyOn(component.valueChange, 'emit');
    
    component.clearDate(event);
    expect(component.selectedDate).toBeNull();
    expect(emitSpy).toHaveBeenCalledWith(null);
  });
});
