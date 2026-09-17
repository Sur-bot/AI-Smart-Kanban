import { Component, Input, Output, EventEmitter, inject, signal, computed, OnInit, OnChanges, SimpleChanges, effect, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { TextFieldModule } from '@angular/cdk/text-field';
import { TaskDetail, TaskItem, DocSectionKey, DocSection, TaskDescriptionDoc } from '../../../../core/models/task.model';
import { TaskStore } from '../../../../core/state/task.store';
import { TaskService } from '../../../../core/services/task.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { PropertyRowComponent } from './components/property-row/property-row';
import { StatusDropdownComponent } from './components/status-dropdown/status-dropdown';
import { UserFieldComponent } from './components/user-field/user-field';
import { TagPillComponent } from './components/tag-pill/tag-pill';
import { ProgressFieldComponent } from './components/progress-field/progress-field';
import { PlaceholderFieldComponent } from './components/placeholder-field/placeholder-field';

@Component({
  selector: 'app-task-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
    TranslatePipe,
    DragDropModule,
    TextFieldModule,
    PropertyRowComponent,
    StatusDropdownComponent,
    UserFieldComponent,
    TagPillComponent,
    ProgressFieldComponent,
    PlaceholderFieldComponent,
  ],
  templateUrl: './task-detail-modal.html',
  styleUrls: ['./task-detail-modal.scss']
})
export class TaskDetailModalComponent implements OnInit, OnChanges {
  readonly taskStore = inject(TaskStore);
  readonly taskService = inject(TaskService);
  readonly permissionService = inject(PermissionService);

  @Input() task: TaskDetail | TaskItem | any = null;
  @Output() close = new EventEmitter<void>();

  readonly LEFT_PANE_WIDTH = 60;
  isClosing: boolean = false;
  hasUnsavedChanges: boolean = false;

  // Inline edit state
  editingSection = signal<DocSectionKey | null>(null);
  isSaving = signal<boolean>(false);
  editData = signal<string[]>([]);
  originalEditData = signal<string>('');
  saveError = signal<string | null>(null);

  editFocusElement = viewChild<ElementRef>('editFocusElement');

  constructor() {
    effect(() => {
      const el = this.editFocusElement();
      if (el) {
        // Automatically focus the first input/textarea when edit mode starts
        el.nativeElement.focus();
      }
    });
  }

  // Fallback structure
  readonly DEFAULT_SECTIONS: DocSection[] = [
    { key: 'description', title: 'Description', format: 'paragraph', content: [] },
    { key: 'preCondition', title: 'Pre-condition', format: 'bulletList', content: [] },
    { key: 'steps', title: 'Steps', format: 'orderedList', content: [] },
    { key: 'expectedResult', title: 'Expected result', format: 'paragraph', content: [] },
    { key: 'actualResult', title: 'Actual result', format: 'paragraph', content: [] }
  ];

