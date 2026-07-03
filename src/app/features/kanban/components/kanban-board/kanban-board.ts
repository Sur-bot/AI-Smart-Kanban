import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Task } from '../../models/kanban.model';

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.html',
  standalone: false
})
export class KanbanBoardComponent {}