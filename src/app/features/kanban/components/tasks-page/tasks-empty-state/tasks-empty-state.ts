import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tasks-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tasks-empty-state.html',
  styleUrls: ['./tasks-empty-state.scss'],
})
export class TasksEmptyStateComponent {}
