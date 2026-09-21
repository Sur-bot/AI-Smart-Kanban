import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskStore } from '../../../../core/state/task.store';
import { PropertyRowComponent } from '../task-detail-modal/components/property-row/property-row';

export interface BatchEditData {
  taskIds: string[];
  count: number;
}

@Component({
  selector: 'app-batch-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
    PropertyRowComponent
  ],
  templateUrl: './batch-edit-modal.html',
  styleUrls: ['./batch-edit-modal.scss']
})
export class BatchEditModalComponent implements OnInit {
  readonly taskStore = inject(TaskStore);

  isClosing = false;
  isSaving = signal<boolean>(false);
  saveError = signal<string | null>(null);

  // Form values
  selectedStatusId = signal<string | null>(null);
  selectedPriority = signal<string | null>(null);
  selectedAssigneeId = signal<string | null>(null);
  readonly dialogRef = inject(MatDialogRef<BatchEditModalComponent>);
  readonly data = inject<BatchEditData>(MAT_DIALOG_DATA);

  ngOnInit() {
  }

  triggerClose() {
    this.isClosing = true;
    setTimeout(() => {
      this.dialogRef.close();
    }, 300);
  }

  onApply() {
    const payload: any = {};
    if (this.selectedStatusId()) payload.statusId = this.selectedStatusId();
    if (this.selectedPriority()) payload.priority = this.selectedPriority();
    if (this.selectedAssigneeId()) payload.assigneeId = this.selectedAssigneeId();

    if (Object.keys(payload).length === 0) {
      this.saveError.set('Vui lòng chọn ít nhất 1 trường để cập nhật');
      return;
    }

    this.isSaving.set(true);
    this.saveError.set(null);

    // Call store method
    this.taskStore.bulkUpdateTasks(this.data.taskIds, payload);

    // Mock completion since bulkUpdateTasks doesn't return observable right now from store, 
    // but store handles the success state. We just close the modal.
    setTimeout(() => {
      this.triggerClose();
    }, 500);
  }
}
