import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-user-profile-dropdown',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './user-profile-dropdown.component.html',
  styleUrl: './user-profile-dropdown.component.scss'
})
export class UserProfileDropdownComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  @Output() profileClick = new EventEmitter<void>();
  @Output() securityClick = new EventEmitter<void>();
  @Output() extensionsClick = new EventEmitter<void>();
  @Output() mobileLoginClick = new EventEmitter<void>();
  @Output() downloadWindowsApp = new EventEmitter<void>();
  @Output() themeClick = new EventEmitter<void>();
  @Output() switchAccountClick = new EventEmitter<void>();
  @Output() companyActivityClick = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);

  // Lấy thông tin user hiện tại từ Signals của AuthService
  readonly user = this.authService.user;

  readonly userName = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return 'Văn Anh Nguyễn';
    return (
      currentUser.user_metadata?.['full_name'] ||
      currentUser.email?.split('@')[0] ||
      'Người dùng'
    );
  });

  readonly avatarUrl = computed(() => {
    const currentUser = this.user();
    return currentUser?.user_metadata?.['avatar_url'] || null;
  });

  readonly userRole = computed(() => {
    const currentUser = this.user();
    return currentUser?.user_metadata?.['role'] || 'Quản trị viên';
  });

  async onLogout() {
    this.close.emit();
    try {
      await this.authService.signOut();
    } catch (err) {
      console.error('[UserProfileDropdown] Lỗi đăng xuất:', err);
      this.router.navigate(['/login']);
    }
  }

  onProfileClick() {
    this.profileClick.emit();
    this.close.emit();
  }

  onSecurityClick() {
    this.securityClick.emit();
  }

  onExtensionsClick() {
    this.extensionsClick.emit();
  }

  onMobileLoginClick() {
    this.mobileLoginClick.emit();
  }

  onDownloadWindowsApp() {
    this.downloadWindowsApp.emit();
  }

  onThemeClick() {
    this.themeClick.emit();
  }

  onSwitchAccountClick() {
    this.switchAccountClick.emit();
  }

  onCompanyActivityClick() {
    this.companyActivityClick.emit();
  }
}
