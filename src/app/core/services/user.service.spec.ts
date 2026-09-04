import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should search users', () => {
    const dummyResult = [{ id: 'u1', name: 'User 1' }];
    service.searchUsers('test', 'w1', 5).subscribe((res: any) => {
      expect(res).toEqual(dummyResult);
    });

    const req = httpMock.expectOne(request => request.url.includes('/users/search'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('test');
    expect(req.request.params.get('workspaceId')).toBe('w1');
    expect(req.request.params.get('limit')).toBe('5');
    expect(req.request.withCredentials).toBe(true);
    req.flush(dummyResult);
  });
});
