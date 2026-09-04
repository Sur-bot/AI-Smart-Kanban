import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PermissionService } from './permission.service';
import { ProjectMemberRole } from '../models/task.model';

// ─── Mock HttpClient (inject nhưng không dùng trong unit test) ────────────────
const httpSpy = { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() };

// ─────────────────────────────────────────────────────────────────────────────

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PermissionService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(PermissionService);
  });

  // ── Khởi tạo ────────────────────────────────────────────────────────────────

  describe('khởi tạo', () => {
    it('currentRole ban đầu phải là null', () => {
      expect(service.currentRole()).toBeNull();
    });

    it('tất cả computed booleans phải là false khi chưa set role', () => {
      expect(service.isOwner()).toBe(false);
      expect(service.isAdmin()).toBe(false);
      expect(service.isMember()).toBe(false);
      expect(service.isViewer()).toBe(false);
      expect(service.isReadOnly()).toBe(false);
    });
  });

  // ── setRole() ────────────────────────────────────────────────────────────────

  describe('setRole()', () => {
    const roles: ProjectMemberRole[] = ['owner', 'admin', 'moderator', 'member', 'viewer'];

    roles.forEach((role) => {
      it(`setRole('${role}') → currentRole() trả về '${role}'`, () => {
        service.setRole(role);
        expect(service.currentRole()).toBe(role);
      });
    });

    it('setRole(null) → currentRole() trả về null', () => {
      service.setRole('admin');
      service.setRole(null);
      expect(service.currentRole()).toBeNull();
    });
  });

  // ── Computed booleans ─────────────────────────────────────────────────────────

  describe('computed signals', () => {
    it('isOwner = true chỉ khi role là owner', () => {
      service.setRole('owner');
      expect(service.isOwner()).toBe(true);
      expect(service.isAdmin()).toBe(false);
      expect(service.isMember()).toBe(false);
      expect(service.isViewer()).toBe(false);
    });

    it('isAdmin = true chỉ khi role là admin', () => {
      service.setRole('admin');
      expect(service.isAdmin()).toBe(true);
      expect(service.isOwner()).toBe(false);
    });

    it('isMember = true chỉ khi role là member', () => {
      service.setRole('member');
      expect(service.isMember()).toBe(true);
      expect(service.isOwner()).toBe(false);
    });

    it('isViewer = true VÀ isReadOnly = true khi role là viewer', () => {
      service.setRole('viewer');
      expect(service.isViewer()).toBe(true);
      expect(service.isReadOnly()).toBe(true);
    });
  });

  // ── clear() ───────────────────────────────────────────────────────────────────

  describe('clear()', () => {
    it('clear() sau khi set role → currentRole phải là null', () => {
      service.setRole('owner');
      service.clear();
      expect(service.currentRole()).toBeNull();
    });

    it('clear() kéo theo isOwner về false', () => {
      service.setRole('owner');
      service.clear();
      expect(service.isOwner()).toBe(false);
    });
  });

  // ── loadRole() ────────────────────────────────────────────────────────────────

  describe('loadRole()', () => {
    it('tìm đúng role của user trong danh sách members', () => {
      const members = [
        { user_id: 'user-1', role: 'admin' as ProjectMemberRole },
        { user_id: 'user-2', role: 'viewer' as ProjectMemberRole },
      ];
      service.loadRole('proj-1', members, 'user-2');
      expect(service.currentRole()).toBe('viewer');
    });

    it('trả về null khi userId không có trong danh sách members', () => {
      const members = [{ user_id: 'user-1', role: 'admin' as ProjectMemberRole }];
      service.loadRole('proj-1', members, 'non-existent-user');
      expect(service.currentRole()).toBeNull();
    });

    it('danh sách members rỗng → null', () => {
      service.setRole('owner');
      service.loadRole('proj-1', [], 'user-1');
      expect(service.currentRole()).toBeNull();
    });

    it('lấy role của member đầu tiên tìm thấy', () => {
      const members = [
        { user_id: 'user-1', role: 'moderator' as ProjectMemberRole },
      ];
      service.loadRole('proj-1', members, 'user-1');
      expect(service.currentRole()).toBe('moderator');
    });
  });

  // ── can() ─────────────────────────────────────────────────────────────────────

  describe('can()', () => {
    it('trả về false khi chưa set role', () => {
      expect(service.can('task.create')).toBe(false);
    });

    it('trả về false với action không tồn tại trong matrix', () => {
      service.setRole('owner');
      expect(service.can('unknown.action')).toBe(false);
    });

    // ── owner ─────────────────────────────────────────────────────────────────
    describe('role: owner — được phép mọi action', () => {
      beforeEach(() => service.setRole('owner'));

      const ownerActions = [
        'project.view', 'project.update', 'project.delete',
        'project.archive', 'project.transferOwner',
        'member.view', 'member.invite', 'member.inviteLink',
        'member.remove', 'member.changeRole',
        'task.view', 'task.create', 'task.update', 'task.delete', 'task.assign',
        'status.manage', 'label.create',
        'comment.create', 'checklist.create', 'checklist.toggle',
      ];

      ownerActions.forEach((action) => {
        it(`can('${action}') → true`, () => {
          expect(service.can(action)).toBe(true);
        });
      });
    });

    // ── admin ─────────────────────────────────────────────────────────────────
    describe('role: admin', () => {
      beforeEach(() => service.setRole('admin'));

      it('can project.update → true', () => expect(service.can('project.update')).toBe(true));
      it('can project.delete → false (chỉ owner)', () => expect(service.can('project.delete')).toBe(false));
      it('can project.transferOwner → false', () => expect(service.can('project.transferOwner')).toBe(false));
      it('can member.remove → true', () => expect(service.can('member.remove')).toBe(true));
      it('can status.manage → true', () => expect(service.can('status.manage')).toBe(true));
      it('can task.delete → true', () => expect(service.can('task.delete')).toBe(true));
      it('can member.leave → true', () => expect(service.can('member.leave')).toBe(true));
    });

    // ── moderator ─────────────────────────────────────────────────────────────
    describe('role: moderator', () => {
      beforeEach(() => service.setRole('moderator'));

      it('can task.create → true', () => expect(service.can('task.create')).toBe(true));
      it('can task.delete → true', () => expect(service.can('task.delete')).toBe(true));
      it('can project.update → false', () => expect(service.can('project.update')).toBe(false));
      it('can member.remove → false', () => expect(service.can('member.remove')).toBe(false));
      it('can member.invite → true', () => expect(service.can('member.invite')).toBe(true));
      it('can status.manage → false', () => expect(service.can('status.manage')).toBe(false));
      it('can member.leave → true', () => expect(service.can('member.leave')).toBe(true));
    });

    // ── member ────────────────────────────────────────────────────────────────
    describe('role: member', () => {
      beforeEach(() => service.setRole('member'));

      it('can task.create → true', () => expect(service.can('task.create')).toBe(true));
      it('can task.delete → false', () => expect(service.can('task.delete')).toBe(false));
      it('can project.update → false', () => expect(service.can('project.update')).toBe(false));
      it('can member.invite → false', () => expect(service.can('member.invite')).toBe(false));
      it('can comment.create → true', () => expect(service.can('comment.create')).toBe(true));
      it('can checklist.toggle → true', () => expect(service.can('checklist.toggle')).toBe(true));
      it('can member.leave → true', () => expect(service.can('member.leave')).toBe(true));
    });

    // ── viewer ────────────────────────────────────────────────────────────────
    describe('role: viewer', () => {
      beforeEach(() => service.setRole('viewer'));

      it('can task.view → true', () => expect(service.can('task.view')).toBe(true));
      it('can task.create → false', () => expect(service.can('task.create')).toBe(false));
      it('can task.delete → false', () => expect(service.can('task.delete')).toBe(false));
      it('can comment.create → false', () => expect(service.can('comment.create')).toBe(false));
      it('can project.view → true', () => expect(service.can('project.view')).toBe(true));
      it('can member.leave → true', () => expect(service.can('member.leave')).toBe(true));
    });
  });

  // ── static roleCanDo() ────────────────────────────────────────────────────────

  describe('static roleCanDo()', () => {
    it('owner roleCanDo project.delete → true', () => {
      expect(PermissionService.roleCanDo('owner', 'project.delete')).toBe(true);
    });

    it('viewer roleCanDo task.create → false', () => {
      expect(PermissionService.roleCanDo('viewer', 'task.create')).toBe(false);
    });

    it('admin roleCanDo project.transferOwner → false', () => {
      expect(PermissionService.roleCanDo('admin', 'project.transferOwner')).toBe(false);
    });

    it('member roleCanDo comment.create → true', () => {
      expect(PermissionService.roleCanDo('member', 'comment.create')).toBe(true);
    });

    it('action không tồn tại → false dù là owner', () => {
      expect(PermissionService.roleCanDo('owner', 'non.existent')).toBe(false);
    });
  });
});
