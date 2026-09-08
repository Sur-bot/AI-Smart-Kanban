import { Component, signal, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

import { NavDropdownConfig, NavItem } from './landing-header.types';
import { NavDropdownComponent } from '../nav-dropdown/nav-dropdown.component';

@Component({
  selector: 'app-landing-header',
  imports: [CommonModule, RouterModule, TranslatePipe, MatIconModule, NavDropdownComponent],
  templateUrl: './landing-header.html',
  styleUrl: './landing-header.scss',
})
export class LandingHeaderComponent implements OnInit {
  // ─── Services ───────────────────────────────────────────────
  translate = inject(TranslateService);

  // ─── UI State ───────────────────────────────────────────────
  /** Tracks which nav dropdown is open. null = all closed. */
  activeDropdown = signal<string | null>(null);
  activeMobileSubDropdown = signal<string | null>(null);
  isLangPopupOpen = signal(false);
  isMobileMenuOpen = signal(false);
  currentLang = signal('vi');

  // ─── Language Options ────────────────────────────────────────
  languages = [
    { code: 'vi', label: 'VN', fullName: 'Việt Nam (Tiếng Việt)' },
    { code: 'en', label: 'EN', fullName: 'United Kingdom (English)' },
  ];

  // ─── Dropdown Configs ────────────────────────────────────────

  private readonly featuresDropdown: NavDropdownConfig = {
    variant: 'mega-tabbed',
    seeAllTabsKey: 'LANDING.DD.FEAT_SEE_ALL_TOOLS',
    seeAllTabsRoute: '/features',
    tabs: [
      {
        key: 'crm',
        labelKey: 'LANDING.DD.FEAT_CRM_TAB',
        matIcon: 'manage_accounts',
        iconColor: '#409EEF',
        contentTitleKey: 'LANDING.DD.FEAT_CRM_TITLE',
        contentSubtitleKey: 'LANDING.DD.FEAT_CRM_SUBTITLE',
        seeAllFeaturesKey: 'LANDING.DD.FEAT_CRM_SEE_ALL',
        seeAllFeaturesRoute: '/features/crm',
        items: [
          { labelKey: 'LANDING.DD.FEAT_CRM_SALES',         descKey: 'LANDING.DD.FEAT_CRM_SALES_DESC' },
          { labelKey: 'LANDING.DD.FEAT_CRM_MARKETING',     descKey: 'LANDING.DD.FEAT_CRM_MARKETING_DESC' },
          { labelKey: 'LANDING.DD.FEAT_CRM_COLLAB',        descKey: 'LANDING.DD.FEAT_CRM_COLLAB_DESC' },
          { labelKey: 'LANDING.DD.FEAT_CRM_CONTACT',       descKey: 'LANDING.DD.FEAT_CRM_CONTACT_DESC' },
          { labelKey: 'LANDING.DD.FEAT_CRM_ANALYTICS',     descKey: 'LANDING.DD.FEAT_CRM_ANALYTICS_DESC' },
          { labelKey: 'LANDING.DD.FEAT_CRM_MOBILE',        descKey: 'LANDING.DD.FEAT_CRM_MOBILE_DESC' },
          { labelKey: 'LANDING.DD.FEAT_CRM_PROMO',         descKey: 'LANDING.DD.FEAT_CRM_PROMO_DESC' },
          { labelKey: 'LANDING.DD.FEAT_CRM_AUTOMATION',    descKey: 'LANDING.DD.FEAT_CRM_AUTOMATION_DESC' },
          { labelKey: 'LANDING.DD.FEAT_CRM_COPILOT',       descKey: 'LANDING.DD.FEAT_CRM_COPILOT_DESC' },
        ],
      },
      {
        key: 'tasks',
        labelKey: 'LANDING.DD.FEAT_TASKS_TAB',
        matIcon: 'task_alt',
        iconColor: '#BEEB00',
        contentTitleKey: 'LANDING.DD.FEAT_TASKS_TITLE',
        contentSubtitleKey: 'LANDING.DD.FEAT_TASKS_SUBTITLE',
        seeAllFeaturesKey: 'LANDING.DD.FEAT_TASKS_SEE_ALL',
        seeAllFeaturesRoute: '/features/tasks',
        items: [
          { labelKey: 'LANDING.DD.FEAT_TASKS_KANBAN',     descKey: 'LANDING.DD.FEAT_TASKS_KANBAN_DESC' },
          { labelKey: 'LANDING.DD.FEAT_TASKS_GANTT',      descKey: 'LANDING.DD.FEAT_TASKS_GANTT_DESC' },
          { labelKey: 'LANDING.DD.FEAT_TASKS_SCRUM',      descKey: 'LANDING.DD.FEAT_TASKS_SCRUM_DESC' },
          { labelKey: 'LANDING.DD.FEAT_TASKS_DEADLINE',   descKey: 'LANDING.DD.FEAT_TASKS_DEADLINE_DESC' },
          { labelKey: 'LANDING.DD.FEAT_TASKS_TEMPLATES',  descKey: 'LANDING.DD.FEAT_TASKS_TEMPLATES_DESC' },
          { labelKey: 'LANDING.DD.FEAT_TASKS_REPORTS',    descKey: 'LANDING.DD.FEAT_TASKS_REPORTS_DESC' },
          { labelKey: 'LANDING.DD.FEAT_TASKS_CHECKLIST',  descKey: 'LANDING.DD.FEAT_TASKS_CHECKLIST_DESC' },
          { labelKey: 'LANDING.DD.FEAT_TASKS_TIME',       descKey: 'LANDING.DD.FEAT_TASKS_TIME_DESC' },
          { labelKey: 'LANDING.DD.FEAT_TASKS_MOBILE',     descKey: 'LANDING.DD.FEAT_TASKS_MOBILE_DESC' },
        ],
      },
      {
        key: 'collab',
        labelKey: 'LANDING.DD.FEAT_COLLAB_TAB',
        matIcon: 'group_work',
        iconColor: '#FF9500',
        contentTitleKey: 'LANDING.DD.FEAT_COLLAB_TITLE',
        contentSubtitleKey: 'LANDING.DD.FEAT_COLLAB_SUBTITLE',
        seeAllFeaturesKey: 'LANDING.DD.FEAT_COLLAB_SEE_ALL',
        seeAllFeaturesRoute: '/features/collab',
        items: [
          { labelKey: 'LANDING.DD.FEAT_COLLAB_CHAT',     descKey: 'LANDING.DD.FEAT_COLLAB_CHAT_DESC' },
          { labelKey: 'LANDING.DD.FEAT_COLLAB_VIDEO',    descKey: 'LANDING.DD.FEAT_COLLAB_VIDEO_DESC' },
          { labelKey: 'LANDING.DD.FEAT_COLLAB_DOCS',     descKey: 'LANDING.DD.FEAT_COLLAB_DOCS_DESC' },
          { labelKey: 'LANDING.DD.FEAT_COLLAB_CALENDAR', descKey: 'LANDING.DD.FEAT_COLLAB_CALENDAR_DESC' },
          { labelKey: 'LANDING.DD.FEAT_COLLAB_STORAGE',  descKey: 'LANDING.DD.FEAT_COLLAB_STORAGE_DESC' },
          { labelKey: 'LANDING.DD.FEAT_COLLAB_NEWS',     descKey: 'LANDING.DD.FEAT_COLLAB_NEWS_DESC' },
          { labelKey: 'LANDING.DD.FEAT_COLLAB_STREAM',   descKey: 'LANDING.DD.FEAT_COLLAB_STREAM_DESC' },
          { labelKey: 'LANDING.DD.FEAT_COLLAB_WORKGROUP',descKey: 'LANDING.DD.FEAT_COLLAB_WORKGROUP_DESC' },
          { labelKey: 'LANDING.DD.FEAT_COLLAB_MOBILE',   descKey: 'LANDING.DD.FEAT_COLLAB_MOBILE_DESC' },
        ],
      },
      {
        key: 'website',
        labelKey: 'LANDING.DD.FEAT_WEB_TAB',
        matIcon: 'storefront',
        iconColor: '#FF4782',
        contentTitleKey: 'LANDING.DD.FEAT_WEB_TITLE',
        contentSubtitleKey: 'LANDING.DD.FEAT_WEB_SUBTITLE',
        seeAllFeaturesKey: 'LANDING.DD.FEAT_WEB_SEE_ALL',
        seeAllFeaturesRoute: '/features/website',
        items: [
          { labelKey: 'LANDING.DD.FEAT_WEB_BUILDER',    descKey: 'LANDING.DD.FEAT_WEB_BUILDER_DESC' },
          { labelKey: 'LANDING.DD.FEAT_WEB_CATALOG',    descKey: 'LANDING.DD.FEAT_WEB_CATALOG_DESC' },
          { labelKey: 'LANDING.DD.FEAT_WEB_LANDING',    descKey: 'LANDING.DD.FEAT_WEB_LANDING_DESC' },
          { labelKey: 'LANDING.DD.FEAT_WEB_FORM',       descKey: 'LANDING.DD.FEAT_WEB_FORM_DESC' },
          { labelKey: 'LANDING.DD.FEAT_WEB_STORE',      descKey: 'LANDING.DD.FEAT_WEB_STORE_DESC' },
          { labelKey: 'LANDING.DD.FEAT_WEB_SEO',        descKey: 'LANDING.DD.FEAT_WEB_SEO_DESC' },
          { labelKey: 'LANDING.DD.FEAT_WEB_CHAT',       descKey: 'LANDING.DD.FEAT_WEB_CHAT_DESC' },
          { labelKey: 'LANDING.DD.FEAT_WEB_PAYMENT',    descKey: 'LANDING.DD.FEAT_WEB_PAYMENT_DESC' },
          { labelKey: 'LANDING.DD.FEAT_WEB_ANALYTICS',  descKey: 'LANDING.DD.FEAT_WEB_ANALYTICS_DESC' },
        ],
      },
      {
        key: 'hr',
        labelKey: 'LANDING.DD.FEAT_HR_TAB',
        matIcon: 'engineering',
        iconColor: '#28CC43',
        contentTitleKey: 'LANDING.DD.FEAT_HR_TITLE',
        contentSubtitleKey: 'LANDING.DD.FEAT_HR_SUBTITLE',
        seeAllFeaturesKey: 'LANDING.DD.FEAT_HR_SEE_ALL',
        seeAllFeaturesRoute: '/features/hr',
        items: [
          { labelKey: 'LANDING.DD.FEAT_HR_STRUCTURE',  descKey: 'LANDING.DD.FEAT_HR_STRUCTURE_DESC' },
          { labelKey: 'LANDING.DD.FEAT_HR_LEAVE',      descKey: 'LANDING.DD.FEAT_HR_LEAVE_DESC' },
          { labelKey: 'LANDING.DD.FEAT_HR_WORKTIME',   descKey: 'LANDING.DD.FEAT_HR_WORKTIME_DESC' },
          { labelKey: 'LANDING.DD.FEAT_HR_KPI',        descKey: 'LANDING.DD.FEAT_HR_KPI_DESC' },
          { labelKey: 'LANDING.DD.FEAT_HR_WORKFLOW',   descKey: 'LANDING.DD.FEAT_HR_WORKFLOW_DESC' },
          { labelKey: 'LANDING.DD.FEAT_HR_ROBOT',      descKey: 'LANDING.DD.FEAT_HR_ROBOT_DESC' },
          { labelKey: 'LANDING.DD.FEAT_HR_REPORT',     descKey: 'LANDING.DD.FEAT_HR_REPORT_DESC' },
          { labelKey: 'LANDING.DD.FEAT_HR_ONBOARD',    descKey: 'LANDING.DD.FEAT_HR_ONBOARD_DESC' },
          { labelKey: 'LANDING.DD.FEAT_HR_MOBILE',     descKey: 'LANDING.DD.FEAT_HR_MOBILE_DESC' },
        ],
      },
      {
        key: 'copilot',
        labelKey: 'LANDING.DD.FEAT_COPILOT_TAB',
        matIcon: 'smart_toy',
        iconColor: '#804DF0',
        contentTitleKey: 'LANDING.DD.FEAT_COPILOT_TITLE',
        contentSubtitleKey: 'LANDING.DD.FEAT_COPILOT_SUBTITLE',
        seeAllFeaturesKey: 'LANDING.DD.FEAT_COPILOT_SEE_ALL',
        seeAllFeaturesRoute: '/features/copilot',
        items: [
          { labelKey: 'LANDING.DD.FEAT_COPILOT_SUMMARY',   descKey: 'LANDING.DD.FEAT_COPILOT_SUMMARY_DESC' },
          { labelKey: 'LANDING.DD.FEAT_COPILOT_FILL',      descKey: 'LANDING.DD.FEAT_COPILOT_FILL_DESC' },
          { labelKey: 'LANDING.DD.FEAT_COPILOT_TASK',      descKey: 'LANDING.DD.FEAT_COPILOT_TASK_DESC' },
          { labelKey: 'LANDING.DD.FEAT_COPILOT_WRITE',     descKey: 'LANDING.DD.FEAT_COPILOT_WRITE_DESC' },
          { labelKey: 'LANDING.DD.FEAT_COPILOT_IMAGE',     descKey: 'LANDING.DD.FEAT_COPILOT_IMAGE_DESC' },
          { labelKey: 'LANDING.DD.FEAT_COPILOT_TRANSLATE', descKey: 'LANDING.DD.FEAT_COPILOT_TRANSLATE_DESC' },
          { labelKey: 'LANDING.DD.FEAT_COPILOT_SEARCH',    descKey: 'LANDING.DD.FEAT_COPILOT_SEARCH_DESC' },
          { labelKey: 'LANDING.DD.FEAT_COPILOT_VOICE',     descKey: 'LANDING.DD.FEAT_COPILOT_VOICE_DESC' },
          { labelKey: 'LANDING.DD.FEAT_COPILOT_ANALYST',   descKey: 'LANDING.DD.FEAT_COPILOT_ANALYST_DESC' },
        ],
      },
    ],
  };

  private readonly solutionsDropdown: NavDropdownConfig = {
    variant: 'wide',
    groups: [
      {
        id: 'dd-industry',
        titleKey: 'LANDING.DD.INDUSTRY_TITLE',
        matIcon: 'apartment',
        iconColor: '#409EEF',
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
        matIcon: 'track_changes',
        iconColor: '#28CC43',
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
        matIcon: 'build',
        iconColor: '#FF9500',
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
        matIcon: 'corporate_fare',
        iconColor: '#804DF0',
        items: [
          { labelKey: 'LANDING.DD.SIZE_SOLO' },
          { labelKey: 'LANDING.DD.SIZE_SMB' },
          { labelKey: 'LANDING.DD.SIZE_ENTERPRISE' },
        ],
      },
      {
        id: 'dd-role',
        titleKey: 'LANDING.DD.ROLE_TITLE',
        matIcon: 'groups',
        iconColor: '#FF4782',
        items: [
          { labelKey: 'LANDING.DD.ROLE_MARKETING' },
          { labelKey: 'LANDING.DD.ROLE_HR' },
          { labelKey: 'LANDING.DD.ROLE_PM' },
          { labelKey: 'LANDING.DD.ROLE_CS' },
        ],
      },
    ],
    seeAllKey: 'LANDING.DD.SEE_ALL',
    seeAllRoute: '/solutions',
  };

  private readonly techDropdown: NavDropdownConfig = {
    variant: 'wide',
    groups: [
      {
        id: 'dd-tech-import',
        titleKey: 'LANDING.DD.TECH_IMPORT_TITLE',
        matIcon: 'import_export',
        iconColor: '#00629A',
        items: [
          { labelKey: 'LANDING.DD.TECH_IMPORT_FRAMEWORKS', matIcon: 'code', iconColor: '#409EEF' },
          { labelKey: 'LANDING.DD.TECH_IMPORT_MAKE',       matIcon: 'auto_fix_high', iconColor: '#804DF0' },
          { labelKey: 'LANDING.DD.TECH_IMPORT_SHEET',      matIcon: 'table_chart', iconColor: '#28CC43' },
          { labelKey: 'LANDING.DD.TECH_IMPORT_TASKS',      matIcon: 'task_alt', iconColor: '#FF9500' },
        ],
      },
      {
        id: 'dd-tech-sales',
        titleKey: 'LANDING.DD.TECH_SALES_TITLE',
        matIcon: 'point_of_sale',
        iconColor: '#28CC43',
        items: [
          { labelKey: 'LANDING.DD.TECH_SALES_SHIPPER',    matIcon: 'local_shipping', iconColor: '#FF9500' },
          { labelKey: 'LANDING.DD.TECH_SALES_ANALYTICS',  matIcon: 'analytics', iconColor: '#409EEF' },
          { labelKey: 'LANDING.DD.TECH_SALES_REPORT',     matIcon: 'bar_chart', iconColor: '#FF4782' },
          { labelKey: 'LANDING.DD.TECH_SALES_DEALS',      matIcon: 'handshake', iconColor: '#BEEB00' },
        ],
      },
      {
        id: 'dd-tech-marketing',
        titleKey: 'LANDING.DD.TECH_MARKET_TITLE',
        matIcon: 'campaign',
        iconColor: '#FF4782',
        items: [
          { labelKey: 'LANDING.DD.TECH_MARKET_SMS',       matIcon: 'sms', iconColor: '#409EEF' },
          { labelKey: 'LANDING.DD.TECH_MARKET_FONTUMI',   matIcon: 'message', iconColor: '#28CC43' },
          { labelKey: 'LANDING.DD.TECH_MARKET_VOICE',     matIcon: 'record_voice_over', iconColor: '#FF9500' },
          { labelKey: 'LANDING.DD.TECH_MARKET_SOCIAL',    matIcon: 'share', iconColor: '#804DF0' },
        ],
      },
      {
        id: 'dd-tech-tasks',
        titleKey: 'LANDING.DD.TECH_TASKS_TITLE',
        matIcon: 'task',
        iconColor: '#FF9500',
        items: [
          { labelKey: 'LANDING.DD.TECH_TASKS_BURNUP',     matIcon: 'trending_up', iconColor: '#FF4782' },
          { labelKey: 'LANDING.DD.TECH_TASKS_IQDESK',     matIcon: 'support_agent', iconColor: '#409EEF' },
          { labelKey: 'LANDING.DD.TECH_TASKS_HELPDESK',   matIcon: 'help_center', iconColor: '#28CC43' },
          { labelKey: 'LANDING.DD.TECH_TASKS_TRACKER',    matIcon: 'timer', iconColor: '#804DF0' },
        ],
      },
    ],
  };

  private readonly partnersDropdown: NavDropdownConfig = {
    variant: 'wide',
    groups: [
      {
        id: 'dd-partner-customer',
        titleKey: 'LANDING.DD.PART_CUSTOMER_TITLE',
        matIcon: 'groups',
        iconColor: '#00629A',
        items: [
          { labelKey: 'LANDING.DD.PART_DIRECTORY' },
          { labelKey: 'LANDING.DD.PART_CONSULT' },
        ],
      },
      {
        id: 'dd-partner-biz',
        titleKey: 'LANDING.DD.PART_BIZ_TITLE',
        matIcon: 'handshake',
        iconColor: '#28CC43',
        items: [
          { labelKey: 'LANDING.DD.PART_BECOME',  isExternal: true },
          { labelKey: 'LANDING.DD.PART_LOGIN',   isExternal: true },
        ],
      },
    ],
  };


  /**
   * Single source of truth for the navigation bar.
   * Adding a new nav item = add 1 object here. No HTML changes needed.
   */
  readonly navItems: NavItem[] = [
    { key: 'features',  labelKey: 'LANDING.FEATURES',    dropdown: this.featuresDropdown  },
    { key: 'solutions', labelKey: 'LANDING.SOLUTIONS',   dropdown: this.solutionsDropdown },
    { key: 'tech',      labelKey: 'LANDING.TECH',        dropdown: this.techDropdown      },
    { key: 'partners',  labelKey: 'LANDING.PARTNERS',    dropdown: this.partnersDropdown  },
    { key: 'why',       labelKey: 'LANDING.WHY_DIGIT24'                                   },
  ];


  ngOnInit(): void {
    const savedLang = localStorage.getItem('appLang');
    if (savedLang) {
      this.currentLang.set(savedLang);
      this.translate.use(savedLang);
    } else {
      this.currentLang.set(this.translate.currentLang() || 'vi');
    }
  }


  toggleDropdown(key: string, event: Event): void {
    event.stopPropagation();
    this.isLangPopupOpen.set(false);
    
    if (this.activeDropdown() === key) {
      this.activeDropdown.set(null);
      this.activeMobileSubDropdown.set(null);
    } else {
      this.activeDropdown.set(key);
      this.activeMobileSubDropdown.set(null);
    }
  }

  toggleMobileSubDropdown(key: string, event: Event): void {
    event.stopPropagation();
    this.activeMobileSubDropdown.set(this.activeMobileSubDropdown() === key ? null : key);
  }

  toggleLangPopup(event: Event): void {
    event.stopPropagation();
    this.activeDropdown.set(null);
    this.isLangPopupOpen.set(!this.isLangPopupOpen());
  }

  toggleMobileMenu(event: Event): void {
    event.stopPropagation();
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
    // Close other dropdowns if opening mobile menu
    if (this.isMobileMenuOpen()) {
      this.activeDropdown.set(null);
      this.activeMobileSubDropdown.set(null);
      this.isLangPopupOpen.set(false);
    }
  }

  changeLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem('appLang', lang);
    this.isLangPopupOpen.set(false);
  }

  @HostListener('document:click')
  onClickOutside(): void {
    this.activeDropdown.set(null);
    this.activeMobileSubDropdown.set(null);
    this.isLangPopupOpen.set(false);
    this.isMobileMenuOpen.set(false);
  }

  get currentLangLabel(): string {
    return this.languages.find(l => l.code === this.currentLang())?.label ?? 'VN';
  }
}
