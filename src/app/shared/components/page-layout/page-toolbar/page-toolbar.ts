import { Component, Input, HostListener, ElementRef, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-toolbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, NgStyle],
  templateUrl: './page-toolbar.html',
  styleUrls: ['./page-toolbar.scss'],
})
export class PageToolbarComponent implements OnInit {
  @Input() title = '';
  @Input() showRoleDropdown = true;
  @Input() showCreateDropdown = true;
  @Input() showToolbarRight = true;
  @Input() searchFilters: { id: string; label: string }[] = [
    { id: 'in_progress', label: 'Đang tiến hành' },
    { id: 'completed', label: 'Đã hoàn thành' },
    { id: 'delayed', label: 'Đang trì hoãn' },
    { id: 'overdue', label: 'Quá hạn' },
    { id: 'almost_overdue', label: 'Sắp quá hạn' },
  ];
  @Input() defaultSearchFilter: string | null = 'in_progress';

  popupStyle: { top: string; left: string } = { top: '0px', left: '0px' };

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.selectedSearchFilter = this.defaultSearchFilter;
  }

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
    { id: 'following', label: 'Đang theo dõi' },
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

  isSearchOpen = false;
  isSearchClosing = false;
  searchQuery = '';

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
    'Đang chờ thực hiện', 'Đang tiến hành', 'Đang chờ xem xét', 'Đang trì hoãn',
  ];

  toggleSearch(event?: Event) {
    if (event) event.stopPropagation();
    this.isRoleDropdownOpen = false;
    if (this.isSearchOpen && !this.isSearchClosing) {
      this.closeSearch();
    } else if (!this.isSearchOpen) {
      // Tính toán vị trí fixed dựa trên search-filter-container
      const container = this.el.nativeElement.querySelector('.search-filter-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        this.popupStyle = {
          top: `${rect.bottom + 12}px`,
          left: `${rect.left}px`,
        };
      }
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
    }, 200);
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
