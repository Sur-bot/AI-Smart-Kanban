import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService } from './project.service';
import { environment } from '../../../environments/environment';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Project } from '../models/task.model';

describe('ProjectService (Integration)', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/projects`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService]
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('khởi tạo service thành công', () => {
    expect(service).toBeTruthy();
  });

  describe('getProjects', () => {
    it('gọi GET request và trả về danh sách projects', () => {
      const mockProjects: Project[] = [
        { id: 'p1', workspace_id: 'w1', name: 'Project 1', status: 'active', owner_id: 'u1', privacy: 'private', project_type: 'project', created_at: '', project_members: [], statuses: [] }
      ];

      service.getProjects().subscribe(projects => {
        expect(projects).toEqual(mockProjects);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockProjects);
    });
  });



  describe('createProject', () => {
    it('gọi POST request với payload và trả về project mới', () => {
      const payload: any = { name: 'New Project', description: 'Desc', project_type: 'project', privacy: 'private' };
      const mockProject: Project = { id: 'p2', workspace_id: 'w1', status: 'active', owner_id: 'u1', created_at: '', project_members: [], statuses: [], ...payload };
      
      service.createProject(payload).subscribe(res => {
        expect(res).toEqual(mockProject);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockProject);
    });
  });

  describe('updateProject', () => {
    it('gọi PATCH request', () => {
      const payload = { name: 'Updated' };
      const mockProject: Project = { id: 'p1', workspace_id: 'w1', name: 'Updated', status: 'active', owner_id: 'u1', privacy: 'private', project_type: 'project', created_at: '', project_members: [], statuses: [] };
      
      service.updateProject('p1', payload).subscribe(res => {
        expect(res).toEqual(mockProject);
      });

      const req = httpMock.expectOne(`${apiUrl}/p1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);
      req.flush(mockProject);
    });
  });

  describe('deleteProject', () => {
    it('gọi DELETE request', () => {
      service.deleteProject('p1').subscribe(res => {
        expect(res.success).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/p1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true });
    });
  });

  describe('addMember', () => {
    it('gọi POST request với userId và role', () => {
      service.addMember('p1', 'u2', 'member').subscribe((res: any) => {
        expect(res.role).toBe('member');
      });

      const req = httpMock.expectOne(`${apiUrl}/p1/members`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ userId: 'u2', role: 'member' });
      req.flush({ role: 'member' });
    });
  });
});
