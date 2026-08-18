import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CdkDragDrop, CdkDropList, CdkDrag, CdkDragPlaceholder, CdkDragPreview, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskStore } from '../../../../core/state/task.store';
import { TaskItem, TaskStatus } from '../../../../core/models/task.model';
import { TaskCardComponent } from '../task-card/task-card';

interface KanbanColumn {
  status: TaskStatus;
  tasks: TaskItem[];
}

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.html',
  styleUrls: ['./kanban-board.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, CdkDropList, CdkDrag, CdkDragPlaceholder, CdkDragPreview, TaskCardComponent]
})
export class KanbanBoardComponent implements OnInit {
  readonly taskStore = inject(TaskStore);

  // Tính toán các cột Kanban dựa trên statuses của project
  readonly kanbanColumns = computed<KanbanColumn[]>(() => {
    const statuses = this.taskStore.statuses();
    const tasks = this.taskStore.tasks();

    return statuses
      .filter(s => s.category !== 'cancelled')
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(status => ({
        status,
        tasks: tasks
          .filter(t => t.statusId === status.id)
          .sort((a, b) => a.boardColumnOrder - b.boardColumnOrder)
      }));
  });

  // List IDs để CDK Drop biết các cột kết nối với nhau
  readonly connectedColumnIds = computed<string[]>(() =>
    this.kanbanColumns().map(col => 'kanban-col-' + col.status.id)
  );

  ngOnInit() {
    this.taskStore.loadProjects();
    this.taskStore.loadTasks();
  }

  trackByStatus(_: number, col: KanbanColumn): string {
    return col.status.id;
  }

  trackByTask(_: number, task: TaskItem): string {
    return task.id;
  }

  getColumnDropListId(statusId: string): string {
    return 'kanban-col-' + statusId;
  }

  onTaskDrop(event: CdkDragDrop<TaskItem[]>, targetStatus: TaskStatus) {
    if (event.previousContainer === event.container) {
      // Kéo trong cùng cột
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
      // Kéo sang cột khác
      const prevTasks = [...event.previousContainer.data];
      const currTasks = [...event.container.data];
      
      transferArrayItem(prevTasks, currTasks, event.previousIndex, event.currentIndex);
      
      const prevMoves = prevTasks.map((task, index) => ({
        taskId: task.id,
        boardColumnOrder: index
      }));
      
      const currMoves = currTasks.map((task, index) => ({
        taskId: task.id,
        statusId: targetStatus.id,
        boardColumnOrder: index
      }));
      
      this.taskStore.bulkMoveTasks([...prevMoves, ...currMoves]);
    }
  }

  onTaskClick(task: TaskItem) {
    this.taskStore.selectTask(task.id);
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

  onAddTask(statusId: string, title: string) {
    if (!title.trim()) return;
    this.taskStore.createTask({ title: title.trim(), statusId });
  }
}