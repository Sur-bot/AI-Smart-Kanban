import { Component, signal, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

import { NavDropdownConfig, NavMenuGroup } from './landing-header.types';

@Component({
  selector: 'app-landing-header',
  imports: [CommonModule, RouterModule, TranslatePipe, MatIconModule],
  templateUrl: './landing-header.html',
  styleUrl: './landing-header.scss',
})
export class LandingHeaderComponent implements OnInit {
  // ─── Services ───────────────────────────────────────────────
  translate = inject(TranslateService);

  // ─── UI State ───────────────────────────────────────────────
  isLangPopupOpen = signal(false);
  isSolutionsOpen = signal(false);
  currentLang     = signal('vi');

  // ─── Language Options ────────────────────────────────────────
  languages = [
    { code: 'vi', label: 'VN', fullName: 'Việt Nam (Tiếng Việt)' },
    { code: 'en', label: 'EN', fullName: 'United Kingdom (English)' },
  ];

  // ─── Solutions Dropdown Data ─────────────────────────────────
  /**
   * Data-driven configuration for the "GIẢI PHÁP" dropdown.
   * Adding or removing menu items only requires editing this object —
   * no changes to the HTML template needed.
   *
   * Future: replace with an API call from a CMS/backend service.
   */
  readonly solutionsDropdown: NavDropdownConfig = {
    groups: [
      {
        id: 'dd-industry',
        titleKey: 'LANDING.DD.INDUSTRY_TITLE',
        icon: 'apartment',
        twoColumns: true,
        items: [
          { labelKey: 'LANDING.DD.IND_TRANSPORT' },
          { labelKey: 'LANDING.DD.IND_RESTAURANT' },
          { labelKey: 'LANDING.DD.IND_REMOTE' },
          { labelKey: 'LANDING.DD.IND_REALESTATE_CRM' },
          { labelKey: 'LANDING.DD.IND_HEALTHCARE' },
          { labelKey: 'LANDING.DD.IND_LEGAL' },
          { labelKey: 'LANDING.DD.IND_REALESTATE' },
          { labelKey: 'LANDING.DD.IND_CONSULTING' },
          { labelKey: 'LANDING.DD.IND_RETAIL' },
          { labelKey: 'LANDING.DD.IND_CATALOG' },
          { labelKey: 'LANDING.DD.IND_CONSTRUCTION' },
          { labelKey: 'LANDING.DD.IND_TRAVEL' },
        ],
      },
      {
        id: 'dd-goal',
        titleKey: 'LANDING.DD.GOAL_TITLE',
        icon: 'track_changes',
        items: [
          { labelKey: 'LANDING.DD.GOAL_EFFICIENCY' },
          { labelKey: 'LANDING.DD.GOAL_COMMUNICATION' },
          { labelKey: 'LANDING.DD.GOAL_MOBILITY' },
          { labelKey: 'LANDING.DD.GOAL_MANAGEMENT' },
        ],
      },
      {
        id: 'dd-tool',
        titleKey: 'LANDING.DD.TOOL_TITLE',
        icon: 'build',
        items: [
          { labelKey: 'LANDING.DD.TOOL_PHONE' },
          { labelKey: 'LANDING.DD.TOOL_CRM' },
          { labelKey: 'LANDING.DD.TOOL_CALENDAR' },
          { labelKey: 'LANDING.DD.TOOL_CONTACT_CENTER' },
          { labelKey: 'LANDING.DD.TOOL_TASKS' },
          { labelKey: 'LANDING.DD.TOOL_WEBSITE' },
        ],
      },
    ],
    asideGroups: [
      {
        id: 'dd-size',
        titleKey: 'LANDING.DD.SIZE_TITLE',
        icon: 'corporate_fare',
        items: [
          { labelKey: 'LANDING.DD.SIZE_SOLO' },
          { labelKey: 'LANDING.DD.SIZE_SMB' },
          { labelKey: 'LANDING.DD.SIZE_ENTERPRISE' },
        ],
      },
      {
        id: 'dd-role',
        titleKey: 'LANDING.DD.ROLE_TITLE',
        icon: 'groups',
        items: [
          { labelKey: 'LANDING.DD.ROLE_MARKETING' },
          { labelKey: 'LANDING.DD.ROLE_HR' },
          { labelKey: 'LANDING.DD.ROLE_PM' },
          { labelKey: 'LANDING.DD.ROLE_CS' },
        ],
      },
    ],
    seeAllKey:   'LANDING.DD.SEE_ALL',
    seeAllRoute: '/solutions',
  };

  // ─── Helpers ─────────────────────────────────────────────────
  /**
   * Splits a group's items array in half for two-column layout.
   * Used by groups with twoColumns = true.
   */
  getColumns(group: NavMenuGroup): [typeof group.items, typeof group.items] {
    const half = Math.ceil(group.items.length / 2);
    return [group.items.slice(0, half), group.items.slice(half)];
  }

  // ─── Lifecycle ───────────────────────────────────────────────
  ngOnInit() {
    const savedLang = localStorage.getItem('appLang');
    if (savedLang) {
      this.currentLang.set(savedLang);
      this.translate.use(savedLang);
    } else {
      this.currentLang.set(this.translate.currentLang() || 'vi');
    }
  }

  // ─── Event Handlers ──────────────────────────────────────────
  toggleLangPopup(event: Event) {
    event.stopPropagation();
    this.isSolutionsOpen.set(false);
    this.isLangPopupOpen.set(!this.isLangPopupOpen());
  }

  toggleSolutions(event: Event) {
    event.stopPropagation();
    this.isLangPopupOpen.set(false);
    this.isSolutionsOpen.set(!this.isSolutionsOpen());
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem('appLang', lang);
    this.isLangPopupOpen.set(false);
  }

  @HostListener('document:click')
  onClickOutside() {
    this.isLangPopupOpen.set(false);
    this.isSolutionsOpen.set(false);
  }

  get currentLangLabel(): string {
    return this.languages.find(l => l.code === this.currentLang())?.label ?? 'VN';
  }
}
