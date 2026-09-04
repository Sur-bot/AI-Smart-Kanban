import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner';
import { describe, it, expect, beforeEach } from 'vitest';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute sizeClasses', () => {
    fixture.componentRef.setInput('size', 'sm');
    expect(component.sizeClasses).toContain('w-6 h-6');
    
    fixture.componentRef.setInput('size', 'md');
    expect(component.sizeClasses).toContain('w-12 h-12');
  });

  it('should compute colorClasses', () => {
    fixture.componentRef.setInput('color', 'indigo');
    expect(component.colorClasses).toContain('border-indigo-500/20');
  });
});
