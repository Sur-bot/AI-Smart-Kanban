import { Component, ElementRef, EventEmitter, HostListener, Output, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-quick-task-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './quick-task-input.html',
  styleUrls: ['./quick-task-input.scss']
})
export class QuickTaskInputComponent implements AfterViewInit {
  @Output() create = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('taskInput') taskInput!: ElementRef<HTMLTextAreaElement>;

  taskTitle: string = '';

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.taskInput) {
        this.taskInput.nativeElement.focus();
      }
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    } else if (event.key === 'Escape') {
      this.cancel.emit();
    }
  }

  submit() {
    if (this.taskTitle.trim()) {
      this.create.emit(this.taskTitle.trim());
      this.taskTitle = '';
    }
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.cancel.emit();
    }
  }
}
