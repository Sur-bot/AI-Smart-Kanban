import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberManagementModalComponent } from './member-management-modal';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MatDialogRef } from '@angular/material/dialog';
import { MemberService } from '../../../../core/services/member.service';
import { TaskStore } from '../../../../core/state/task.store';
import { PermissionService } from '../../../../core/services/permission.service';
import { of, throwError } from 'rxjs';
import { ProjectMember } from '../../../../core/models/task.model';

describe('MemberManagementModalComponent', () => {
  let component: MemberManagementModalComponent;
  let fixture: ComponentFixture<MemberManagementModalComponent>;
  let mockDialogRef: any;
  let mockMemberService: any;
  let mockTaskStore: any;
  let mockPermissionService: any;

  const mockMembers: ProjectMember[] = [
    { user_id: 'user1', role: 'admin' } as ProjectMember,
    { user_id: 'user2', role: 'member' } as ProjectMember
  ];

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };
    mockMemberService = {
      getMembers: vi.fn().mockReturnValue(of(mockMembers)),
      addMember: vi.fn().mockReturnValue(of({})),
      removeMember: vi.fn().mockReturnValue(of({})),
      updateRole: vi.fn().mockReturnValue(of({}))
    };
    mockTaskStore = {
      currentProjectId: vi.fn().mockReturnValue('project1'),
      projects: vi.fn().mockReturnValue([{ id: 'project1', name: 'P1' }])
    };
    mockPermissionService = {
      currentRole: vi.fn().mockReturnValue('admin'),
      canManageMembers: true,
      isOwner: vi.fn().mockReturnValue(true),
      can: vi.fn().mockReturnValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [MemberManagementModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MemberService, useValue: mockMemberService },
        { provide: TaskStore, useValue: mockTaskStore },
        { provide: PermissionService, useValue: mockPermissionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MemberManagementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load members on init', () => {
    expect(mockMemberService.getMembers).toHaveBeenCalledWith('project1');
    expect(component.members.length).toBe(2);
    expect(component.isLoading).toBe(false);
  });

  it('should return role label', () => {
    expect(component.roleLabel).toBe('Quản trị viên (Admin)');
    mockPermissionService.currentRole.mockReturnValue('viewer');
    expect(component.roleLabel).toBe('Người xem (Viewer)');
  });

  it('should invite member', () => {
    component.inviteUserId = 'user3';
    component.inviteRole = 'member';
    component.inviteMember();
    
    expect(mockMemberService.addMember).toHaveBeenCalledWith('project1', { userId: 'user3', role: 'member' });
    expect(component.inviteUserId).toBe('');
    expect(mockMemberService.getMembers).toHaveBeenCalledTimes(2); // init + after invite
  });

  it('should handle invite member error', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockMemberService.addMember.mockReturnValue(throwError(() => new Error('Error')));
    
    component.inviteUserId = 'user3';
    component.inviteMember();
    
    expect(window.alert).toHaveBeenCalled();
  });

  it('should remove member if confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.removeMember(mockMembers[0]);
    
    expect(mockMemberService.removeMember).toHaveBeenCalledWith('project1', 'user1');
    expect(mockMemberService.getMembers).toHaveBeenCalledTimes(2);
  });

  it('should not remove member if cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.removeMember(mockMembers[0]);
    
    expect(mockMemberService.removeMember).not.toHaveBeenCalled();
  });

  it('should change role', () => {
    const member = { user_id: 'user2', role: 'member' } as ProjectMember;
    component.changeRole(member, 'admin');
    
    expect(mockMemberService.updateRole).toHaveBeenCalledWith('project1', 'user2', 'admin');
    expect(member.role).toBe('admin');
  });

  it('should close dialog', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
