import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddTagBadgeComponent } from './add-tag-badge';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AddTagBadgeComponent', () => {
  let component: AddTagBadgeComponent;
  let fixture: ComponentFixture<AddTagBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTagBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AddTagBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle popup', () => {
    const event = { stopPropagation: vi.fn() } as unknown as MouseEvent;
    
    expect(component.isOpen()).toBe(false);
    
    component.togglePopup(event);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.isOpen()).toBe(true);
    
    component.togglePopup(event);
    expect(component.isOpen()).toBe(false);
  });

  it('should close popup', () => {
    component.isOpen.set(true);
    component.closePopup();
    expect(component.isOpen()).toBe(false);
  });

  it('should close popup on document click if open', () => {
    component.isOpen.set(true);
    component.onDocumentClick();
    expect(component.isOpen()).toBe(false);
  });
  
  it('should NOT close popup on document click if already closed', () => {
    component.isOpen.set(false);
    component.onDocumentClick();
    expect(component.isOpen()).toBe(false);
  });
});
