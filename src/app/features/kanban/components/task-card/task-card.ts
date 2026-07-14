import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Task } from '../../models/kanban.model';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.html',
  styleUrls: ['./task-card.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule]
})
export class TaskCardComponent {
  @Input() task!: Task;
}
