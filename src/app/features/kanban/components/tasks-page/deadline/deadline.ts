import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { QuickTaskInputComponent } from './quick-task-input/quick-task-input';
import { TaskCardComponent } from '../../../components/task-card/task-card';
import { Task } from '../../../models/kanban.model';

export interface DeadlineColumn {
  id: string;
  labelKey: string;
  color: string;
  count: number;
  tasks: any[];
}

@Component({
  selector: 'app-deadline',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe, QuickTaskInputComponent, TaskCardComponent],
  templateUrl: './deadline.html',
  styleUrls: ['./deadline.scss'],
})
export class DeadlineComponent {
  @Output() taskSelected = new EventEmitter<Task>();

  columns: DeadlineColumn[] = [
    { id: 'overdue',     labelKey: 'TASKS_PAGE.DEADLINE.COL_OVERDUE',     color: 'col-red',    count: 0, tasks: [] },
    { id: 'today',       labelKey: 'TASKS_PAGE.DEADLINE.COL_TODAY',        color: 'col-green',  count: 0, tasks: [] },
    { id: 'this-week',   labelKey: 'TASKS_PAGE.DEADLINE.COL_THIS_WEEK',    color: 'col-teal',   count: 0, tasks: [] },
    { id: 'next-week',   labelKey: 'TASKS_PAGE.DEADLINE.COL_NEXT_WEEK',    color: 'col-cyan',   count: 0, tasks: [] },
    { id: 'no-deadline', labelKey: 'TASKS_PAGE.DEADLINE.COL_NO_DEADLINE',  color: 'col-gray',   count: 0, tasks: [] },
    { id: 'two-weeks',   labelKey: 'TASKS_PAGE.DEADLINE.COL_TWO_WEEKS',    color: 'col-blue',   count: 0, tasks: [] },
    { id: 'completed',   labelKey: 'TASKS_PAGE.DEADLINE.COL_COMPLETED',    color: 'col-purple', count: 0, tasks: [] },
  ];

  activeQuickTaskCol: string | null = null;

  isEmpty(): boolean {
    const noTasks = this.columns.every(col => col.tasks.length === 0);
    return noTasks && !this.activeQuickTaskCol;
  }

  openQuickTask(colId: string, event: MouseEvent) {
    event.stopPropagation();
    this.activeQuickTaskCol = colId;
  }

  closeQuickTask() {
    this.activeQuickTaskCol = null;
  }

  onQuickTaskCreate(taskTitle: string, colId: string) {
    const col = this.columns.find(c => c.id === colId);
    if (col) {
      const newTask = {
        id: Math.random().toString(36).substring(2, 9),
        title: taskTitle,
        columnId: colId,
        priority: 'medium',
        timeLabel: '- 47 phút', // Mock data from image
        timeColor: 'red',
        badgeCount: 1,
        assignees: ['user1', 'user2'], // Just placeholders to show avatars
        stripeColor: col.color // Use the column's color
      };
      
      col.tasks.push(newTask as any);
      col.count = col.tasks.length;
    }
    this.closeQuickTask();
  }

  onTaskClick(task: any) {
    this.taskSelected.emit(task);
  }
}
