import { Component, ChangeDetectorRef, ElementRef, AfterViewInit, OnDestroy, ViewChild, ViewChildren, QueryList, NgZone } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

export interface NavItem {
  id: string;
  label: string;
  route: string;
  hasDropdown: boolean;
  badge?: string;
  overflowPriority?: number;
}

export interface MoreDropdownItem {
  id: string;
  label: string;
  icon?: string;
  locked?: boolean;
  section?: string;
  isTranslationKey?: boolean;
}

@Component({
  selector: 'app-sub-nav',
  standalone: true,
  imports: [CommonModule, NgStyle, RouterModule, TranslatePipe, MatIconModule],
  templateUrl: './sub-nav.html',
  styleUrls: ['./sub-nav.scss'],
})
export class SubNavComponent implements AfterViewInit, OnDestroy {
  menuList: NavItem[] = [
    { id: 'tasks',      label: 'SUBNAV.TASKS',       route: '/kanban',      hasDropdown: false, overflowPriority: 8 },
    { id: 'projects',   label: 'SUBNAV.PROJECTS',     route: '/kanban/projects',   hasDropdown: false, overflowPriority: 7 },
    { id: 'stream',     label: 'SUBNAV.STREAM',       route: '/kanban/stream',     hasDropdown: false, overflowPriority: 6 },
    { id: 'scrum',      label: 'SUBNAV.SCRUM',        route: '/kanban/scrum',      hasDropdown: false, overflowPriority: 5 },
    { id: 'efficiency', label: 'SUBNAV.PERFORMANCE',  route: '/kanban/efficiency', hasDropdown: false, overflowPriority: 4, badge: '100%' },
    { id: 'analytics',  label: 'SUBNAV.ANALYTICS',    route: '',                   hasDropdown: true,  overflowPriority: 3 },
    { id: 'templates',  label: 'SUBNAV.TEMPLATES',    route: '/kanban/templates',  hasDropdown: false, overflowPriority: 2 },
    { id: 'trash',      label: 'SUBNAV.RECYCLE_BIN',  route: '/kanban/trash',      hasDropdown: false, overflowPriority: 1 },
    { id: 'more',       label: 'SUBNAV.MORE',         route: '',                   hasDropdown: true },
  ];

  readonly staticMoreItems: MoreDropdownItem[] = [
    { id: 'section-settings', section: 'CÃ i Ä‘áº·t',      label: '' },
    { id: 'config-menu',      label: 'Cáº¥u hÃ¬nh menu',  icon: 'settings', locked: false },
    { id: 'reset-menu',       label: 'Äáº·t láº¡i menu',   locked: false },
    { id: 'section-hidden',   section: 'áº¨n',           label: '' },
    { id: 'join',             label: 'Tham gia',       locked: false },
    { id: 'report',           label: 'BÃ¡o cÃ¡o',        icon: 'lock', locked: true },
    { id: 'access',           label: 'Quyá»n truy cáº­p', icon: 'lock', locked: true },
  ];

  @ViewChild('navContainer') navContainer!: ElementRef<HTMLElement>;
  @ViewChildren('navItemRef') navItemRefs!: QueryList<ElementRef<HTMLElement>>;

  private resizeObserver: ResizeObserver | null = null;
  private itemWidths = new Map<string, number>();

  visibleMenuList: NavItem[] = [];
  overflowNavItems: NavItem[] = [];

  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  isMoreOpen = false;
  dropdownStyle: { top: string; left: string } = { top: '0', left: '0' };

  constructor(private cdr: ChangeDetectorRef, private el: ElementRef, private ngZone: NgZone) {
    this.visibleMenuList = [...this.menuList];
  }