  ngOnInit() {
    this.ensureSectionsExist();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['task'] && this.task) {
      this.ensureSectionsExist();
    }
  }

  ensureSectionsExist() {
    if (!this.task) return;
    if (!this.task.descriptionJson || !this.task.descriptionJson.sections) {
      // Initialize with default sections
      this.task.descriptionJson = {
        version: 1,
        sections: JSON.parse(JSON.stringify(this.DEFAULT_SECTIONS))
      };
    } else {
      // Merge missing sections if any
      const existingKeys = this.task.descriptionJson.sections.map((s: any) => s.key);
      this.DEFAULT_SECTIONS.forEach(defSec => {
        if (!existingKeys.includes(defSec.key)) {
          this.task.descriptionJson.sections.push(JSON.parse(JSON.stringify(defSec)));
        }
      });
      // Sort to keep standard order
      const order = this.DEFAULT_SECTIONS.map(s => s.key);
      this.task.descriptionJson.sections.sort((a: any, b: any) => order.indexOf(a.key) - order.indexOf(b.key));
    }
  }

  getSection(key: DocSectionKey): DocSection | undefined {
    return this.task?.descriptionJson?.sections?.find((s: DocSection) => s.key === key);
  }

  canEdit(): boolean {
    return this.permissionService.can('task.update');
  }

  startEdit(key: DocSectionKey) {
    if (!this.canEdit()) return;
    const section = this.getSection(key);
    if (!section) return;

    this.editingSection.set(key);
    this.saveError.set(null);
    this.editData.set([...section.content]);
    
    // Auto-add an empty row if list is empty when starting edit
    if (section.content.length === 0) {
      if (section.format === 'paragraph') {
        this.editData.set(['']);
      } else {
        this.editData.set(['']);
      }
    }
    this.originalEditData.set(JSON.stringify(this.editData()));
  }

  cancelEdit() {
    const isDirty = JSON.stringify(this.editData()) !== this.originalEditData();
    if (isDirty) {
      if (!window.confirm('Bạn có thay đổi chưa lưu. Hủy bỏ những thay đổi này?')) {
        return;
      }
    }

    this.editingSection.set(null);
    this.editData.set([]);
    this.originalEditData.set('');
    this.saveError.set(null);
  }

  isSaveDisabled(key: DocSectionKey): boolean {
    if (key === 'actualResult') return false; // Actual result is fully optional

    const section = this.getSection(key);
    if (!section) return true;

    const data = this.editData();
    if (section.format === 'paragraph') {
      const text = (data[0] || '').trim();
      return text.length === 0;
    } else {
      const validItems = data.map(s => s.trim()).filter(s => s.length > 0);
      return validItems.length === 0;
    }
  }

  // Handle single textarea for paragraph format
  updateParagraph(content: string) {
    this.editData.set([content]);
  }

  // List management
  addListItem() {
    this.editData.update(list => [...list, '']);
  }

  updateListItem(index: number, content: string) {
    this.editData.update(list => {
      const newList = [...list];
      newList[index] = content;
      return newList;
    });
  }

  removeListItem(index: number) {
    this.editData.update(list => {
      const newList = [...list];
      newList.splice(index, 1);
      return newList;
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    this.editData.update(list => {
      const newList = [...list];
      moveItemInArray(newList, event.previousIndex, event.currentIndex);
      return newList;
    });
  }

  saveEdit(key: DocSectionKey) {
    const section = this.getSection(key);
    if (!section) return;

    let finalContent = this.editData();
    
    // Validate & Clean
    if (section.format === 'paragraph') {
      const text = (finalContent[0] || '').trim();
      if ((key === 'description' || key === 'expectedResult') && !text) {
        this.saveError.set('Nội dung không được để trống.');
        return;
      }
      finalContent = text ? [text] : [];
    } else {
      // Filter out empty lines for lists
      finalContent = finalContent.map(s => s.trim()).filter(s => s.length > 0);
      if (finalContent.length === 0) {
        this.saveError.set('Danh sách không được để trống.');
        return;
      }
    }

    this.isSaving.set(true);
    this.saveError.set(null);

    // Update locally
    section.content = finalContent;

    // Generate plain text description
    const allTextContent = this.task.descriptionJson.sections
      .filter((s: DocSection) => s.content && s.content.length > 0)
      .map((s: DocSection) => {
        if (s.format === 'paragraph') return s.content.join('\n');
        return s.content.map(c => '- ' + c).join('\n');
      })
      .join('\n\n');

    this.task.description = allTextContent;

    // Call API directly to manage loading state inside modal
    this.taskService.updateTask(this.task.id, {
      descriptionJson: this.task.descriptionJson,
      description: allTextContent
    }).subscribe({
      next: (updatedTask) => {
        // Sync with TaskStore
        this.taskStore.tasks.update(list => 
          list.map(t => t.id === this.task.id ? { ...t, descriptionJson: this.task.descriptionJson, description: allTextContent } : t)
        );
        this.isSaving.set(false);
        this.editingSection.set(null);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.saveError.set(err?.error?.message || 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.');
      }
    });
  }

  triggerClose() {
    if (this.editingSection()) {
      if (!confirm('Bạn đang chỉnh sửa dở dang. Bạn có chắc chắn muốn đóng?')) {
        return;
      }
    }
    
    this.isClosing = true;
    setTimeout(() => {
      this.close.emit();
      this.isClosing = false;
    }, 300);
  }

  // --- Other existing methods ---
  markAsDirty() {
    this.hasUnsavedChanges = true;
  }

  saveChanges() {
    if (!this.hasUnsavedChanges) return;
    this.hasUnsavedChanges = false;
    alert('Đã lưu thay đổi thành công!');
  }
}

