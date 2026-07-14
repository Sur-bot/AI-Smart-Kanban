import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

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
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './deadline.html',
  styleUrls: ['./deadline.scss'],
})
export class DeadlineComponent {
  columns: DeadlineColumn[] = [
    { id: 'overdue',     labelKey: 'TASKS_PAGE.DEADLINE.COL_OVERDUE',     color: 'col-red',    count: 0, tasks: [] },
    { id: 'today',       labelKey: 'TASKS_PAGE.DEADLINE.COL_TODAY',        color: 'col-green',  count: 0, tasks: [] },
    { id: 'this-week',   labelKey: 'TASKS_PAGE.DEADLINE.COL_THIS_WEEK',    color: 'col-teal',   count: 0, tasks: [] },
    { id: 'next-week',   labelKey: 'TASKS_PAGE.DEADLINE.COL_NEXT_WEEK',    color: 'col-cyan',   count: 0, tasks: [] },
    { id: 'no-deadline', labelKey: 'TASKS_PAGE.DEADLINE.COL_NO_DEADLINE',  color: 'col-gray',   count: 0, tasks: [] },
    { id: 'two-weeks',   labelKey: 'TASKS_PAGE.DEADLINE.COL_TWO_WEEKS',    color: 'col-blue',   count: 0, tasks: [] },
    { id: 'completed',   labelKey: 'TASKS_PAGE.DEADLINE.COL_COMPLETED',    color: 'col-purple', count: 0, tasks: [] },
  ];

  isEmpty(): boolean {
    return this.columns.every(col => col.tasks.length === 0);
  }
}
