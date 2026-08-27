import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { TaskStore } from '../../../../core/state/task.store';

@Component({
  selector: 'app-create-project-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './create-project-modal.html',
  styleUrls: ['./create-project-modal.scss'],
})
export class CreateProjectModalComponent {
  private dialogRef = inject(MatDialogRef<CreateProjectModalComponent>);
  private taskStore = inject(TaskStore);

  projectName = '';
  projectDescription = '';
  isPublic = false;
  selectedColor = '#3b82f6';

  colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'
  ];

  close() {
    this.dialogRef.close();
  }

  submit() {
    if (!this.projectName.trim()) return;

    this.taskStore.createProject({
      name: this.projectName.trim(),
      description: this.projectDescription.trim(),
      color: this.selectedColor,
      is_public: this.isPublic
    }, () => {
      // On success, close modal
      this.close();
    });
  }
}
