import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { TaskDetail, TaskComment } from '../../../../../core/models/task.model';
import { PermissionService } from '../../../../../core/services/permission.service';

@Component({
  selector: 'app-task-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, TranslatePipe],
  templateUrl: './task-comments.html',
  styleUrls: ['./task-comments.scss']
})
export class TaskCommentsComponent {
  readonly permissionService = inject(PermissionService);

  @Input() task!: TaskDetail | any;
  @Output() changesMade = new EventEmitter<void>();

  newCommentContent: string = '';

  get comments(): TaskComment[] {
    return this.task?.comments || [];
  }

  submitComment() {
    if (!this.newCommentContent.trim()) return;

    const newComment: TaskComment = {
      id: 'cmt-' + Date.now().toString(),
      task_id: this.task?.id || '',
      author_id: 'current-user-id', // Mock
      content: this.newCommentContent.trim(),
      created_at: new Date().toISOString(),
      author: {
        id: 'current-user-id',
        name: 'Văn Anh Nguyễn',
        email: 'vananh@example.com'
      }
    };

    if (!this.task.comments) {
      this.task.comments = [];
    }

    this.task.comments.push(newComment);
    this.newCommentContent = '';
    this.changesMade.emit();
  }
}
