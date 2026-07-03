import {Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import { SubNavComponent } from './sub-nav/sub-nav';
@Component({
    selector: 'app-header',
    templateUrl: './header.html',  
    styleUrls: ['./header.scss'],
    standalone: true,
    imports: [CommonModule, SubNavComponent]
})

export class HeaderComponent {
  currentView = signal<'list' | 'board'>('board');
  profileMenuOpen = signal(false);
  notificationCount = signal(3);
  userName = 'John Doe';
  userInitial = 'JD';

  toggleProfileMenu() {
    this.profileMenuOpen.update(value => !value);
  }

  switchView(view: 'list' | 'board') {
    this.currentView.set(view);
  }
}
