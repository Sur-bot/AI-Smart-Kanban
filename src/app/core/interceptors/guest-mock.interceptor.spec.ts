import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { guestMockInterceptor } from './guest-mock.interceptor';
import { AuthService } from '../auth/auth.service';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { firstValueFrom } from 'rxjs';

describe('guestMockInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let mockAuthService: any;

  beforeEach(() => {
    mockAuthService = {
      isGuestMode: vi.fn().mockReturnValue(true)
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideHttpClient(withInterceptors([guestMockInterceptor])),
        provideHttpClientTesting()
      ]
    });
    
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should intercept GET /tasks in guest mode and return mock tasks', async () => {
    const responsePromise = firstValueFrom(http.get('/tasks'));
    const response: any = await responsePromise;
    expect(response.tasks).toBeDefined();
    expect(response.total).toBeGreaterThan(0);
  });

  it('should pass through if not guest mode', () => {
    mockAuthService.isGuestMode.mockReturnValue(false);
    http.get('/tasks').subscribe();
    const req = httpMock.expectOne('/tasks');
    req.flush([]);
  });

  it('should pass through if URL does not match any guest mock route', () => {
    http.get('/api/unknown').subscribe();
    const req = httpMock.expectOne('/api/unknown');
    req.flush({});
  });

  it('should intercept GET /projects', async () => {
    const responsePromise = firstValueFrom(http.get('/projects'));
    const response: any = await responsePromise;
    expect(Array.isArray(response)).toBe(true);
    expect(response[0].id).toBeDefined();
  });
  
  it('should intercept GET /projects/p1/statuses', async () => {
    const responsePromise = firstValueFrom(http.get('/projects/p1/statuses'));
    const response: any = await responsePromise;
    expect(Array.isArray(response)).toBe(true);
  });
  
  it('should intercept GET /users/me', async () => {
    const responsePromise = firstValueFrom(http.get('/users/me'));
    const response: any = await responsePromise;
    expect(response.id).toBe('user-1');
  });

  it('should intercept POST to /tasks', async () => {
    const responsePromise = firstValueFrom(http.post('/tasks', { title: 'New Task' }));
    const response: any = await responsePromise;
    expect(response.title).toBe('New Task');
    expect(response.id).toContain('mock-id-');
  });
});
