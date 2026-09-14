import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  HostListener,
  ChangeDetectorRef,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-user-profile-drawer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule],
  templateUrl: './user-profile-drawer-modal.html',
  styleUrls: ['./user-profile-drawer-modal.scss']
})
export class UserProfileDrawerModalComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  isClosing = false;
  currentTab: 'personal' = 'personal';

  userName = 'Vadim Rutkevich';
  userEmail = 'v.rutkevich@company.com';
  userRole = 'Product Manager';
  userPhone = '+1 800 612 8855';
  avatarUrl = 'https://i.pravatar.cc/150?u=vadim';

  // Mock Form Data
  formData = {
    organization: 'StiltSoft Development, Inc.',
    department: 'RnD Department',
    startedWorkOn: '11/10/2019',
    supervisorName: 'Maxim Kuzmich',
    supervisorAvatar: 'https://i.pravatar.cc/150?u=maxim',
    workPhone: '+1 800 656 5656',
    applications: 'After Effects, Adobe XD, Jira, Confluence, MS Project',
    languages: 'Enter languages',
    programmingLanguages: 'Enter programming languages',
    skills: 'Product management, prototyping',
    certifications: 'PMFC',
    country: 'United States of America',
    city: 'San Francisco',
    address: '10th Avenue, 24500',
    driverLicense: 'Yes',
    otherDetails: 'Enter additional details about the user'
  };

  // Inline Edit State
  editingField: string | null = null;
  tempEditValue: any = null;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  ngOnInit(): void {
    // Optionally override with real user data if needed
    // const user = this.authService.user();
    // if (user) { ... }
  }

  setTab(tab: 'personal'): void {
    this.currentTab = tab;
    this.cdr.detectChanges();
  }

  // --- Inline Edit Actions ---
  startEdit(field: string, currentValue: any): void {
    this.editingField = field;
    this.tempEditValue = currentValue;
  }

  saveEdit(field: string): void {
    if (this.editingField) {
      (this.formData as any)[field] = this.tempEditValue;
      this.editingField = null;
      this.tempEditValue = null;
    }
  }

  cancelEdit(): void {
    this.editingField = null;
    this.tempEditValue = null;
  }

  onCopyLink(): void {
    navigator.clipboard?.writeText(window.location.href);
  }

  onClose(): void {
    if (this.isClosing) return;
    this.isClosing = true;
    setTimeout(() => {
      this.isClosing = false;
      this.isOpen = false;
      this.currentTab = 'personal';
      this.close.emit();
      this.cdr.detectChanges();
    }, 300);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen && !this.isClosing) {
      this.onClose();
    }
  }
}
