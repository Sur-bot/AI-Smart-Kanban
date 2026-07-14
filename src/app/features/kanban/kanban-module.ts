import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { KanbanRoutingModule } from './kanban-routing-module';

import { KanbanBoardComponent } from './components/kanban-board/kanban-board';
import { KanbanColumn } from './components/kanban-column/kanban-column';
import { TaskCardComponent } from './components/task-card/task-card';
import { TaskDetailModalComponent } from './components/task-detail-modal/task-detail-modal';

@NgModule({
  imports: [
    KanbanBoardComponent,
    KanbanColumn,
    TaskCardComponent,
    TaskDetailModalComponent,
     CommonModule,
    KanbanRoutingModule,
    DragDropModule
  ]
})
export class KanbanModule { }