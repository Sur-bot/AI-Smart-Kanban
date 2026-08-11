import {
  Component,
  HostBinding,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

import {
  NavDropdownConfig,
  NavMenuGroup,
  NavMenuItem,
  NavMenuTab,
} from '../landing-header/landing-header.types';

@Component({
  selector: 'app-nav-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, MatIconModule],
  templateUrl: './nav-dropdown.component.html',
  styleUrl: './nav-dropdown.component.scss',
})
export class NavDropdownComponent implements OnInit {
  @Input({ required: true }) config!: NavDropdownConfig;

  /** Tracks selected tab key in mega-tabbed variant */
  activeTab = signal<string>('');

  ngOnInit(): void {
    if (this.config.variant === 'mega-tabbed' && this.config.tabs?.length) {
      this.activeTab.set(this.config.tabs[0].key);
    }
  }

  /** Adds host class based on variant for scoped SCSS positioning */
  @HostBinding('class')
  get hostClass(): string {
    return `nav-dropdown nav-dropdown--${this.config.variant}`;
  }

  /** Returns the active tab's data object */
  get activeTabData(): NavMenuTab | undefined {
    return this.config.tabs?.find(t => t.key === this.activeTab());
  }

  setActiveTab(key: string): void {
    this.activeTab.set(key);
  }

  /**
   * Splits a group's items into two equal halves for two-column display.
   * Used when group.twoColumns = true.
   */
  getColumns(group: NavMenuGroup): [NavMenuItem[], NavMenuItem[]] {
    const half = Math.ceil(group.items.length / 2);
    return [group.items.slice(0, half), group.items.slice(half)];
  }
}