  ngAfterViewInit() {
    // Äo kÃ­ch thÆ°á»›c thá»±c táº¿ cá»§a tá»«ng má»¥c khi khá»Ÿi táº¡o
    this.navItemRefs.forEach((itemRef) => {
      const id = itemRef.nativeElement.getAttribute('data-id');
      if (id) {
        this.itemWidths.set(id, itemRef.nativeElement.offsetWidth);
      }
    });

    this.setupResizeObserver();
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
    }
  }

  private setupResizeObserver() {
    this.ngZone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
           this.calculateOverflow(entry.contentRect.width);
        }
      });
      if (this.navContainer) {
        this.resizeObserver.observe(this.navContainer.nativeElement);
      }
    });
  }

  private calculateOverflow(containerWidth: number) {
    const hidableItems = this.menuList.filter(item => item.id !== 'more');
    const moreBtnWidth = this.itemWidths.get('more') || 60; // Dá»± phÃ²ng 60px
    
    // Sáº¯p xáº¿p cÃ¡c má»¥c theo thá»© tá»± Æ°u tiÃªn áº©n (sá»‘ nhá» áº©n trÆ°á»›c)
    const sortedByPriority = [...hidableItems].sort((a, b) => {
       const pa = a.overflowPriority ?? 999;
       const pb = b.overflowPriority ?? 999;
       return pa - pb;
    });

    let currentVisible = [...hidableItems];
    let overflowItems: NavItem[] = [];

    const getVisibleWidth = (items: NavItem[]) => {
       let w = 0;
       for (const item of items) {
          w += this.itemWidths.get(item.id) || 0;
       }
       return w;
    };

    // Buffer 24px Ä‘á»ƒ bÃ¹ trá»« padding/margin vÃ  trÃ¡nh scrollbar
    const safeBuffer = 24; 
    const availableWidth = containerWidth - moreBtnWidth - safeBuffer;

    let currentWidth = getVisibleWidth(currentVisible) + (currentVisible.length * 2); // 2px gap má»—i item

    for (const itemToHide of sortedByPriority) {
        if (currentWidth <= availableWidth) break;

        currentVisible = currentVisible.filter(i => i.id !== itemToHide.id);
        overflowItems.push(itemToHide);
        
        currentWidth = getVisibleWidth(currentVisible) + (currentVisible.length * 2);
    }

    // Giá»¯ nguyÃªn thá»© tá»± ban Ä‘áº§u cho menu dropdown
    const originalOrder = this.menuList.map(i => i.id);
    overflowItems.sort((a, b) => originalOrder.indexOf(a.id) - originalOrder.indexOf(b.id));

    this.ngZone.run(() => {
       const visibleIds = currentVisible.map(i => i.id);
       this.visibleMenuList = this.menuList.filter(i => visibleIds.includes(i.id) || i.id === 'more');
       this.overflowNavItems = overflowItems;
       this.cdr.detectChanges();
    });
  }

  get moreDropdownItems(): MoreDropdownItem[] {
    if (this.overflowNavItems.length === 0) return this.staticMoreItems;

    const overflowItems: MoreDropdownItem[] = this.overflowNavItems.map(item => ({
      id: item.id,
      label: item.label,
      locked: false,
      isTranslationKey: true,
    }));

    return [
      { id: 'section-nav', section: 'Äiá»u hÆ°á»›ng', label: '' },
      ...overflowItems,
      ...this.staticMoreItems,
    ];
  }

  private cancelClose(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  private scheduleClose(): void {
    this.cancelClose();
    this.closeTimer = setTimeout(() => {
      this.isMoreOpen = false;
      this.cdr.detectChanges();
    }, 120);
  }

  onButtonMouseEnter(event: MouseEvent): void {
    this.cancelClose();
    const li = event.currentTarget as HTMLElement;
    // Láº¥y rect cá»§a button bÃªn trong li Ä‘á»ƒ cÄƒn tháº³ng hÃ ng chÃ­nh xÃ¡c
    const btn = li.querySelector('button') ?? li;
    const btnRect = btn.getBoundingClientRect();
    const hostRect = this.el.nativeElement.getBoundingClientRect();
    
    // TÃ­nh toáº¡ Ä‘á»™ relative so vá»›i host component (<app-sub-nav>)
    this.dropdownStyle = {
      top: `${btnRect.bottom - hostRect.top + 10}px`, // 5px gap
      left: `${btnRect.left - hostRect.left}px`,
    };
    this.isMoreOpen = true;
  }

  onButtonMouseLeave(): void {
    this.scheduleClose();
  }

  onDropdownMouseEnter(): void {
    this.cancelClose();
    this.isMoreOpen = true;
  }

  onDropdownMouseLeave(): void {
    this.scheduleClose();
  }

  openMenu(id: string): void {
    // TODO: Implement menu logic
  }
}
