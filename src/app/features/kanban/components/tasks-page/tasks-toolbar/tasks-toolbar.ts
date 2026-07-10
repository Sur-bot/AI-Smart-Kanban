import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tasks-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tasks-toolbar.html',
  styleUrls: ['./tasks-toolbar.scss'],
})
export class TasksToolbarComponent {
  /** Các filter tag đang áp dụng */
  activeFilters = [
    { id: 'status', label: 'Đang tiến hành' },
  ];
}
