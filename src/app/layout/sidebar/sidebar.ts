import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BITRIX_SIDEBAR_MENU, MenuItem } from '../../core/config/menu.config';
import { CollaborationComponent } from './collaboration/collaboration';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    RouterLinkActive,
    CollaborationComponent
  ],
})
export class SidebarComponent {
  @Input() isOpen = true;
  @Output() toggleSidebar = new EventEmitter<void>();
  
  menuItems: MenuItem[] = BITRIX_SIDEBAR_MENU;

  /** Các menu có submenu đang được mở rộng */
  expandedMenuIds = new Set<string>(['collaboration']);

  /** Trạng thái thu gọn (chỉ hiện icon) */
  isCollapsed = true;

  /** Trạng thái hover mở rộng tạm thời khi sidebar đang thu gọn */
  isHoverExpanded = false;

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
    }
  }

  /** Khi di chuột vào sidebar đang thu gọn → mở rộng tạm (overlay) */
  onMouseEnter() {
    if (this.isCollapsed) {
      this.isHoverExpanded = true;
    }
  }

  /** Khi chuột rời sidebar → thu gọn lại */
  onMouseLeave() {
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
    this.toggleSidebar.emit();
  }
}