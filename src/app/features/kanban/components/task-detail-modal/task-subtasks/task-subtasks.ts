import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { TaskDetail, SubTaskSummary } from '../../../../../core/models/task.model';

@Component({
  selector: 'app-task-subtasks',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, TranslatePipe],
  templateUrl: './task-subtasks.html',
  styleUrls: ['./task-subtasks.scss']
})
export class TaskSubtasksComponent {
  @Input() task!: TaskDetail | any;
  @Output() subtaskClicked = new EventEmitter<string>();
  @Output() changesMade = new EventEmitter<void>();

  isAdding: boolean = false;
  newSubtaskTitle: string = '';

  get subtasks(): SubTaskSummary[] {
    return this.task?.subtasks || [];
  }

  get completedCount(): number {
    return this.subtasks.filter(s => !!s.completed_at).length;
  }

  get progressPercentage(): number {
    if (!this.subtasks.length) return 0;
    return Math.round((this.completedCount / this.subtasks.length) * 100);
  }

  toggleSubtask(subtask: SubTaskSummary, event: Event) {
    event.stopPropagation();
    if (subtask.completed_at) {
      subtask.completed_at = undefined;
    } else {
      subtask.completed_at = new Date().toISOString();
    }
    this.changesMade.emit();
  }

  openSubtask(subtaskId: string) {
    this.subtaskClicked.emit(subtaskId);
  }

  deleteSubtask(subtaskId: string, event: Event) {
    event.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa công việc con này?')) {
      this.task.subtasks = this.subtasks.filter(s => s.id !== subtaskId);
      this.changesMade.emit();
    }
  }

  showAddForm() {
    this.isAdding = true;
    this.newSubtaskTitle = '';
  }

  cancelAdd() {
    this.isAdding = false;
    this.newSubtaskTitle = '';
  }

  addSubtask() {
    if (!this.newSubtaskTitle.trim()) return;

    const newSubtask: SubTaskSummary = {
      id: 'temp-' + Date.now().toString(),
      title: this.newSubtaskTitle.trim(),
      priority: 'none'
    };

    if (!this.task.subtasks) {
      this.task.subtasks = [];
    }
    
    this.task.subtasks.push(newSubtask);
    this.isAdding = false;
    this.newSubtaskTitle = '';
    this.changesMade.emit();
  }
}
