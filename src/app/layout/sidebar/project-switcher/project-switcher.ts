import { Component, inject, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TaskStore } from '../../../core/state/task.store';
import { Project } from '../../../core/models/task.model';
import { MatDialog } from '@angular/material/dialog';
import { CreateProjectModalComponent } from '../../../features/kanban/components/create-project-modal/create-project-modal';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-project-switcher',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './project-switcher.html',
  styleUrls: ['./project-switcher.scss'],
})
export class ProjectSwitcherComponent implements OnInit {
  taskStore = inject(TaskStore);
  private dialog = inject(MatDialog);

  ngOnInit() {
    if (this.taskStore.projects().length === 0) {
      this.taskStore.loadProjects();
    }
  }

  private _isCollapsed = false;
  @Input() set isCollapsed(value: boolean) {
    this._isCollapsed = value;
    if (value) {
      this.isOpen = false;
    }
  }
  get isCollapsed(): boolean {
    return this._isCollapsed;
  }

  isOpen = false;

  closeDropdown(): void {
    this.isOpen = false;
  }

  get currentProject(): Project | undefined {
    const currentId = this.taskStore.currentProjectId();
    return this.taskStore.projects().find(p => p.id === currentId);
  }

  get projects(): Project[] {
    return this.taskStore.projects();
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  selectProject(project: Project, event: Event) {
    event.stopPropagation();
    this.taskStore.setCurrentProject(project.id);
    this.isOpen = false;
  }

  openCreateProject(event: Event) {
    event.stopPropagation();
    this.isOpen = false;
    this.dialog.open(CreateProjectModalComponent, {
      width: '500px',
      panelClass: 'custom-dialog-container',
      autoFocus: false
    });
  }

  @HostListener('document:click')
  onClickOutside() {
    this.isOpen = false;
  }
}
