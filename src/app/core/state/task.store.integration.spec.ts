import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskStore } from './task.store';
import { TaskService } from '../services/task.service';
import { ProjectService } from '../services/project.service';
import { PermissionService } from '../services/permission.service';
import { AuthService } from '../auth/auth.service';
import { MemberService } from '../services/member.service';
import { environment } from '../../../environments/environment';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';

describe('TaskStore (Integration)', () => {
  let store: any;
  let httpMock: HttpTestingController;

  const mockUser = { id: 'u1', email: 'test@example.com', name: 'Tester', role: 'user' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TaskStore,
        TaskService,
        ProjectService,
        PermissionService,
        {
          provide: AuthService,
          useValue: { 
            currentUser$: of(mockUser),
            isAuthenticated: () => true, 
            user: () => mockUser 
          }
        },
        {
          provide: MemberService,
          useValue: { getMembers: () => of([]) }
        },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    
    store = TestBed.inject(TaskStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('luồng loadProjects -> auto select project -> loadTasks', async () => {
    const mockProjects = [{ id: 'p1', workspace_id: 'w1', name: 'Project 1', status: 'active', owner_id: 'u1', privacy: 'private', project_type: 'project', created_at: '', project_members: [], statuses: [] }];
    const mockTasks = { tasks: [{ id: 't1', title: 'Task 1', projectId: 'p1' }], total: 1, page: 1, limit: 10, totalPages: 1 };

    // Khởi động
    store.loadProjects();

    // 1. Phải có HTTP request gọi API projects
    const reqProj = httpMock.expectOne(`${environment.apiUrl}/projects`);
    expect(reqProj.request.method).toBe('GET');
    reqProj.flush(mockProjects);
    
    // Đợi effect chạy bằng Promise.resolve() (yield microtask)
    await Promise.resolve(); 

    // Kiểm tra state của project
    expect(store.projects()).toEqual(mockProjects);
    expect(store.currentProjectId()).toBe('p1');
    expect(store.projectsLoading()).toBe(false);
    expect(store.isProjectsInitialized()).toBe(true);

    // Effect sẽ gọi API tasks tự động khi có project được chọn
    // Lắng nghe 2 request được gọi đồng thời: statuses và tasks
    
    const reqStatuses = httpMock.expectOne(`${environment.apiUrl}/projects/p1/statuses`);
    expect(reqStatuses.request.method).toBe('GET');
    reqStatuses.flush([]);

    const reqTask = httpMock.expectOne(req => req.url.includes(`${environment.apiUrl}/tasks`));
    expect(reqTask.request.method).toBe('GET');
    expect(reqTask.request.params.get('projectId')).toBe('p1');
    reqTask.flush(mockTasks);

    // Cập nhật state của task
    expect(store.tasks()).toEqual(mockTasks.tasks);
    expect(store.loading()).toBe(false);
  });
});
