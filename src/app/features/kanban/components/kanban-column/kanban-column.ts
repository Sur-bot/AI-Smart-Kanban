import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Task } from '../../models/kanban.model';

@Component({
  selector: 'app-kanban-column',
  templateUrl: './kanban-column.html',
  styleUrls: ['./kanban-column.scss'],
  standalone: false
})
export class KanbanColumn {}