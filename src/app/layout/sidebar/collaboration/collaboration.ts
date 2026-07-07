import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from '../../../core/config/menu.config';

@Component({
  selector: 'app-collaboration',
  templateUrl: './collaboration.html',
  styleUrls: ['./collaboration.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
})
export class CollaborationComponent {
  /** Danh sách các mục con của Hợp tác */
  @Input() children: MenuItem[] = [];

  /** Trạng thái mở rộng submenu */
  @Input() isExpanded = true;

  /** Trạng thái đang hiển thị các mục con */
  @Input() isOpen = true;
}
