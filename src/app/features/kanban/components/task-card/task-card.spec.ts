import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TaskCardComponent } from './task-card';
import { PermissionService } from '../../../../core/services/permission.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TaskCardComponent (System)', () => {
  let component: TaskCardComponent;
  let fixture: ComponentFixture<TaskCardComponent>;
  let mockPermissionService: any;

  beforeEach(async () => {
    mockPermissionService = {
      can: vi.fn().mockReturnValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [TaskCardComponent],
      providers: [
        { provide: PermissionService, useValue: mockPermissionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
    
    // Provide a dummy task
    component.task = {
      id: 't1',
      title: 'Test Task',
      priority: 'high',
      taskType: 'bug',
      labels: [
        { id: 'l1', name: 'L1', color: 'red' }, 
        { id: 'l2', name: 'L2', color: 'blue' }, 
        { id: 'l3', name: 'L3', color: 'green' }, 
        { id: 'l4', name: 'L4', color: 'yellow' }
      ],
      assignees: [{ id: 'u1', name: 'User1', email: '' }],
    } as any;
    
    fixture.detectChanges();
  });

  it('khởi tạo thành công', () => {
    expect(component).toBeTruthy();
  });

  it('tính toán priorityLabel đúng', () => {
    expect(component.priorityLabel).toBe('High');
  });

  it('tính toán taskTypeIcon đúng', () => {
    expect(component.taskTypeIcon).toBe('bug_report');
  });

  it('giới hạn visibleLabels và tính extraLabelCount', () => {
    expect(component.visibleLabels.length).toBe(3);
    expect(component.extraLabelCount).toBe(1);
  });

  it('phát ra event cardClicked khi click vào card', () => {
    const spy = vi.spyOn(component.cardClicked, 'emit');
    component.onCardClick();
    expect(spy).toHaveBeenCalledWith(component.task);
  });
  
  it('phát ra event taskStarted và chặn event bubbling khi onStart', () => {
    const spy = vi.spyOn(component.taskStarted, 'emit');
    const mockEvent = { stopPropagation: vi.fn() } as any;
    component.onStart(mockEvent);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(component.task);
  });
});
