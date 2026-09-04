import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { environment } from '../../../environments/environment';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskListResponse, TaskItem, TaskDetail, TaskFilterParams, CreateTaskPayload } from '../models/task.model';

describe('TaskService (Integration)', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/tasks`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('khởi tạo thành công', () => {
    expect(service).toBeTruthy();
  });

  describe('getTasks', () => {
    it('gọi GET request và parse HttpParams chuẩn xác (bao gồm array)', () => {
      const filters: TaskFilterParams = { 
        projectId: 'p1', 
        statusIds: ['s1', 's2'], 
        statusId: 'todo',
        priority: 'high'
      };
      
      const mockResponse: TaskListResponse = { tasks: [], total: 0, page: 1, limit: 10, totalPages: 1 };

      service.getTasks(filters).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(req => req.url === apiUrl);
      expect(req.request.method).toBe('GET');
      
      // Kiểm tra param building logic
      expect(req.request.params.get('projectId')).toBe('p1');
      expect(req.request.params.get('statusId')).toBe('todo');
      expect(req.request.params.get('priority')).toBe('high');
      expect(req.request.params.getAll('statusIds[]')).toEqual(['s1', 's2']);
      
      req.flush(mockResponse);
    });

    it('không đính kèm param nếu value null hoặc rỗng', () => {
      const filters: any = { projectId: 'p1', statusId: null, keyword: '' };
      
      service.getTasks(filters).subscribe();
      const req = httpMock.expectOne(req => req.url === apiUrl);
      
      expect(req.request.params.has('projectId')).toBe(true);
      expect(req.request.params.has('statusId')).toBe(false);
      expect(req.request.params.has('keyword')).toBe(false);
      
      req.flush({ tasks: [], total: 0, page: 1, limit: 10, totalPages: 1 });
    });
  });

  describe('createTask', () => {
    it('gọi POST request với payload', () => {
      const payload: CreateTaskPayload = { title: 'New Task', projectId: 'p1', statusId: 's1' };
      const mockTask: any = { id: 't1', ...payload };

      service.createTask(payload).subscribe(res => {
        expect(res).toEqual(mockTask);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockTask);
    });
  });

  describe('bulkMoveTasks', () => {
    it('gọi POST /bulk-move', () => {
      const moves = [{ taskId: 't1', statusId: 's2', boardColumnOrder: 1 }];
      
      service.bulkMoveTasks(moves).subscribe(res => {
        expect(res.success).toBe(true);
        expect(res.count).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/bulk-move`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ moves });
      req.flush({ success: true, count: 1 });
    });
  });

  describe('deleteTask', () => {
    it('gọi DELETE request', () => {
      service.deleteTask('t1').subscribe(res => {
        expect(res.success).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/t1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true, message: 'Deleted' });
    });
  });
});
