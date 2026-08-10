/**
 * Type definitions for the Landing Page Header navigation dropdown.
 *
 * Designed to be data-driven and easily scalable to an API/CMS source in the future.
 */

export interface NavMenuItem {
  /** i18n translation key */
  labelKey: string;
  /** Optional internal route (routerLink) */
  route?: string;
  /** Optional external URL */
  href?: string;
}

export interface NavMenuGroup {
  /** Unique ID used for aria-labelledby */
  id: string;
  /** i18n key for the group title */
  titleKey: string;
  /** Material Icon name */
  icon: string;
  /** List of items in this group */
  items: NavMenuItem[];
  /**
   * When true, items are split into 2 columns visually.
   * Used for the "Industry" group which has 12 items.
   */
  twoColumns?: boolean;
}

export interface NavDropdownConfig {
  /** Ordered list of column groups */
  groups: NavMenuGroup[];
  /** Groups placed in the "aside" panel (right side, shaded) */
  asideGroups?: NavMenuGroup[];
  /** i18n key for the "See all" footer link */
  seeAllKey?: string;
  /** Route for the "See all" footer link */
  seeAllRoute?: string;
}
