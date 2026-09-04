import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageToolbarComponent } from './page-toolbar';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskStore } from '../../../../core/state/task.store';
import { provideTranslateService } from '@ngx-translate/core';

// Mock ResizeObserver for JSDOM
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('ResizeObserver', MockResizeObserver);

describe('PageToolbarComponent', () => {
  let component: PageToolbarComponent;
  let fixture: ComponentFixture<PageToolbarComponent>;
  let mockTaskStore: any;

  beforeEach(async () => {
    mockTaskStore = {
      selectedTask: { set: vi.fn() },
      currentProjectId: vi.fn().mockReturnValue('project-1'),
      projects: vi.fn().mockReturnValue([])
    };

    await TestBed.configureTestingModule({
      imports: [PageToolbarComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: TaskStore, useValue: mockTaskStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PageToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle search', () => {
    const event = { stopPropagation: vi.fn() } as unknown as Event;
    expect(component.isSearchOpen).toBe(false);
    
    component.toggleSearch(event);
    expect(component.isSearchOpen).toBe(true);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should close search', () => {
    vi.useFakeTimers();
    component.isSearchOpen = true;
    component.closeSearch();
    
    expect(component.isSearchClosing).toBe(true);
    vi.advanceTimersByTime(200);
    expect(component.isSearchOpen).toBe(false);
    expect(component.isSearchClosing).toBe(false);
    vi.useRealTimers();
  });

  it('should restore default fields', () => {
    const field = component.availableFields.find(f => f.id === 'created_by');
    if (field) field.checked = true;
    
    component.restoreDefaultFields();
    const fieldAfter = component.availableFields.find(f => f.id === 'created_by');
    expect(fieldAfter?.checked).toBe(false); // default is false
  });
});
