import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksPageComponent } from './tasks-page';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { TaskStore } from '../../../../core/state/task.store';
import { PermissionService } from '../../../../core/services/permission.service';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

// Mock ResizeObserver for child components
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('ResizeObserver', MockResizeObserver);

describe('TasksPageComponent', () => {
  let component: TasksPageComponent;
  let fixture: ComponentFixture<TasksPageComponent>;
  let mockRouter: any;
  let mockRoute: any;
  let mockDialog: any;
  let mockTitleService: any;
  let mockTaskStore: any;
  let mockPermissionService: any;

  beforeEach(async () => {
    mockRouter = { navigate: vi.fn() };
    mockRoute = { queryParams: of({ view: 'planner' }) };
    mockDialog = { open: vi.fn() };
    mockTitleService = { setTitle: vi.fn() };
    mockTaskStore = {
      isProjectsInitialized: vi.fn().mockReturnValue(false),
      loadProjects: vi.fn(),
      currentProjectId: vi.fn().mockReturnValue('p1'),
      currentProject: vi.fn().mockReturnValue({ id: 'p1', name: 'Project A' }),
      tasks: vi.fn().mockReturnValue([{ id: 't1' }]),
      selectTask: vi.fn(),
      clearSelectedTask: vi.fn()
    };
    mockPermissionService = {};

    await TestBed.configureTestingModule({
      imports: [TasksPageComponent],
      providers: [
        provideTranslateService(),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: MatDialog, useValue: mockDialog },
        { provide: Title, useValue: mockTitleService },
        { provide: TaskStore, useValue: mockTaskStore },
        { provide: PermissionService, useValue: mockPermissionService }
      ]
    })
    .overrideProvider(MatDialog, { useValue: mockDialog })
    .compileComponents();

    fixture = TestBed.createComponent(TasksPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load projects on init', () => {
    expect(component).toBeTruthy();
    expect(mockTaskStore.loadProjects).toHaveBeenCalled();
  });

  it('should set active view from query params', () => {
    expect(component.activeView).toBe('planner');
  });

  it('should navigate on view change', () => {
    component.onViewChange('gantt');
    expect(component.activeView).toBe('gantt');
    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockRoute,
      queryParams: { view: 'gantt' },
      queryParamsHandling: 'merge'
    });
  });

  it('should open task detail', () => {
    component.openTaskDetail({ id: 't1' } as any);
    expect(component.selectedTask).toEqual({ id: 't1' });
    expect(mockTaskStore.selectTask).toHaveBeenCalledWith('t1');
  });

  it('should close task detail', () => {
    component.selectedTask = { id: 't1' };
    component.closeTaskDetail();
    expect(component.selectedTask).toBeNull();
    expect(mockTaskStore.clearSelectedTask).toHaveBeenCalled();
  });

  it('should open create project modal', () => {
    component.openCreateProject();
    expect(mockDialog.open).toHaveBeenCalled();
  });
});
