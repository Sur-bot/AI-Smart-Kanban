import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BITRIX_SIDEBAR_MENU, MenuItem } from '../../core/config/menu.config';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    RouterLinkActive
  ],
})
export class SidebarComponent {
  @Input() isOpen = true;
  @Output() toggleSidebar = new EventEmitter<void>();
  
  menuItems: MenuItem[] = BITRIX_SIDEBAR_MENU;

  onToggle() {
    this.toggleSidebar.emit();
  }
}