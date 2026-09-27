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

});
