import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TaskStore } from '../../../core/state/task.store';
import { AuthService } from '../../../core/auth/auth.service';
import { CreateTaskPayload } from '../../../core/models/task.model';
import { DueDatePickerComponent } from '../due-date-picker/due-date-picker';
import { AssigneePopoverComponent } from '../assignee-popover/assignee-popover';

@Component({
  selector: 'app-create-task-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule, DueDatePickerComponent, AssigneePopoverComponent],
  templateUrl: './create-task-modal.html',
  styleUrls: ['./create-task-modal.scss'],
})
export class CreateTaskModalComponent implements OnInit {
  /** Trạng thái hiển thị modal */
  @Input() isOpen = false;

  /** Phát ra khi người dùng đóng modal */
  @Output() close = new EventEmitter<void>();

  /** Phát ra khi bấm "Biểu mẫu chi tiết" */
  @Output() openDetail = new EventEmitter<Partial<CreateTaskPayload>>();

  private readonly fb = inject(FormBuilder);
  readonly taskStore = inject(TaskStore);
  private readonly authService = inject(AuthService);

  form!: FormGroup;
  isSubmitting = false;
  isHighPriority = false;

  // ─── Assignee State ──────────────────────────────
  assigneeName = 'Văn Anh Nguyễn';
  assigneeAvatar: string | null = null;
  assigneeId: string | null = null;
  isAssigneeDropdownOpen = false;
  isFileDropdownOpen = false;

  ngOnInit(): void {
    this.initAssignee();
    const now = new Date();
    const defaultDueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 19, 0, 0).toISOString();

    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(500)]],
      description: [''],
      assigneeId: [this.assigneeId],
      dueDate: [defaultDueDate],
      projectId: [this.taskStore.currentProjectId() || null],
      priority: ['none'],
    });
  }

  private initAssignee(): void {
    const user = this.authService.user();
    if (user) {
      const meta = user.user_metadata || {};
      this.assigneeName = meta['full_name'] || meta['name'] || user.email?.split('@')[0] || 'Văn Anh Nguyễn';
      this.assigneeAvatar = meta['avatar_url'] || null;
      this.assigneeId = user.id;
    } else {
      this.assigneeName = 'Văn Anh Nguyễn';
      this.assigneeId = 'current-user';
    }
  }

  onDueDateChange(isoDate: string | null): void {
    this.form.patchValue({ dueDate: isoDate });
  }

  toggleAssigneeDropdown(event: Event): void {
    event.stopPropagation();
    this.isAssigneeDropdownOpen = !this.isAssigneeDropdownOpen;
  }

  onMemberSelected(event: {id: string, name: string, avatar: string | null}): void {
    this.assigneeName = event.name;
    this.assigneeId = event.id;
    this.assigneeAvatar = event.avatar;
    this.form.patchValue({ assigneeId: event.id });
    this.isAssigneeDropdownOpen = false;
  }

  clearAssignee(): void {
    this.assigneeName = '';
    this.assigneeId = null;
    this.assigneeAvatar = null;
    this.form.patchValue({ assigneeId: null });
  }

  toggleHighPriority(): void {
    this.isHighPriority = !this.isHighPriority;
    this.form.patchValue({ priority: this.isHighPriority ? 'high' : 'none' });
  }

  onDetailClick(event: Event): void {
    event.preventDefault();
    const values = this.form.value;
    this.openDetail.emit({
      title: values.title?.trim() || '',
      description: values.description?.trim() || '',
      assigneeId: this.assigneeId || undefined,
      dueDate: values.dueDate || undefined,
      priority: this.isHighPriority ? 'high' : 'none',
      projectId: this.taskStore.currentProjectId() || undefined,
    });
    this.onClose();
  }

  toggleFileDropdown(event: Event): void {
    event.stopPropagation();
    this.isFileDropdownOpen = !this.isFileDropdownOpen;
  }

  onUploadFile(): void {
    this.isFileDropdownOpen = false;
  }

  onPickFromDrive(): void {
    this.isFileDropdownOpen = false;
  }

  onDialogContentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.assignee-popover') && !target.closest('.assignee-wrapper')) {
      this.isAssigneeDropdownOpen = false;
    }
    if (!target.closest('.file-dropdown-wrapper')) {
      this.isFileDropdownOpen = false;
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isAssigneeDropdownOpen = false;
    this.isFileDropdownOpen = false;
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    if (this.isAssigneeDropdownOpen) {
      this.isAssigneeDropdownOpen = false;
      return;
    }
    if (this.isOpen) this.onClose();
  }

  onClose(): void {
    this.form.reset();
    this.isSubmitting = false;
    this.isAssigneeDropdownOpen = false;
    this.isFileDropdownOpen = false;
    this.isHighPriority = false;
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      if (this.isAssigneeDropdownOpen) {
        this.isAssigneeDropdownOpen = false;
        return;
      }
      this.onClose();
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;
    const values = this.form.value;
    const payload: CreateTaskPayload = {
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      assigneeId: this.assigneeId || undefined,
      dueDate: values.dueDate || undefined,
      projectId: this.taskStore.currentProjectId() || undefined,
      priority: this.isHighPriority ? 'high' : 'none',
    };
    this.taskStore.createTask(payload, () => {
      this.onClose();
    });
    setTimeout(() => { this.isSubmitting = false; }, 1500);
  }
}