import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MemberService } from './member.service';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('MemberService', () => {
  let service: MemberService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MemberService]
    });
    service = TestBed.inject(MemberService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve members for a project', () => {
    const dummyMembers = [{ user_id: 'u1', role: 'member' }];
    service.getMembers('p1').subscribe((members: any) => {
      expect(members).toEqual(dummyMembers);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/projects/p1/members');
    expect(req.request.method).toBe('GET');
    req.flush(dummyMembers);
  });

  it('should add a member', () => {
    const payload = { userId: 'u2', role: 'admin' as const };
    service.addMember('p1', payload).subscribe((res: any) => {
      expect(res.user_id).toBe('u2');
    });

    const req = httpMock.expectOne('http://localhost:3000/api/projects/p1/members');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ user_id: 'u2', role: 'admin' });
  });

  it('should remove a member', () => {
    service.removeMember('p1', 'u2').subscribe(res => {
      expect(res.success).toBe(true);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/projects/p1/members/u2');
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('should update role', () => {
    service.updateRole('p1', 'u2', 'admin').subscribe((res: any) => {
      expect(res.role).toBe('admin');
    });

    const req = httpMock.expectOne('http://localhost:3000/api/projects/p1/members/u2/role');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ role: 'admin' });
    req.flush({ role: 'admin' });
  });

  it('should update job role', () => {
    service.updateJobRole('p1', 'u2', 'FE').subscribe((res: any) => {
      expect(res.jobRole).toBe('FE');
    });

    const req = httpMock.expectOne('http://localhost:3000/api/projects/p1/members/u2/job-role');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ jobRole: 'FE' });
    req.flush({ jobRole: 'FE' });
  });

  it('should leave project', () => {
    service.leaveProject('p1').subscribe(res => {
      expect(res.success).toBe(true);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/projects/p1/members/leave');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('should transfer ownership', () => {
    service.transferOwnership('p1', 'u3').subscribe(res => {
      expect(res.success).toBe(true);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/projects/p1/transfer-ownership');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ newOwnerUserId: 'u3' });
    req.flush({ success: true });
  });
});
