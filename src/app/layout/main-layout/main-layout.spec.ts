import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideTranslateService } from '@ngx-translate/core';
import { TaskStore } from '../../core/state/task.store';
import { RightBarService } from '../../core/services/right-bar.service';

// Mock ResizeObserver for JSDOM
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('ResizeObserver', MockResizeObserver);

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let mockTaskStore: any;
  let mockRightBarService: any;

  beforeEach(async () => {
    mockTaskStore = {
      loadProjects: vi.fn(),
      projectsLoading: vi.fn().mockReturnValue(false),
      currentProject: vi.fn().mockReturnValue(null),
      projects: vi.fn().mockReturnValue([]),
      currentProjectId: vi.fn().mockReturnValue(null)
    };
    
    mockRightBarService = {
      activeFeature: vi.fn().mockReturnValue(null),
      openFeature: vi.fn(),
      closeFeature: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: TaskStore, useValue: mockTaskStore },
        { provide: RightBarService, useValue: mockRightBarService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and call loadProjects on init', () => {
    expect(component).toBeTruthy();
    expect(mockTaskStore.loadProjects).toHaveBeenCalled();
  });

  it('should toggle sidebar', () => {
    expect(component.sidebarCollapsed).toBe(true);
    component.toggleSidebar();
    expect(component.sidebarCollapsed).toBe(false);
    
    component.toggleSidebar(true);
    expect(component.sidebarCollapsed).toBe(true);
  });

  it('should return active right bar feature', () => {
    mockRightBarService.activeFeature.mockReturnValue('chat');
    expect(component.activeRightBarFeature).toBe('chat');
  });

  it('should handle right bar open and close', () => {
    component.onRightBarFeatureClick('collab');
    expect(mockRightBarService.openFeature).toHaveBeenCalledWith('collab');
    
    component.onRightBarPopupClose();
    expect(mockRightBarService.closeFeature).toHaveBeenCalled();
  });
});
