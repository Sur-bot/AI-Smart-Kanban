import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { TaskDetail, TaskItem } from '../../../../core/models/task.model';
import { TaskStore } from '../../../../core/state/task.store';
import { PermissionService } from '../../../../core/services/permission.service';
import { TaskCommentsComponent } from './task-comments/task-comments';
import { TaskListPanelComponent } from './task-list-panel/task-list-panel';

@Component({
  selector: 'app-task-detail-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, TranslatePipe, TaskCommentsComponent, TaskListPanelComponent],
  templateUrl: './task-detail-modal.html',
  styleUrls: ['./task-detail-modal.scss']
})
export class TaskDetailModalComponent {
  readonly taskStore = inject(TaskStore);
  readonly permissionService = inject(PermissionService);

  @Input() task: TaskDetail | TaskItem | any = null;
  @Output() close = new EventEmitter<void>();

  /** Tỉ lệ cố định: left-panel (task list) = 40%, right-panel (comments) = 60% */
  readonly LEFT_PANE_WIDTH = 40;
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
    console.log('Opening subtask:', subtaskId);
  }

  /**
   * Xử lý khi người dùng click chọn task khác trong TaskListPanel.
   * Dispatch loadTaskDetail để cập nhật right-panel.
   */
  onTaskSelected(selectedTask: TaskItem) {
    if (this.task?.id === selectedTask.id) return;
    // Cập nhật task hiện tại đang hiển thị trong modal
    this.task = selectedTask;
    this.hasUnsavedChanges = false;
    // Load chi tiết đầy đủ nếu store có method
    if (typeof (this.taskStore as any).loadTaskDetail === 'function') {
      (this.taskStore as any).loadTaskDetail(selectedTask.id);
    }
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }
}
