import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  HostListener,
  ChangeDetectorRef,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { TaskStore } from '../../../../core/state/task.store';
import { Project, ProjectMemberRole } from '../../../../core/models/task.model';
import { ThemeModalComponent } from '../../../../shared/components/theme-modal/theme-modal';
import { DueDatePickerComponent } from '../../../../shared/components/due-date-picker/due-date-picker';
import { AddTagBadgeComponent } from '../../../../shared/components/add-tag-badge/add-tag-badge';

export type ProjectWizardType = 'project' | 'collaborative' | 'workgroup';
export type ProjectPrivacyType = 'public' | 'private' | 'secret';

@Component({
  selector: 'app-project-drawer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule, MatDialogModule, TranslatePipe, DueDatePickerComponent, AddTagBadgeComponent],
  templateUrl: './project-drawer-modal.html',
  styleUrls: ['./project-drawer-modal.scss']
})
export class ProjectDrawerModalComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);
  readonly taskStore = inject(TaskStore);

  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() projectCreated = new EventEmitter<Project>();

  isClosing = false;
  isFullscreen = false;
  isSubmitting = false;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  currentStep: 1 | 2 | 3 | 4 = 1;

  // Step 1
  projectType: ProjectWizardType = 'project';

  // Step 2
  projectName = '';
  projectDescription = '';
  showDescription = false;
  selectedColor = '#0ea5e9';
  selectedIcon = 'folder';
  currentThemeUrl = '/assets/images/bg_abstract_12.jpg';
  themeName = 'Mây mờ ảo';
  showExtendedParams = false;
  startDate: string | null = null;
  endDate: string | null = null;
  tags = '';
  selectedTags: string[] = [];

  readonly colors = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#64748b'
  ];

  enabledTools = {
    kanban: true,
    taskList: true,
    gantt: true,
    calendar: true,
    drive: true,
    chat: true
  };

  // Step 3: Quyền riêng tư
  privacyType: ProjectPrivacyType = 'public';

  // Step 4: Thành viên
  ownerName = 'Văn Anh Nguyễn';
  showModerators = false;
  searchMemberQuery = '';
  selectedMemberIds = new Set<string>();
  memberRoles: Record<string, ProjectMemberRole> = {};

  ngOnInit(): void {}

  setStep(step: 1 | 2 | 3 | 4): void {
    if (step === 2 && !this.projectType) return;
    if (step > 2 && !this.projectName.trim()) {
      this.currentStep = 2;
      return;
    }
    this.currentStep = step;
    this.cdr.detectChanges();
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      if (!this.projectName.trim()) return;
      this.currentStep = 3;
    } else if (this.currentStep === 3) {
      this.currentStep = 4;
    }
    this.cdr.detectChanges();
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep = (this.currentStep - 1) as 1 | 2 | 3 | 4;
      this.cdr.detectChanges();
    }
  }

  selectProjectType(type: ProjectWizardType): void {
    this.projectType = type;
  }

  toggleTool(tool: keyof typeof this.enabledTools): void {
    this.enabledTools[tool] = !this.enabledTools[tool];
  }

  openThemeModal(event: Event): void {
    event.preventDefault();
    this.dialog.open(ThemeModalComponent, {
      width: '760px',
      maxWidth: '95vw',
      panelClass: 'custom-theme-dialog',
      backdropClass: 'custom-theme-backdrop'
    });
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedIcon = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleDescription(): void {
    this.showDescription = !this.showDescription;
    
    if (this.showDescription) {
      setTimeout(() => {
        if (this.scrollContainer) {
          const el = this.scrollContainer.nativeElement;
          el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        }
      }, 300);
    }
  }

  toggleExtendedParams(): void {
    this.showExtendedParams = !this.showExtendedParams;
    
    if (this.showExtendedParams) {
      setTimeout(() => {
        if (this.scrollContainer) {
          const el = this.scrollContainer.nativeElement;
          el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        }
      }, 300);
    }
  }

  toggleModerators(): void {
    this.showModerators = !this.showModerators;
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  onCopyLink(): void {
    navigator.clipboard?.writeText(window.location.href);
  }

  onClose(): void {
    if (this.isClosing) return;
    this.isClosing = true;
    setTimeout(() => {
      this.isClosing = false;
      this.isOpen = false;
      this.resetWizard();
      this.close.emit();
      this.cdr.detectChanges();
    }, 300);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen && !this.isClosing) {
      this.onClose();
    }
  }

  resetWizard(): void {
    this.currentStep = 1;
    this.projectType = 'project';
    this.projectName = '';
    this.projectDescription = '';
    this.showDescription = false;
    this.showExtendedParams = false;
    this.showModerators = false;
    this.startDate = null;
    this.endDate = null;
    this.tags = '';
    this.selectedColor = '#3b82f6';
    this.selectedIcon = 'folder';
    this.privacyType = 'public';
    this.isFullscreen = false;
    this.isSubmitting = false;
    this.selectedMemberIds.clear();
    this.memberRoles = {};
  }

  submitCreateProject(): void {
    if (!this.projectName.trim() || this.isSubmitting) return;

    this.isSubmitting = true;
    const payload: Partial<Project> = {
      name: this.projectName.trim(),
      description: this.projectDescription.trim() || undefined,
      color: this.selectedColor,
      icon: this.selectedIcon,
      is_public: this.privacyType === 'public',
      status: 'active'
    };

    this.taskStore.createProject(payload, (createdProject: Project) => {
      this.isSubmitting = false;
      this.projectCreated.emit(createdProject);
      this.onClose();
    });
  }
}
