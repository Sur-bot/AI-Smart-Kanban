import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Router, RouterLink } from '@angular/router';
import { BITRIX_SIDEBAR_MENU, MenuItem } from '../../../core/config/menu.config';
import { ProjectSwitcherComponent } from '../project-switcher/project-switcher';
import { CollaborationComponent } from '../collaboration/collaboration';

@Component({
  selector: 'app-expand-menu-sheet',
  templateUrl: './expand-menu-sheet.html',
  styleUrls: ['./expand-menu-sheet.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterLink,
    ProjectSwitcherComponent,
    CollaborationComponent
  ]
})
export class ExpandMenuSheetComponent {
  private bottomSheetRef = inject(MatBottomSheetRef<ExpandMenuSheetComponent>);
  private router = inject(Router);
  
  menuItems: MenuItem[] = BITRIX_SIDEBAR_MENU.filter(item => 
    item.id === 'collaboration' || item.id === 'settings'
  );

  expandedMenuIds = new Set<string>();

  // Touch drag variables
  private startY = 0;
  private currentY = 0;

  onTouchStart(event: TouchEvent) {
    this.startY = event.touches[0].clientY;
  }

  onTouchMove(event: TouchEvent) {
    this.currentY = event.touches[0].clientY;
  }

  onTouchEnd() {
    const deltaY = this.currentY - this.startY;
    if (deltaY > 50) { // Vuốt xuống hơn 50px thì đóng
      this.close();
    }
    this.startY = 0;
    this.currentY = 0;
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

  onMenuClick(item: MenuItem, event: Event) {
    if (item.children) {
      this.toggleSubMenu(item, event);
    } else {
      if (!item.route) {
        event.preventDefault(); // Prevent href="/" reload for items with no route
      }
      this.close();
    }
  }

  navigateToStorage() {
    this.close();
    this.router.navigate(['/image-storage']);
  }

  close(event?: MouseEvent) {
    if (event) {
      event.preventDefault();
    }
    this.bottomSheetRef.dismiss();
  }
}
