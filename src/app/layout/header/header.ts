import { CommonModule } from '@angular/common';
import { Component, HostListener, Output, EventEmitter, inject, signal } from '@angular/core';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { Overlay } from '@angular/cdk/overlay';
import { TranslatePipe } from '@ngx-translate/core';
import { SubNavComponent } from './sub-nav/sub-nav';
import { SearchComponent } from './search/expandable-search';
import { ExpandMenuSheetComponent } from '../sidebar/expand-menu-sheet/expand-menu-sheet';
import { SettingSliderComponent } from './setting/setting-slider';
import { InviteComponent } from './actions-button/invite/invite';
import { UserTimeWidgetComponent } from './user-time-widget/user-time-widget';
import { UserProfileDropdownComponent } from './user-profile-dropdown/user-profile-dropdown.component';
import { UserProfileDrawerModalComponent } from './user-profile-drawer-modal/user-profile-drawer-modal';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatBottomSheetModule,
    TranslatePipe,
    SubNavComponent,
    SearchComponent,
    SettingSliderComponent,
    InviteComponent,
    UserTimeWidgetComponent,
    UserProfileDropdownComponent,
    UserProfileDrawerModalComponent,
  ],
})
export class HeaderComponent {
  private bottomSheet = inject(MatBottomSheet);
  private overlay = inject(Overlay);

  readonly currentView = signal<'list' | 'board'>('board');
  notificationCount = signal(3);

  activePopup: 'setting' | 'invite' | 'profile' | null = null;

  get isPopupOpen() {
    return this.activePopup === 'setting';
  }
  get isInviteOpen() {
    return this.activePopup === 'invite';
  }
  get isProfileOpen() {
    return this.activePopup === 'profile';
  }

  isProfileDrawerOpen = false;

  @Output() toggleSidebar = new EventEmitter<void>();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    // Không đóng nếu click vào bên trong các dropdown popup
    if (
      target.closest('.setting-slider-dropdown') ||
      target.closest('.invite-dropdown') ||
      target.closest('.user-profile-dropdown')
    ) {
      return;
    }

    // Không đóng nếu click vào các nút trigger
    if (target.closest('#header-settings-btn')) {
      return;
    }
    if (target.closest('#header-invite-btn')) {
      return;
    }
    if (target.closest('#header-user-widget-btn')) {
      return;
    }

    this.activePopup = null;
  }

  togglePopup() {
    this.activePopup = this.activePopup === 'setting' ? null : 'setting';
  }

  toggleInvite() {
    this.activePopup = this.activePopup === 'invite' ? null : 'invite';
  }

  toggleProfile() {
    this.activePopup = this.activePopup === 'profile' ? null : 'profile';
  }

  openProfileDrawer() {
    this.isProfileDrawerOpen = true;
    this.activePopup = null;
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  onMobileMenuClick() {
    this.bottomSheet.open(ExpandMenuSheetComponent, {
      panelClass: 'expand-menu-sheet-panel',
      backdropClass: 'expand-sheet-backdrop',
      autoFocus: false,
      restoreFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.noop()
    });
  }

  switchView(view: 'list' | 'board') {
    this.currentView.set(view);
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth >= 1024) {
      this.bottomSheet.dismiss();
    }
  }
}
