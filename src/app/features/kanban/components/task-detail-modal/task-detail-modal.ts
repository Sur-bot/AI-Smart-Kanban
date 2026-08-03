import { Component, Input, Output, EventEmitter, HostListener, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { TaskDetail, TaskItem } from '../../../../core/models/task.model';
import { TaskStore } from '../../../../core/state/task.store';

@Component({
  selector: 'app-task-detail-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, TranslatePipe],
  templateUrl: './task-detail-modal.html',
  styleUrls: ['./task-detail-modal.scss']
})
export class TaskDetailModalComponent {
  readonly taskStore = inject(TaskStore);

  @Input() task: TaskDetail | TaskItem | any = null;
  @Output() close = new EventEmitter<void>();

  @ViewChild('modalContainer') containerRef!: ElementRef<HTMLDivElement>;

  leftPaneWidth: number = 38;
  isDragging: boolean = false;
  isClosing: boolean = false;

  triggerClose() {
    this.isClosing = true;
    setTimeout(() => {
      this.close.emit();
      this.isClosing = false;
    }, 300);
  }

  startDrag(event: MouseEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  @HostListener('document:mousemove', ['$event'])
  onDrag(event: MouseEvent) {
    if (!this.isDragging || !this.containerRef) return;
    
    const containerRect = this.containerRef.nativeElement.getBoundingClientRect();
    const offsetX = event.clientX - containerRect.left;
    const newPercentage = (offsetX / containerRect.width) * 100;
    
    if (newPercentage > 20 && newPercentage < 60) {
      this.leftPaneWidth = newPercentage;
    }
  }

  @HostListener('document:mouseup')
  stopDrag() {
    this.isDragging = false;
  }
}
