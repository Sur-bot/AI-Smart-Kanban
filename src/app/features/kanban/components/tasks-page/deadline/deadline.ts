import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CdkDropList, CdkDrag, CdkDropListGroup, CdkDragDrop, CdkDragEnter, CdkDragExit, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TranslatePipe } from '@ngx-translate/core';
import { QuickTaskInputComponent } from './quick-task-input/quick-task-input';
import { TaskCardComponent } from '../../../components/task-card/task-card';
import { TaskStore } from '../../../../../core/state/task.store';
import { TaskItem } from '../../../../../core/models/task.model';
import { PermissionService } from '../../../../../core/services/permission.service';

@Component({
  selector: 'app-deadline',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    TranslatePipe,
    QuickTaskInputComponent,
    TaskCardComponent,
    CdkDropList,
    CdkDrag,
    CdkDropListGroup
  ],
  templateUrl: './deadline.html',
  styleUrls: ['./deadline.scss'],
})
export class DeadlineComponent {
  readonly taskStore = inject(TaskStore);
  readonly permissionService = inject(PermissionService);

  @Output() taskSelected = new EventEmitter<TaskItem>();

  activeQuickTaskCol: string | null = null;
  dragOverColId: string | null = null;

  get columns() {
    return this.taskStore.deadlineColumns();
  }

  isEmpty(): boolean {
    if (this.taskStore.loading() || this.taskStore.projectsLoading() || !this.taskStore.isProjectsInitialized()) {
      return false;
    }
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
    if (!taskTitle || !taskTitle.trim()) return;

    let dueDate: string | undefined = undefined;
    const now = new Date();

    if (colId === 'today') {
      dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
    } else if (colId === 'this-week') {
      const day = now.getDay();
      const diffToFriday = (5 - day + 7) % 7 || 7;
      const friday = new Date(now.getTime() + diffToFriday * 24 * 60 * 60 * 1000);
      dueDate = new Date(friday.getFullYear(), friday.getMonth(), friday.getDate(), 18, 0, 0).toISOString();
    } else if (colId === 'next-week') {
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      dueDate = new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 18, 0, 0).toISOString();
    } else if (colId === 'two-weeks') {
      const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      dueDate = new Date(twoWeeks.getFullYear(), twoWeeks.getMonth(), twoWeeks.getDate(), 18, 0, 0).toISOString();
    }

    this.taskStore.createTask({
      title: taskTitle.trim(),
      dueDate: dueDate,
      priority: 'medium'
    });

    this.closeQuickTask();
  }

  getColumnDropListId(colId: string): string {
    return 'deadline-col-' + colId;
  }

  get connectedColumnIds(): string[] {
    return this.columns.map(col => 'deadline-col-' + col.id);
  }

  onDragEntered(event: CdkDragEnter, colId: string) {
    this.dragOverColId = colId;
  }

  onDragExited(event: CdkDragExit, colId: string) {
    if (this.dragOverColId === colId) {
      this.dragOverColId = null;
    }
  }

  onTaskDrop(event: CdkDragDrop<TaskItem[]>, targetColId: string) {
    this.dragOverColId = null; // Tắt viền sáng ngay lập tức khi thả card

    if (event.previousContainer === event.container) {
      if (event.previousIndex !== event.currentIndex) {
        const tasks = [...event.container.data];
        moveItemInArray(tasks, event.previousIndex, event.currentIndex);
        const moves = tasks.map((task, index) => ({
          taskId: task.id,
          boardColumnOrder: index
        }));
        this.taskStore.bulkMoveTasks(moves);
      }
    } else {
      const prevTasks = [...event.previousContainer.data];
      const currTasks = [...event.container.data];
      const task = event.item.data as TaskItem;
      
      transferArrayItem(prevTasks, currTasks, event.previousIndex, event.currentIndex);
      
      // Calculate new due date based on the target column
      let newDueDate: string | undefined | null = task.dueDate;
      const now = new Date();
      if (targetColId === 'today') {
        newDueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
      } else if (targetColId === 'this-week') {
        const day = now.getDay();
        const diffToFriday = (5 - day + 7) % 7 || 7;
        const friday = new Date(now.getTime() + diffToFriday * 24 * 60 * 60 * 1000);
        newDueDate = new Date(friday.getFullYear(), friday.getMonth(), friday.getDate(), 18, 0, 0).toISOString();
      } else if (targetColId === 'next-week') {
        const day = now.getDay();
        const diffToNextFriday = (5 - day + 7) % 7 + 7;
        const nextFriday = new Date(now.getTime() + diffToNextFriday * 24 * 60 * 60 * 1000);
        newDueDate = new Date(nextFriday.getFullYear(), nextFriday.getMonth(), nextFriday.getDate(), 18, 0, 0).toISOString();
      } else if (targetColId === 'two-weeks') {
        const day = now.getDay();
        const diffToTwoWeeks = (5 - day + 7) % 7 + 14;
        const twoWeeksFriday = new Date(now.getTime() + diffToTwoWeeks * 24 * 60 * 60 * 1000);
        newDueDate = new Date(twoWeeksFriday.getFullYear(), twoWeeksFriday.getMonth(), twoWeeksFriday.getDate(), 18, 0, 0).toISOString();
      } else if (targetColId === 'no-deadline') {
        newDueDate = null;
      } else if (targetColId === 'overdue' || targetColId === 'completed') {
        return;
      }
      
      // Update store for the moved task to have new dueDate
      this.taskStore.updateTaskDueDate(task.id, newDueDate);

      const prevMoves = prevTasks.map((task, index) => ({
        taskId: task.id,
        boardColumnOrder: index
      }));
      
      const currMoves = currTasks.map((task, index) => ({
        taskId: task.id,
        boardColumnOrder: index
      }));
      
      this.taskStore.bulkMoveTasks([...prevMoves, ...currMoves]);
    }
  }

  onTaskClick(task: TaskItem) {
    this.taskStore.selectTask(task.id);
    this.taskSelected.emit(task);
  }

  onTaskStart(task: TaskItem) {
    const inProgressStatus = this.taskStore.statuses().find(s => s.category === 'in_progress');
    if (inProgressStatus) {
      this.taskStore.updateTask(task.id, { statusId: inProgressStatus.id });
    }
  }

  onTaskComplete(task: TaskItem) {
    const doneStatus = this.taskStore.statuses().find(s => s.category === 'done');
    if (doneStatus) {
      this.taskStore.updateTask(task.id, { statusId: doneStatus.id });
    }
  }
}

