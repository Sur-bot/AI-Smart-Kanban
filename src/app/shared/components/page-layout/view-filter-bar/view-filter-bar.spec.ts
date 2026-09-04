import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewFilterBarComponent } from './view-filter-bar';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RightBarService } from '../../../../core/services/right-bar.service';

describe('ViewFilterBarComponent', () => {
  let component: ViewFilterBarComponent;
  let fixture: ComponentFixture<ViewFilterBarComponent>;
  let mockRightBarService: any;

  beforeEach(async () => {
    mockRightBarService = {
      openFeature: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ViewFilterBarComponent],
      providers: [
        { provide: RightBarService, useValue: mockRightBarService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewFilterBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit viewChange on selectView', () => {
    const emitSpy = vi.spyOn(component.viewChange, 'emit');
    component.selectView('planner');
    
    expect(component.activeView).toBe('planner');
    expect(emitSpy).toHaveBeenCalledWith('planner');
  });

  it('should open feature if quick filter has rightBarFeatureId', () => {
    component.onQuickFilterClick({ id: 'f1', label: 'L1', icon: 'i1', count: 0, isActive: false, rightBarFeatureId: 'chat' });
    expect(mockRightBarService.openFeature).toHaveBeenCalledWith('chat');
  });
});
