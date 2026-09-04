import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CreateProjectModalComponent } from './create-project-modal';
import { MatDialogRef } from '@angular/material/dialog';
import { TaskStore } from '../../../../core/state/task.store';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('CreateProjectModalComponent (System)', () => {
  let component: CreateProjectModalComponent;
  let fixture: ComponentFixture<CreateProjectModalComponent>;
  let mockDialogRef: any;
  let mockTaskStore: any;

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn()
    };

    mockTaskStore = {
      createProject: vi.fn((payload, cb) => {
        if (cb) cb();
      })
    };

    await TestBed.configureTestingModule({
      imports: [CreateProjectModalComponent, FormsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: TaskStore, useValue: mockTaskStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProjectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('khởi tạo thành công', () => {
    expect(component).toBeTruthy();
  });

  it('không submit nếu tên dự án rỗng', () => {
    component.projectName = '   ';
    component.submit();
    expect(mockTaskStore.createProject).not.toHaveBeenCalled();
  });

  it('gọi taskStore.createProject và đóng modal khi submit hợp lệ', () => {
    component.projectName = 'New Project';
    component.projectDescription = 'Description';
    component.selectedColor = '#ef4444';
    component.isPublic = true;
    
    component.submit();
    
    expect(mockTaskStore.createProject).toHaveBeenCalledWith({
      name: 'New Project',
      description: 'Description',
      color: '#ef4444',
      privacy: 'public',
      project_type: 'project'
    }, expect.any(Function));
    
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
  
  it('đóng modal khi gọi close()', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
