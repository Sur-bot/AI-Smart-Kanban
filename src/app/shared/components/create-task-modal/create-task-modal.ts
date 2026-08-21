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
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TaskStore } from '../../../core/state/task.store';
import { CreateTaskPayload } from '../../../core/models/task.model';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-create-task-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, TranslatePipe],
  templateUrl: './create-task-modal.html',
  styleUrls: ['./create-task-modal.scss'],
})
export class CreateTaskModalComponent implements OnInit {
  /** Trang thai hien thi modal */
  @Input() isOpen = false;

  /** Phat ra khi nguoi dung dong modal */
  @Output() close = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  readonly taskStore = inject(TaskStore);

  form!: FormGroup;
  isSubmitting = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(500)]],
      description: [''],
      assigneeId: [null],
      dueDate: [null],
      projectId: [null],
    });
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.onClose();
  }

  onClose(): void {
    this.form.reset();
    this.isSubmitting = false;
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
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
      assigneeId: values.assigneeId || undefined,
      dueDate: values.dueDate || undefined,
      projectId: values.projectId || undefined,
    };
    this.taskStore.createTask(payload, () => {
      this.onClose();
    });
    // Reset flag sau khi gui (store tu xu ly loi)
    setTimeout(() => { this.isSubmitting = false; }, 1500);
  }

  get projects() {
    return this.taskStore.projects?.() ?? [];
  }
}