import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateTaskModalComponent } from './create-task-modal';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskStore } from '../../../core/state/task.store';
import { AuthService } from '../../../core/auth/auth.service';
import { provideTranslateService } from '@ngx-translate/core';

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('ResizeObserver', MockResizeObserver);

describe('CreateTaskModalComponent', () => {
  let component: CreateTaskModalComponent;
  let fixture: ComponentFixture<CreateTaskModalComponent>;
  let mockTaskStore: any;
  let mockAuthService: any;

  beforeEach(async () => {
    mockTaskStore = {
      currentProjectId: vi.fn().mockReturnValue('project-1'),
      createTask: vi.fn((payload, cb) => cb())
    };
    
    mockAuthService = {
      user: vi.fn().mockReturnValue({ id: 'user-1', user_metadata: { full_name: 'Test User' } })
    };

    await TestBed.configureTestingModule({
      imports: [CreateTaskModalComponent],
      providers: [
        provideTranslateService(),
        { provide: TaskStore, useValue: mockTaskStore },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTaskModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form and assignee', () => {
    expect(component.assigneeId).toBe('user-1');
    expect(component.assigneeName).toBe('Test User');
    expect(component.form.get('title')).toBeTruthy();
  });

  it('should toggle assignee dropdown', () => {
    const event = { stopPropagation: vi.fn() } as unknown as Event;
    component.toggleAssigneeDropdown(event);
    expect(component.isAssigneeDropdownOpen).toBe(true);
  });

  it('should submit task', () => {
    vi.useFakeTimers();
    component.form.patchValue({ title: 'Test Task' });
    component.onSubmit();
    
    expect(mockTaskStore.createTask).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
