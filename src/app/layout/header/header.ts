import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubNavComponent } from './sub-nav/sub-nav';
import { SearchComponent } from './search/expandable-search';
import { SettingSliderComponent } from './setting/setting-slider';
import { InviteComponent } from './actions-button/invite/invite';
import { UserTimeWidgetComponent } from './user-time-widget/user-time-widget';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  standalone: true,
  imports: [CommonModule, SubNavComponent, SearchComponent, SettingSliderComponent, InviteComponent, UserTimeWidgetComponent],
})
export class HeaderComponent {
  currentView = signal<'list' | 'board'>('board');
  profileMenuOpen = signal(false);
  notificationCount = signal(3);
  userName = 'John Doe';
  userInitial = 'JD';

  // Chỉ một popup được mở tại một thời điểm
  activePopup: 'setting' | 'invite' | null = null;

  get isPopupOpen()  { return this.activePopup === 'setting'; }
  get isInviteOpen() { return this.activePopup === 'invite'; }

  /**
   * Document click handler — đóng popup khi click bên ngoài.
   * Bỏ stopPropagation() hoàn toàn. Thay vào đó dùng target.closest()
   * để phân biệt click bên trong popup vs bên ngoài.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    // Nếu click vào bên trong popup panel → giữ popup mở
    if (target.closest('.setting-slider-dropdown') || target.closest('.invite-dropdown')) {
      return;
    }

    // Nếu click vào nút toggle → để togglePopup/toggleInvite xử lý
    if (target.closest('#header-settings-btn')) {
      return;
    }
    if (target.closest('#header-invite-btn')) {
      return;
    }

    // Mọi click khác → đóng popup
    this.activePopup = null;
  }

  togglePopup() {
    this.activePopup = this.activePopup === 'setting' ? null : 'setting';
  }

  toggleInvite() {
    this.activePopup = this.activePopup === 'invite' ? null : 'invite';
  }

  toggleProfileMenu() {
    this.profileMenuOpen.update((v) => !v);
  }

  switchView(view: 'list' | 'board') {
    this.currentView.set(view);
  }
}
