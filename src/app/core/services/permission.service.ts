import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProjectMemberRole } from '../../core/models/task.model';

/**
 * Permission matrix — defines which roles can perform which actions.
 * This is the single source of truth for UI role-gating.
 */
const PERMISSION_MATRIX: Record<string, ProjectMemberRole[]> = {
  // Project
  'project.view':            ['owner', 'admin', 'member', 'viewer'],
  'project.update':          ['owner', 'admin'],
  'project.delete':          ['owner'],
  'project.archive':         ['owner', 'admin'],
  'project.transferOwner':   ['owner'],

  // Members
  'member.view':             ['owner', 'admin', 'member', 'viewer'],
  'member.invite':           ['owner', 'admin'],
  'member.inviteLink':       ['owner', 'admin', 'member'], // public project only
  'member.remove':           ['owner', 'admin'],
  'member.changeRole':       ['owner', 'admin'],
  'member.leave':            ['admin', 'member', 'viewer'],

  // Tasks
  'task.view':               ['owner', 'admin', 'member', 'viewer'],
  'task.create':             ['owner', 'admin', 'member'],
  'task.update':             ['owner', 'admin', 'member'],
  'task.delete':             ['owner', 'admin'],
  'task.assign':             ['owner', 'admin', 'member'],

  // Board configuration
  'status.manage':           ['owner', 'admin'],
  'label.create':            ['owner', 'admin', 'member'],

  // Comments & Checklists
  'comment.create':          ['owner', 'admin', 'member'],
  'checklist.create':        ['owner', 'admin', 'member'],
  'checklist.toggle':        ['owner', 'admin', 'member'],
};


export type PermissionAction = keyof typeof PERMISSION_MATRIX;

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  /** Current user role in the active project */
  private _currentRole = signal<ProjectMemberRole | null>(null);
  readonly currentRole = this._currentRole.asReadonly();

  /** Convenience computed booleans */
  readonly isOwner = computed(() => this._currentRole() === 'owner');
  readonly isAdmin = computed(() => this._currentRole() === 'admin');
  readonly isMember = computed(() => this._currentRole() === 'member');
  readonly isViewer = computed(() => this._currentRole() === 'viewer');
  readonly isReadOnly = computed(() => this._currentRole() === 'viewer');

  /**
   * Load the current user's role for the given project.
   * Called when switching projects or on first load.
   */
  loadRole(projectId: string, members: Array<{ user_id: string; role: ProjectMemberRole }>, currentUserId: string): void {
    const myMembership = members.find(m => m.user_id === currentUserId);
    this._currentRole.set(myMembership?.role ?? null);
  }

  /**
   * Set the role directly (e.g., from API response)
   */
  setRole(role: ProjectMemberRole | null): void {
    this._currentRole.set(role);
  }

  /**
   * Check if the current user can perform a specific action
   */
  can(action: string): boolean {
    const role = this._currentRole();
    if (!role) return false;
    const allowed = PERMISSION_MATRIX[action];
    if (!allowed) return false;
    return allowed.includes(role);
  }

  /**
   * Check if a specific role can perform a specific action (static check)
   */
  static roleCanDo(role: ProjectMemberRole, action: string): boolean {
    const allowed = PERMISSION_MATRIX[action];
    if (!allowed) return false;
    return allowed.includes(role);
  }

  /**
   * Reset role (e.g., on logout)
   */
  clear(): void {
    this._currentRole.set(null);
  }
}
