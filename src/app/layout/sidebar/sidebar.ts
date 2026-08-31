import { Component, Input, Output, EventEmitter, HostBinding, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BITRIX_SIDEBAR_MENU, MenuItem } from '../../core/config/menu.config';
import { CollaborationComponent } from './collaboration/collaboration';
import { ImageStorageBtnComponent } from './image-storage-btn/image-storage-btn';
import { ProjectSwitcherComponent } from './project-switcher/project-switcher';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    RouterLinkActive,
    CollaborationComponent,
    ImageStorageBtnComponent,
    ProjectSwitcherComponent,
    MatIconModule,
    TranslatePipe
  ],
})
export class SidebarComponent {
  @Input()
  set isOpen(value: boolean) {
    this.isCollapsed = !value;
  }
  get isOpen(): boolean {
    return !this.isCollapsed;
  }

  @Output() toggleSidebar = new EventEmitter<boolean>();
  
  @ViewChild(ProjectSwitcherComponent) projectSwitcher?: ProjectSwitcherComponent;

  menuItems: MenuItem[] = BITRIX_SIDEBAR_MENU;
  expandedMenuIds = new Set<string>();
  isCollapsed = true;
  isHoverExpanded = false;
  isOtherItemsHidden = true;

  @HostBinding('style.width')
  get hostWidth(): string {
    return this.isCollapsed ? '68px' : '260px';
  }

  onToggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    if (!this.isCollapsed) {
      this.isHoverExpanded = false;
    } else {
      this.projectSwitcher?.closeDropdown();
    }
    this.toggleSidebar.emit(this.isCollapsed);
  }

  onMouseEnter() {
    if (this.isCollapsed) {
      this.isHoverExpanded = true;
    }
  }

  onMouseLeave() {
    this.projectSwitcher?.closeDropdown();
    if (this.isCollapsed) {
      this.isHoverExpanded = false;
    }
  }

  get isExpanded(): boolean {
    return !this.isCollapsed || this.isHoverExpanded;
  }

  toggleSubMenu(item: MenuItem, event: Event) {
    if (item.children && item.children.length > 0) {
      event.preventDefault();
      event.stopPropagation();
      if (this.expandedMenuIds.has(item.id)) {
        this.expandedMenuIds.delete(item.id);
      } else {
        this.expandedMenuIds.add(item.id);
      }
    }
  }

  isMenuExpanded(itemId: string): boolean {
    return this.expandedMenuIds.has(itemId);
  }

  onToggle() {
    this.toggleSidebar.emit(this.isCollapsed);
  }

  onMenuClick(item: MenuItem, event: Event) {
    if (item.id === 'show-all') {
      event.preventDefault();
      this.isOtherItemsHidden = !this.isOtherItemsHidden;
      return;
    }
    if (item.children && !item.isComingSoon) {
      this.toggleSubMenu(item, event);
    }
  }

  isHidden(item: MenuItem): boolean {
    return this.isOtherItemsHidden && item.id !== 'tasks-projects' && item.id !== 'collaboration' && item.id !== 'show-all' && item.id !== 'settings';
  }
}