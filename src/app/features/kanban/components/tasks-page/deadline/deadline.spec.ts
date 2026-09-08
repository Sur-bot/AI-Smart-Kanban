import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DeadlineComponent } from './deadline';
import { TaskStore } from '../../../../../core/state/task.store';
import { PermissionService } from '../../../../../core/services/permission.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TaskItem } from '../../../../../core/models/task.model';

describe('DeadlineComponent (Class Logic)', () => {
  let component: DeadlineComponent;
  let mockTaskStore: any;
  let mockPermissionService: any;

  beforeEach(() => {
    mockTaskStore = {
      deadlineColumns: vi.fn().mockReturnValue([]),
      loading: vi.fn().mockReturnValue(false),
      projectsLoading: vi.fn().mockReturnValue(false),
      isProjectsInitialized: vi.fn().mockReturnValue(true),
      updateTaskDueDate: vi.fn(),
      bulkMoveTasks: vi.fn()
    };

    mockPermissionService = {
      can: vi.fn().mockReturnValue(true)
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: TaskStore, useValue: mockTaskStore },
        { provide: PermissionService, useValue: mockPermissionService }
      ]
    });

    TestBed.runInInjectionContext(() => {
      component = new DeadlineComponent();
    });

    // Mock Date to a fixed date for predictable tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-08T10:00:00Z')); // Tuesday
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('onTaskDrop', () => {
    function createDropEvent(targetColId: string, itemData: any): CdkDragDrop<any> {
      return {
        previousContainer: { id: 'prev', data: [itemData] } as any,
        container: { id: targetColId, data: [] } as any,
        item: { data: itemData } as any,
        currentIndex: 0,
        previousIndex: 0,
        isPointerOverContainer: true,
        distance: { x: 0, y: 0 },
        dropPoint: { x: 0, y: 0 },
        event: new MouseEvent('drop')
      };
    }

    it('should set newDueDate to end of today when target is "today"', () => {
      const task = { id: 't1', dueDate: undefined } as TaskItem;
      const event = createDropEvent('today', task);
      
      component.onTaskDrop(event, 'today');
      
      // Expected: Today at 23:59:59 local time (which might depend on timezone in test, but let's check ISO string logic)
      const expectedDate = new Date();
      expectedDate.setHours(23, 59, 59);
      
      expect(mockTaskStore.updateTaskDueDate).toHaveBeenCalledWith('t1', expectedDate.toISOString());
    });

    it('should set newDueDate to Friday 18:00 of this week when target is "this-week"', () => {
      const task = { id: 't2' } as TaskItem;
      const event = createDropEvent('this-week', task);
      
      component.onTaskDrop(event, 'this-week');
      
      const expectedDate = new Date('2026-09-11T18:00:00.000'); // Friday of the fake week (Sep 11)
      expect(mockTaskStore.updateTaskDueDate).toHaveBeenCalledWith('t2', expectedDate.toISOString());
    });

    it('should set newDueDate to null when target is "no-deadline"', () => {
      const task = { id: 't3', dueDate: '2026-09-08' } as TaskItem;
      const event = createDropEvent('no-deadline', task);
      
      component.onTaskDrop(event, 'no-deadline');
      
      expect(mockTaskStore.updateTaskDueDate).toHaveBeenCalledWith('t3', null);
    });

    it('should do nothing when target is "overdue" or "completed"', () => {
      const task = { id: 't4', dueDate: '2026-09-08' } as TaskItem;
      const event1 = createDropEvent('overdue', task);
      component.onTaskDrop(event1, 'overdue');
      
      const event2 = createDropEvent('completed', task);
      component.onTaskDrop(event2, 'completed');
      
      expect(mockTaskStore.updateTaskDueDate).not.toHaveBeenCalled();
      expect(mockTaskStore.bulkMoveTasks).not.toHaveBeenCalled();
    });
  });
});
