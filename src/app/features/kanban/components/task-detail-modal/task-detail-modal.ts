import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { TaskDetail, TaskItem } from '../../../../core/models/task.model';
import { TaskStore } from '../../../../core/state/task.store';
import { PermissionService } from '../../../../core/services/permission.service';

@Component({
  selector: 'app-task-detail-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, TranslatePipe],
  templateUrl: './task-detail-modal.html',
  styleUrls: ['./task-detail-modal.scss']
})
export class TaskDetailModalComponent {
  readonly taskStore = inject(TaskStore);
  readonly permissionService = inject(PermissionService);

  @Input() task: TaskDetail | TaskItem | any = null;
  @Output() close = new EventEmitter<void>();

  readonly LEFT_PANE_WIDTH = 60;
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

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }
}
