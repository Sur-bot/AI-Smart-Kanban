import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateButtonComponent } from './create-button';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CreateButtonComponent', () => {
  let component: CreateButtonComponent;
  let fixture: ComponentFixture<CreateButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit create event on button click if not disabled', () => {
    const emitSpy = vi.spyOn(component.create, 'emit');
    const event = { stopPropagation: vi.fn() } as unknown as Event;
    
    component.onCreateClick(event);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should NOT emit create event on button click if disabled', () => {
    const emitSpy = vi.spyOn(component.create, 'emit');
    const event = { stopPropagation: vi.fn() } as unknown as Event;
    
    component.disabled = true;
    component.onCreateClick(event);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit dropdownClick event on dropdown click if not disabled', () => {
    const emitSpy = vi.spyOn(component.dropdownClick, 'emit');
    const event = { stopPropagation: vi.fn() } as unknown as Event;
    
    component.onDropdownClick(event);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(event);
  });

  it('should NOT emit dropdownClick event on dropdown click if disabled', () => {
    const emitSpy = vi.spyOn(component.dropdownClick, 'emit');
    const event = { stopPropagation: vi.fn() } as unknown as Event;
    
    component.disabled = true;
    component.onDropdownClick(event);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
  });
});
