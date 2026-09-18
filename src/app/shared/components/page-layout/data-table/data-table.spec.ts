import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskStore } from '../../../../core/state/task.store';
import { PermissionService } from '../../../../core/services/permission.service';
import { TaskItem } from '../../../../core/models/task.model';
import { provideTranslateService } from '@ngx-translate/core';

describe('DataTableComponent', () => {
  let component: DataTableComponent;
  let fixture: ComponentFixture<DataTableComponent>;
  let mockTaskStore: any;
  let mockPermissionService: any;

  beforeEach(async () => {
    mockTaskStore = {
      updateTask: vi.fn()
    };
    
    mockPermissionService = {};

    await TestBed.configureTestingModule({
      imports: [DataTableComponent],
      providers: [
        provideTranslateService(),
        { provide: TaskStore, useValue: mockTaskStore },
        { provide: PermissionService, useValue: mockPermissionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle pin task', () => {
    const event = { stopPropagation: vi.fn() } as unknown as MouseEvent;
    const task: TaskItem = { id: 't1', title: 'Task 1' } as TaskItem;
    
    component.togglePinItem(task, event);
    expect(component.pinnedItemIds.has('t1')).toBe(true);
    
    component.togglePinItem(task, event);
    expect(component.pinnedItemIds.has('t1')).toBe(false);
  });

  it('should toggle sort column', () => {
    const event = { stopPropagation: vi.fn() } as unknown as MouseEvent;
    component.toggleSortColumn('name', event);
    expect(component.sortColumnId).toBe('name');
    expect(component.sortDirection).toBe('asc');
    
    component.toggleSortColumn('name', event);
    expect(component.sortDirection).toBe('desc');
    
    component.toggleSortColumn('name', event);
    expect(component.sortDirection).toBe('none');
    expect(component.sortColumnId).toBe('');
  });

  it('should emit itemSelected on title click', () => {
    const event = { stopPropagation: vi.fn() } as unknown as MouseEvent;
    const emitSpy = vi.spyOn(component.itemSelected, 'emit');
    const task: TaskItem = { id: 't1', title: 'Task 1' } as TaskItem;
    
    component.onTitleClick(task, event);
    expect(emitSpy).toHaveBeenCalledWith(task);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should toggle row selection', () => {
    const task: TaskItem = { id: 't1', title: 'Task 1' } as TaskItem;
    
    component.toggleRowSelection(task);
    expect(component.selectedIds.has('t1')).toBe(true);
    
    component.toggleRowSelection(task);
    expect(component.selectedIds.has('t1')).toBe(false);
  });
});
