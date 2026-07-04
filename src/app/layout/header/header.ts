import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubNavComponent } from './sub-nav/sub-nav';
import { SearchComponent } from './search/expandable-search';
import { SettingSliderComponent } from './setting/setting-slider';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  standalone: true,
  imports: [CommonModule, SubNavComponent, SearchComponent, SettingSliderComponent],
})
export class HeaderComponent {
  currentView = signal<'list' | 'board'>('board');
  profileMenuOpen = signal(false);
  notificationCount = signal(3);
  userName = 'John Doe';
  userInitial = 'JD';
  isPopupOpen = false;

  toggleProfileMenu() {
    this.profileMenuOpen.update((value) => !value);
  }

  switchView(view: 'list' | 'board') {
    this.currentView.set(view);
  }

  togglePopup(event: Event) {
    event.stopPropagation(); // Ngăn click lan ra ngoài làm đóng popup ngay lập tức
    this.isPopupOpen = !this.isPopupOpen;
  }
}
