import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-project-popover',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './project-popover.html',
  styleUrls: ['./project-popover.scss'],
})
export class ProjectPopoverComponent {
  @Input() selectedProjectId: string | null = null;
  @Output() projectSelected = new EventEmitter<{ id: string; name: string }>();
  @Output() close = new EventEmitter<void>();

  searchQuery = '';

  projects = [
    { id: '1', name: 'Dự án 1' },
    { id: '2', name: 'Dự án 2' },
  ];

  selectProject(project: { id: string; name: string }, event: Event): void {
    event.stopPropagation();
    this.projectSelected.emit(project);
  }
}
