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
  @Input() isOpen = true;
  @Output() toggleSidebar = new EventEmitter<boolean>();
  
  @ViewChild(ProjectSwitcherComponent) projectSwitcher?: ProjectSwitcherComponent;

  menuItems: MenuItem[] = BITRIX_SIDEBAR_MENU;

  /** Các menu có submenu đang được mở rộng */
  expandedMenuIds = new Set<string>();

  /** Trạng thái thu gọn (chỉ hiện icon) */
  isCollapsed = false;

  /** Trạng thái hover mở rộng tạm thời khi sidebar đang thu gọn */
  isHoverExpanded = false;

  /** Trạng thái thu gọn các mục không quan trọng (hiển thị tất cả) */
  isOtherItemsHidden = true;

  /**
   * Host element width:
   * - Collapsed: 68px (icon only) - layout dùng width này
   * - Expanded: 260px (full sidebar)
   * - Hover-expanded: giữ 68px để layout không dịch chuyển, aside sẽ overlay
   */
  @HostBinding('style.width')
  get hostWidth(): string {
    if (this.isCollapsed) {
      return '68px'; // Luôn 68px khi collapsed (kể cả hover)
    }
    return '260px';
  }

  /** Toggle thu gọn/mở rộng sidebar khi bấm nút hamburger */
  onToggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    if (!this.isCollapsed) {
      this.isHoverExpanded = false;
    } else {
      this.projectSwitcher?.closeDropdown();
    }
    this.toggleSidebar.emit(this.isCollapsed);
  }

  /** Khi di chuột vào sidebar đang thu gọn → mở rộng tạm (overlay) */
  onMouseEnter() {
    if (this.isCollapsed) {
      this.isHoverExpanded = true;
    }
  }

  /** Khi chuột rời sidebar → đóng dropdown dự án và thu gọn lại */
  onMouseLeave() {
    this.projectSwitcher?.closeDropdown();
    if (this.isCollapsed) {
      this.isHoverExpanded = false;
    }
  }

  /** Sidebar đang ở trạng thái "trông" mở rộng (dù có thể chỉ là hover overlay) */
  get isExpanded(): boolean {
    return !this.isCollapsed || this.isHoverExpanded;
  }

  /** Toggle hiển thị submenu con */
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

  /** Kiểm tra menu có đang mở rộng không */
  isMenuExpanded(itemId: string): boolean {
    return this.expandedMenuIds.has(itemId);
  }

  onToggle() {
    this.toggleSidebar.emit(this.isCollapsed);
  }

  /** Xử lý click vào menu item */
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

  /** Xác định xem menu item có đang bị ẩn bởi nút Thu gọn không */
  isHidden(item: MenuItem): boolean {
    return this.isOtherItemsHidden && item.id !== 'tasks-projects' && item.id !== 'collaboration' && item.id !== 'show-all' && item.id !== 'settings';
  }
}