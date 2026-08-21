import { Component, Input, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NgStyle } from '@angular/common';
import { CreateTaskModalComponent } from '../../create-task-modal/create-task-modal';

const TASK_FILTERS = [
  { id: 'in_progress', label: 'Đang tiến hành' },
  { id: 'completed', label: 'Đã hoàn thành' },
  { id: 'delayed', label: 'Đang trì hoãn' },
  { id: 'overdue', label: 'Quá hạn' },
  { id: 'almost_overdue', label: 'Sắp quá hạn' },
];

const PROJECT_FILTERS = [
  { id: 'active', label: 'Hoạt động' },
  { id: 'archived', label: 'Lưu trữ' },
  { id: 'favorite', label: 'Ưa thích' },
  { id: 'mine', label: 'Của tôi' },
];

export interface ToolbarField {
  id: string;
  label: string;
  checked: boolean;
  type: 'text' | 'select' | 'tags' | 'date';
  isDefault?: boolean;
  options?: string[];
}

export const DEFAULT_TASK_FIELDS: ToolbarField[] = [
  { id: 'created_by',          label: 'Được tạo bởi',                  checked: false, type: 'text'   },
  { id: 'assignee',            label: 'Người được phân công',           checked: false, type: 'text'   },
  { id: 'status',              label: 'Trạng thái',                    checked: true,  type: 'tags', isDefault: true, options: ['Đang chờ thực hiện', 'Đang tiến hành', 'Đang chờ xem xét', 'Đang trì hoãn'] },
  { id: 'due_date',            label: 'Hạn chốt',                      checked: false, type: 'date'   },
  { id: 'project',             label: 'Dự án (nhóm)',                  checked: false, type: 'select' },
  { id: 'attention',           label: 'Cần chú ý',                     checked: true,  type: 'select', isDefault: true },
  { id: 'task_params',         label: 'Tham số tác vụ',                checked: false, type: 'text'   },
  { id: 'id',                  label: 'ID',                             checked: false, type: 'text'   },
  { id: 'name',                label: 'Tên',                            checked: false, type: 'text'   },
  { id: 'priority',            label: 'Ưu tiên',                       checked: false, type: 'select' },
  { id: 'evaluation',          label: 'Đánh giá',                      checked: false, type: 'select' },
  { id: 'time_tracking',       label: 'Theo dõi thời gian thực hiện',  checked: false, type: 'select' },
  { id: 'created_date',        label: 'Ngày tạo',                      checked: false, type: 'date'   },
  { id: 'closed_date',         label: 'Ngày đóng',                     checked: false, type: 'date'   },
  { id: 'start_date',          label: 'Ngày bắt đầu',                  checked: false, type: 'date'   },
  { id: 'planned_start_date',  label: 'Ngày bắt đầu theo kế hoạch',   checked: false, type: 'date'   },
  { id: 'planned_end_date',    label: 'Ngày kết thúc theo kế hoạch',   checked: false, type: 'date'   },
  { id: 'activated',           label: 'Đã hoạt động',                  checked: false, type: 'select' },
  { id: 'participants',        label: 'Người tham gia',                checked: false, type: 'text'   },
  { id: 'observers',           label: 'Người quan sát',                checked: false, type: 'text'   },
  { id: 'tags',                label: 'Thẻ',                            checked: false, type: 'tags'   },
  { id: 'flow',                label: 'Luồng',                          checked: false, type: 'select' },
  { id: 'role',                label: 'Vai trò',                        checked: true,  type: 'select', isDefault: true },
  { id: 'comments',            label: 'Bình luận',                     checked: false, type: 'text'   },
  { id: 'activity',            label: 'Hoạt động',                     checked: false, type: 'select' },
];

@Component({
  selector: 'app-page-toolbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, NgStyle, CreateTaskModalComponent],
  templateUrl: './page-toolbar.html',
  styleUrls: ['./page-toolbar.scss'],
})
export class PageToolbarComponent {
  @Input() title = '';
  
  private _showRoleDropdown = true;
  @Input() set showRoleDropdown(value: boolean) {
    this._showRoleDropdown = value;
    if (this.availableFields) {
      const roleField = this.availableFields.find(f => f.id === 'role');
      if (roleField) {
        roleField.checked = value;
      }
    }
  }
  get showRoleDropdown(): boolean {
    return this._showRoleDropdown;
  }
  
  @Input() showCreateDropdown = true;
  @Input() showToolbarRight = true;

  popupStyle: { top: string; left: string } = { top: '0px', left: '0px' };
  addFieldPopupStyle: { top?: string; bottom?: string; left: string } = { top: '0px', left: '0px' };

  constructor(private el: ElementRef) {}

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

  /** Trang thai hien thi popup Tao Tac Vu */
  isCreateModalOpen = false;

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  @HostListener('document:click')
  clickout() {
    this.isRoleDropdownOpen = false;
    this.isAddFieldOpen = false;
    this.closeSearch();
  }

  isSearchOpen = false;
  isSearchClosing = false;
  searchQuery = '';
  isAddFieldOpen = false;

  @Input() availableFields: ToolbarField[] = [...DEFAULT_TASK_FIELDS];

  restoreDefaultFields() {
    this.availableFields.forEach(field => {
      field.checked = !!field.isDefault;
    });
    // Restore parent sync state if any 
    if (!this.showRoleDropdown) {
      const roleField = this.availableFields.find(f => f.id === 'role');
      if (roleField) {
        roleField.checked = false;
      }
    }
  }

  hasCheckedFields(): boolean {
    return this.availableFields.some(f => f.checked);
  }

  toggleAddField(event: Event) {
    event.stopPropagation();
    if (!this.isAddFieldOpen) {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const parentPanel = target.closest('.search-popup-panel');
      const spaceBelow = window.innerHeight - rect.bottom;
      
      if (parentPanel) {
        const parentRect = parentPanel.getBoundingClientRect();
        if (spaceBelow < 320) {
          // Open above
          this.addFieldPopupStyle = {
            top: 'auto',
            bottom: `${parentRect.bottom - rect.top + 12}px`,
            left: `${rect.left - parentRect.left}px`
          };
        } else {
          // Open below
          this.addFieldPopupStyle = {
            top: `${rect.bottom - parentRect.top + 12}px`,
            bottom: 'auto',
            left: `${rect.left - parentRect.left}px`
          };
        }
      } else {
        if (spaceBelow < 320) {
          this.addFieldPopupStyle = {
            top: 'auto',
            bottom: `${window.innerHeight - rect.top + 12}px`,
            left: `${rect.left}px`
          };
        } else {
          this.addFieldPopupStyle = {
            top: `${rect.bottom + 12}px`,
            bottom: 'auto',
            left: `${rect.left}px`
          };
        }
      }
      this.isAddFieldOpen = true;
    } else {
      this.isAddFieldOpen = false;
    }
  }

  onPanelClick(event: Event) {
    event.stopPropagation();
    this.isAddFieldOpen = false;
  }

  toggleFieldCheck(fieldId: string) {
    const field = this.availableFields.find(f => f.id === fieldId);
    if (field) {
      field.checked = !field.checked;
    }
  }

  isFieldChecked(fieldId: string): boolean {
    return this.availableFields.find(f => f.id === fieldId)?.checked || false;
  }

  @Input() set searchContext(context: 'task' | 'project') {
    this.searchFilters = context === 'project' ? PROJECT_FILTERS : TASK_FILTERS;
    this.selectedSearchFilter = this.searchFilters[0].id;
  }

  searchFilters: { id: string; label: string }[] = TASK_FILTERS;
  selectedSearchFilter: string | null = TASK_FILTERS[0].id;

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
