import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { MemberService } from '../../../../core/services/member.service';
import { TaskStore } from '../../../../core/state/task.store';
import { PermissionService } from '../../../../core/services/permission.service';
import { ProjectMember, ProjectMemberRole } from '../../../../core/models/task.model';

@Component({
  selector: 'app-member-management-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './member-management-modal.html',
  styleUrls: ['./member-management-modal.scss']
})
export class MemberManagementModalComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<MemberManagementModalComponent>);
  private memberService = inject(MemberService);
  private taskStore = inject(TaskStore);
  readonly permissionService = inject(PermissionService);

  members: ProjectMember[] = [];
  isLoading = true;
  inviteUserId = '';
  inviteRole: ProjectMemberRole = 'member';

  get currentProjectId(): string | null {
    return this.taskStore.currentProjectId();
  }

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    const projectId = this.currentProjectId;
    if (!projectId) return;

    this.isLoading = true;
    this.memberService.getMembers(projectId).subscribe({
      next: (data) => {
        this.members = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi tải thành viên', err);
        this.isLoading = false;
      }
    });
  }

  inviteMember() {
    const projectId = this.currentProjectId;
    if (!projectId || !this.inviteUserId.trim()) return;

    this.memberService.addMember(projectId, {
      userId: this.inviteUserId.trim(),
      role: this.inviteRole
    }).subscribe({
      next: () => {
        this.inviteUserId = '';
        this.loadMembers();
        // Cần tải lại project/store nếu cần thiết
      },
      error: (err) => {
        console.error('Lỗi thêm thành viên', err);
        alert('Có lỗi xảy ra khi thêm thành viên (User ID không tồn tại hoặc đã có trong dự án).');
      }
    });
  }

  removeMember(member: ProjectMember) {
    const projectId = this.currentProjectId;
    if (!projectId) return;

    if (confirm(`Bạn có chắc muốn xóa ${member.user_id} khỏi dự án?`)) {
      this.memberService.removeMember(projectId, member.user_id).subscribe({
        next: () => {
          this.loadMembers();
        },
        error: (err) => {
          console.error('Lỗi xóa thành viên', err);
          alert('Không thể xóa thành viên này.');
        }
      });
    }
  }

  changeRole(member: ProjectMember, newRole: ProjectMemberRole) {
    const projectId = this.currentProjectId;
    if (!projectId || member.role === newRole) return;

    this.memberService.updateRole(projectId, member.user_id, newRole).subscribe({
      next: () => {
        member.role = newRole;
      },
      error: (err) => {
        console.error('Lỗi đổi quyền', err);
        alert('Không thể đổi quyền thành viên này.');
        this.loadMembers(); // reload to revert
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}
