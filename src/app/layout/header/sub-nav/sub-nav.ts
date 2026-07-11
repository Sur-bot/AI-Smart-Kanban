import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sub-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './sub-nav.html',
})

export class SubNavComponent {
  menuList = [
    { id: 'tasks', label: 'SUBNAV.TASKS', route: '/kanban/tasks', hasDropdown: false },
    { id: 'projects', label: 'SUBNAV.PROJECTS', route: '/kanban/projects', hasDropdown: false },
    { id: 'stream', label: 'SUBNAV.STREAM', route: '/kanban/stream', hasDropdown: false },
    { id: 'scrum', label: 'SUBNAV.SCRUM', route: '/kanban/scrum', hasDropdown: false },
    { id: 'efficiency', label: 'SUBNAV.PERFORMANCE', route: '/kanban/efficiency', hasDropdown: false, badge: '100%' },
    { id: 'analytics', label: 'SUBNAV.ANALYTICS', route: '', hasDropdown: true },
    { id: 'templates', label: 'SUBNAV.TEMPLATES', route: '/kanban/templates', hasDropdown: false },
    { id: 'trash', label: 'SUBNAV.RECYCLE_BIN', route: '/kanban/trash', hasDropdown: false },
    { id: 'more', label: 'SUBNAV.MORE', route: '', hasDropdown: true }
  ];

  openMenu(id: string) {
    console.log('Mở dropdown cho mục:', id);
  }
}