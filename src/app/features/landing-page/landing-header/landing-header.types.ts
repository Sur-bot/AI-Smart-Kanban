/**
 * Type definitions for the Landing Page Header navigation system.
 * Designed to be data-driven and scalable to API/CMS in the future.
 */

/** Controls which template variant the NavDropdownComponent renders */
export type DropdownVariant = 'compact' | 'wide' | 'mega-tabbed';

/** A single clickable item in a dropdown group or tab */
export interface NavMenuItem {
  /** i18n translation key for the item label */
  labelKey: string;
  /** i18n key for the item description (used in mega-tabbed grid) */
  descKey?: string;
  /** Material Icon name shown next to the item (used in 'wide' with icons) */
  matIcon?: string;
  /** Internal route for routerLink */
  route?: string;
  /** Whether to show an external-link icon */
  isExternal?: boolean;
}

/** A group of items rendered as a column with a header */
export interface NavMenuGroup {
  /** Unique ID — used for aria-labelledby */
  id: string;
  /** i18n key for the group title */
  titleKey: string;
  /** Material Icon name for the group header */
  matIcon: string;
  /** List of items in this group */
  items: NavMenuItem[];
  /**
   * When true, items are split into 2 sub-columns automatically.
   * Useful for groups with many items (e.g., Industry with 12 entries).
   */
  twoColumns?: boolean;
}

/**
 * A tab in the mega-tabbed variant (e.g., TÍNH NĂNG).
 * Each tab has a sidebar button and a content panel.
 */
export interface NavMenuTab {
  /** Unique key for tracking active tab */
  key: string;
  /** i18n key for the tab sidebar label */
  labelKey: string;
  /** Material Icon for the tab button */
  matIcon: string;
  /** Custom HEX color for the icon (optional) */
  iconColor?: string;
  /** i18n key for the main content panel title */
  contentTitleKey: string;
  /** i18n key for the content panel subtitle */
  contentSubtitleKey?: string;
  /**
   * Items rendered in a 3-column grid in the content panel.
   * Each item may have a label and a description.
   */
  items: NavMenuItem[];
  /** i18n key for the "See all features" footer link */
  seeAllFeaturesKey?: string;
  /** Route for the "See all features" link */
  seeAllFeaturesRoute?: string;
}

/** Full configuration for a nav item dropdown */
export interface NavDropdownConfig {
  variant: DropdownVariant;

  // ── Used by 'compact' and 'wide' variants ──
  groups?: NavMenuGroup[];
  /** Rendered in the shaded aside panel (right side, 'wide' only) */
  asideGroups?: NavMenuGroup[];
  /** i18n key for the footer "See all" link */
  seeAllKey?: string;
  /** Route for the footer "See all" link */
  seeAllRoute?: string;

  // ── Used by 'mega-tabbed' variant ──
  tabs?: NavMenuTab[];
  /** i18n key for the "See all tools" link in the sidebar footer */
  seeAllTabsKey?: string;
  /** Route for the "See all tools" link */
  seeAllTabsRoute?: string;
}

/** A single item in the top-level navigation bar */
export interface NavItem {
  /** Unique key for state tracking (activeDropdown signal) */
  key: string;
  /** i18n key for the nav label */
  labelKey: string;
  /** Optional dropdown — if absent, the item has no dropdown */
  dropdown?: NavDropdownConfig;
}
