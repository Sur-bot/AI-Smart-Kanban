import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideTranslateService } from '@ngx-translate/core';
import { MenuItem } from '../../core/config/menu.config';
import { TaskStore } from '../../core/state/task.store';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockTaskStore: any;

  beforeEach(async () => {
    mockTaskStore = {
      loadProjects: vi.fn(),
      projects: vi.fn().mockReturnValue([]),
      currentProjectId: vi.fn().mockReturnValue(null)
    };

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: TaskStore, useValue: mockTaskStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle collapse state', () => {
    expect(component.isCollapsed).toBe(true); // default
    const emitSpy = vi.spyOn(component.toggleSidebar, 'emit');
    
    component.onToggleCollapse();
    
    expect(component.isCollapsed).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith(false);
  });

  it('should set isOpen via input', () => {
    component.isOpen = true;
    expect(component.isCollapsed).toBe(false);
    expect(component.isOpen).toBe(true);
  });

  it('should handle hover expansion when collapsed', () => {
    component.isCollapsed = true;
    
    component.onMouseEnter();
    expect(component.isHoverExpanded).toBe(true);
    expect(component.isExpanded).toBe(true);
    
    component.onMouseLeave();
    expect(component.isHoverExpanded).toBe(false);
  });

  it('should toggle submenu', () => {
    const mockItem = { id: 'test', label: 'test', children: [{ id: 'child', label: 'child' }] } as MenuItem;
    const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as Event;
    
    component.toggleSubMenu(mockItem, event);
    expect(component.expandedMenuIds.has('test')).toBe(true);
    
    component.toggleSubMenu(mockItem, event);
    expect(component.expandedMenuIds.has('test')).toBe(false);
  });

  it('should toggle show-all items', () => {
    const event = { preventDefault: vi.fn() } as unknown as Event;
    expect(component.isOtherItemsHidden).toBe(true);
    
    component.onMenuClick({ id: 'show-all', label: 'Show All' } as MenuItem, event);
    expect(component.isOtherItemsHidden).toBe(false);
  });
});
