import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProjectDrawerModalComponent } from './project-drawer-modal';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskStore } from '../../../../core/state/task.store';
import { AuthService } from '../../../../core/auth/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('ProjectDrawerModalComponent', () => {
  let component: ProjectDrawerModalComponent;
  let fixture: ComponentFixture<ProjectDrawerModalComponent>;
  let mockTaskStore: any;
  let mockAuthService: any;
  let mockUserService: any;
  let mockDialog: any;

  beforeEach(async () => {
    mockTaskStore = {
      currentProject: vi.fn().mockReturnValue({ workspace_id: 'ws1' }),
      createProject: vi.fn((payload, cb) => cb({ id: 'p1', ...payload }))
    };
    
    mockAuthService = {
      user: vi.fn().mockReturnValue({ id: 'user1', email: 'test@example.com', user_metadata: { name: 'Owner' } })
    };
    
    mockUserService = {
      searchUsers: vi.fn().mockReturnValue(of([{ id: 'user2', name: 'Member' }]))
    };
    
    mockDialog = {
      open: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProjectDrawerModalComponent],
      providers: [
        provideTranslateService(),
        { provide: TaskStore, useValue: mockTaskStore },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDrawerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and init owner', () => {
    expect(component).toBeTruthy();
    expect(component.ownerId).toBe('user1');
    expect(component.ownerName).toBe('Owner');
  });

  it('should handle wizard steps', () => {
    expect(component.currentStep).toBe(1);
    
    component.nextStep();
    expect(component.currentStep).toBe(2);
    
    component.nextStep(); // should fail because no name
    expect(component.currentStep).toBe(2);
    
    component.projectName = 'Project 1';
    component.nextStep();
    expect(component.currentStep).toBe(3);
    
    component.nextStep();
    expect(component.currentStep).toBe(4);
    
    component.prevStep();
    expect(component.currentStep).toBe(3);
  });

  it('should toggle fullscreen', () => {
    expect(component.isFullscreen).toBe(false);
    component.toggleFullscreen();
    expect(component.isFullscreen).toBe(true);
  });


  it('should submit create project', () => {
    const emitSpy = vi.spyOn(component.projectCreated, 'emit');
    const closeSpy = vi.spyOn(component, 'onClose');
    
    component.projectName = 'Test Project';
    component.projectType = 'project';
    component.submitCreateProject();
    
    expect(mockTaskStore.createProject).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });
});
