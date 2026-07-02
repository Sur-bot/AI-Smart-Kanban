import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Task } from '../../models/kanban.model';

@Component({
  selector: 'app-kanban-column',
  templateUrl: './kanban-column.html',
  styleUrls: ['./kanban-column.scss'],
  standalone: false
})
export class KanbanColumn {
  @Input() title!: string;
  @Input() columnId!: 'todo' | 'inprogress' | 'done';
  @Input() tasks: Task[] = [];
  @Input() connectedTo: string[] = [];

  @Output() taskDropped = new EventEmitter<CdkDragDrop<Task[]>>();
  @Output() selectTask = new EventEmitter<string>();

  drop(event: CdkDragDrop<Task[]>): void {
    this.taskDropped.emit(event);
  }
}