import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tasks-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tasks-toolbar.html',
  styleUrls: ['./tasks-toolbar.scss'],
})
export class TasksToolbarComponent {
  /** Các filter tag đang áp dụng */
  activeFilters = [
    { id: 'status', label: 'Đang tiến hành' },
  ];

  isRoleDropdownOpen = false;
  selectedRole = 'all';

  roles = [
    { id: 'all', label: 'Tất cả các vai trò' },
    { id: 'doing', label: 'Đang thực hiện' },
    { id: 'assisting', label: 'Đang hỗ trợ' },
    { id: 'set_by_me', label: 'Thiết lập bởi tôi' },
    { id: 'following', label: 'Đang theo dõi' }
  ];

  toggleRoleDropdown(event: Event) {
    event.stopPropagation();
    this.closeSearch();
    this.isRoleDropdownOpen = !this.isRoleDropdownOpen;
  }

  selectRole(roleId: string) {
    this.selectedRole = roleId;
    this.isRoleDropdownOpen = false;
    this.closeSearch();
  }

  getSelectedRoleLabel(): string {
    const role = this.roles.find(r => r.id === this.selectedRole);
    return role ? role.label : 'Tất cả các vai trò';
  }

  clearRoleFilter() {
    this.selectedRole = 'all';
  }

  @HostListener('document:click')
  clickout() {
    this.isRoleDropdownOpen = false;
    this.closeSearch();
  }

  // --- Search & Filter Combo ---
  isSearchOpen = false;
  isSearchClosing = false;
  searchQuery = '';

  searchFilters = [
    { id: 'in_progress', label: 'Đang tiến hành' },
    { id: 'completed', label: 'Đã hoàn thành' },
    { id: 'delayed', label: 'Đang trì hoãn' },
    { id: 'overdue', label: 'Quá hạn' },
    { id: 'almost_overdue', label: 'Sắp quá hạn' }
  ];
  selectedSearchFilter: string | null = 'in_progress';

  getSelectedSearchFilterLabel(): string {
    const filter = this.searchFilters.find(f => f.id === this.selectedSearchFilter);
    return filter ? filter.label : '';
  }

  clearSearchFilter() {
    this.selectedSearchFilter = null;
    this.closeSearch();
  }

  clearSearch() {
    this.searchQuery = '';
    this.selectedSearchFilter = null;
    this.selectedRole = 'all';
    this.closeSearch();
  }

  statusOptions = [
    'Đang chờ thực hiện', 'Đang tiến hành', 'Đang chờ xem xét', 'Đang trì hoãn'
  ];

  toggleSearch(event?: Event) {
    if (event) event.stopPropagation();
    this.isRoleDropdownOpen = false;
    if (this.isSearchOpen && !this.isSearchClosing) {
      this.closeSearch();
    } else if (!this.isSearchOpen) {
      this.isSearchOpen = true;
      this.isSearchClosing = false;
    }
  }


  closeSearch() {
    if (!this.isSearchOpen || this.isSearchClosing) return;
    this.isSearchClosing = true;
    setTimeout(() => {
      this.isSearchOpen = false;
      this.isSearchClosing = false;
    }, 200); // Match CSS animation duration
  }

  onSearchInput(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    if (this.searchQuery.trim().length > 0) {
      this.closeSearch();
    }
  }

  selectSearchFilter(filterId: string) {
    this.selectedSearchFilter = filterId;
  }
}
