import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectPageComponent } from './project-page';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../../core/auth/auth.service';
import { TaskStore } from '../../../../core/state/task.store';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

// Mock ResizeObserver for child components
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('ResizeObserver', MockResizeObserver);

describe('ProjectPageComponent', () => {
  let component: ProjectPageComponent;
  let fixture: ComponentFixture<ProjectPageComponent>;
  let mockRouter: any;
  let mockDialog: any;
  let mockAuthService: any;
  let mockTitleService: any;
  let mockTaskStore: any;

  beforeEach(async () => {
    mockRouter = { navigate: vi.fn() };
    mockDialog = { open: vi.fn() };
    mockAuthService = {
      user: vi.fn().mockReturnValue({ id: 'user1' })
    };
    mockTitleService = { setTitle: vi.fn() };
    mockTaskStore = {
      isProjectsInitialized: vi.fn().mockReturnValue(false),
      loadProjects: vi.fn(),
      setCurrentProject: vi.fn(),
      projects: vi.fn().mockReturnValue([{ id: 'p1', is_public: false }]),
      deleteProject: vi.fn(),
      archiveProject: vi.fn(),
      updateProject: vi.fn(),
      currentProjectId: vi.fn().mockReturnValue('p1'),
      currentProject: vi.fn().mockReturnValue({ id: 'p1', name: 'Project 1' })
    };

    await TestBed.configureTestingModule({
      imports: [ProjectPageComponent],
      providers: [
        provideTranslateService(),
        provideRouter([]),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
        { provide: MatDialog, useValue: mockDialog },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Title, useValue: mockTitleService },
        { provide: TaskStore, useValue: mockTaskStore }
      ]
    })
    .overrideProvider(MatDialog, { useValue: mockDialog })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load projects on init', () => {
    expect(component).toBeTruthy();
    expect(mockTitleService.setTitle).toHaveBeenCalledWith('Dự án - AI Smart Kanban');
    expect(mockTaskStore.loadProjects).toHaveBeenCalled();
  });

  it('should change view mode', () => {
    component.onViewChange('gantt');
    expect(component.activeView).toBe('gantt');
  });

  it('should navigate to kanban on project select', () => {
    component.onProjectSelect({ id: 'p1' } as any);
    expect(mockTaskStore.setCurrentProject).toHaveBeenCalledWith('p1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/kanban'], { queryParams: { view: 'list' } });
  });

  it('should open member modal', () => {
    component.openMemberModal({ id: 'p1' } as any);
    expect(mockTaskStore.setCurrentProject).toHaveBeenCalledWith('p1');
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should open edit project modal', () => {
    component.openEditProject({ id: 'p1' } as any);
    expect(mockTaskStore.setCurrentProject).toHaveBeenCalledWith('p1');
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should handle batch actions', () => {
    component.onBatchAction({ action: 'Xóa', projectIds: ['p1'], applyToAll: false });
    expect(mockTaskStore.deleteProject).toHaveBeenCalledWith('p1');

    component.onBatchAction({ action: 'Lưu trữ', projectIds: ['p1'], applyToAll: false });
    expect(mockTaskStore.archiveProject).toHaveBeenCalledWith('p1');

    component.onBatchAction({ action: 'Kích hoạt lại', projectIds: ['p1'], applyToAll: false });
    expect(mockTaskStore.updateProject).toHaveBeenCalledWith('p1', { status: 'active' });

    component.onBatchAction({ action: 'Thay đổi quyền riêng tư', projectIds: ['p1'], applyToAll: false });
    expect(mockTaskStore.updateProject).toHaveBeenCalledWith('p1', { is_public: true });
  });
});
