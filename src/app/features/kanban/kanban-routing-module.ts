import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board';

const routes: Routes = [
  { path: '', component: KanbanBoardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KanbanRoutingModule {}
