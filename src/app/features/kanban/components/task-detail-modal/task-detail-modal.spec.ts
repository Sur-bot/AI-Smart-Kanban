import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TaskDetailModalComponent } from './task-detail-modal';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskStore } from '../../../../core/state/task.store';
import { PermissionService } from '../../../../core/services/permission.service';
import { provideTranslateService } from '@ngx-translate/core';
import { ElementRef } from '@angular/core';

describe('TaskDetailModalComponent', () => {
  let component: TaskDetailModalComponent;
  let fixture: ComponentFixture<TaskDetailModalComponent>;
  let mockTaskStore: any;
  let mockPermissionService: any;

  beforeEach(async () => {
    mockTaskStore = {
      currentProjectId: vi.fn().mockReturnValue('project1')
    };
    mockPermissionService = {
      can: vi.fn().mockReturnValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [TaskDetailModalComponent],
      providers: [
        provideTranslateService(),
        { provide: TaskStore, useValue: mockTaskStore },
        { provide: PermissionService, useValue: mockPermissionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailModalComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
    
    // Mock containerRef after detectChanges so it doesn't get overwritten
    component.containerRef = {
      nativeElement: {
        getBoundingClientRect: () => ({ left: 100, width: 1000 })
      }
    } as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger close', () => {
    vi.useFakeTimers();
    const emitSpy = vi.spyOn(component.close, 'emit');
    component.triggerClose();
    
    expect(component.isClosing).toBe(true);
    vi.advanceTimersByTime(300);
    expect(emitSpy).toHaveBeenCalled();
    expect(component.isClosing).toBe(false);
    vi.useRealTimers();
  });

  it('should toggle fullscreen', () => {
    expect(component.isFullscreen).toBe(false);
    component.toggleFullscreen();
    expect(component.isFullscreen).toBe(true);
  });

  it('should start drag', () => {
    const event = { preventDefault: vi.fn() } as unknown as MouseEvent;
    component.startDrag(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.isDragging).toBe(true);
  });

  it('should update leftPaneWidth on drag', () => {
    component.isDragging = true;
    
    // Test a valid percentage (e.g. offsetX = 400 => 40%)
    const event = { clientX: 500 } as unknown as MouseEvent;
    component.onDrag(event);
    
    expect(component.leftPaneWidth).toBe(40); // (500-100)/1000 = 40%
  });

  it('should limit leftPaneWidth between 20 and 60 on drag', () => {
    component.isDragging = true;
    
    // Test < 20%
    component.onDrag({ clientX: 200 } as unknown as MouseEvent); // 10%
    expect(component.leftPaneWidth).toBe(38); // unchanged from default
    
    // Test > 60%
    component.onDrag({ clientX: 800 } as unknown as MouseEvent); // 70%
    expect(component.leftPaneWidth).toBe(38); // unchanged
  });

  it('should stop drag', () => {
    component.isDragging = true;
    component.stopDrag();
    expect(component.isDragging).toBe(false);
  });
});
