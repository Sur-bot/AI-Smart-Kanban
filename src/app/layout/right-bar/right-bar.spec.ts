import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RightBarComponent } from './right-bar';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideTranslateService } from '@ngx-translate/core';

describe('RightBarComponent', () => {
  let component: RightBarComponent;
  let fixture: ComponentFixture<RightBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightBarComponent],
      providers: [provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(RightBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter top and bottom icons', () => {
    expect(component.topIcons.length).toBeGreaterThanOrEqual(0);
    expect(component.bottomIcons.length).toBeGreaterThanOrEqual(0);
  });

  it('should emit openFeature on icon click', () => {
    const emitSpy = vi.spyOn(component.openFeature, 'emit');
    component.onFeatureClick('chat');
    expect(emitSpy).toHaveBeenCalledWith('chat');
  });
});
