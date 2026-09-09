import { Component, Input, Output, EventEmitter, HostListener, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { TaskDetail, TaskItem } from '../../../../core/models/task.model';
import { TaskStore } from '../../../../core/state/task.store';
import { PermissionService } from '../../../../core/services/permission.service';
import { JobRoleBadgeComponent } from '../../../../shared/components/job-role-badge/job-role-badge';
import { TaskSubtasksComponent } from './task-subtasks/task-subtasks';
import { TaskCommentsComponent } from './task-comments/task-comments';

@Component({
  selector: 'app-task-detail-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, TranslatePipe, JobRoleBadgeComponent, TaskSubtasksComponent, TaskCommentsComponent],
  templateUrl: './task-detail-modal.html',
  styleUrls: ['./task-detail-modal.scss']
})
export class TaskDetailModalComponent {
  readonly taskStore = inject(TaskStore);
  readonly permissionService = inject(PermissionService);

  @Input() task: TaskDetail | TaskItem | any = null;
  @Output() close = new EventEmitter<void>();

  @ViewChild('modalContainer') containerRef!: ElementRef<HTMLDivElement>;

  leftPaneWidth: number = 65;
  isDragging: boolean = false;
  isClosing: boolean = false;
  isFullscreen: boolean = false;
  hasUnsavedChanges: boolean = false;

  triggerClose() {
    if (this.hasUnsavedChanges) {
      if (!confirm('Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn đóng?')) {
        return;
      }
    }
    
    this.isClosing = true;
    setTimeout(() => {
      this.close.emit();
      this.isClosing = false;
    }, 300);
  }

  markAsDirty() {
    this.hasUnsavedChanges = true;
  }

  saveChanges() {
    if (!this.hasUnsavedChanges) return;
    
    // TODO: Dispatch save action to TaskStore
    console.log('Saving task details...', this.task);
    
    this.hasUnsavedChanges = false;
    alert('Đã lưu thay đổi thành công!');
  }

  onSubtaskClicked(subtaskId: string) {
    if (this.hasUnsavedChanges) {
      if (!confirm('Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn mở thẻ mới?')) {
        return;
      }
    }
    // Logic to open sub-task in the modal (replaces current view)
    // We could emit an event to the parent Board, or just load the subtask directly here.
    // For now, we will dispatch an action to load the subtask detail.
    console.log('Opening subtask:', subtaskId);
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }

  startDrag(event: MouseEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  @HostListener('document:mousemove', ['$event'])
  onDrag(event: MouseEvent) {
    if (!this.isDragging || !this.containerRef) return;
    
    const containerRect = this.containerRef.nativeElement.getBoundingClientRect();
    const offsetX = event.clientX - containerRect.left;
    const newPercentage = (offsetX / containerRect.width) * 100;
    
    if (newPercentage > 20 && newPercentage < 60) {
      this.leftPaneWidth = newPercentage;
    }
  }

  @HostListener('document:mouseup')
  stopDrag() {
    this.isDragging = false;
  }
}
