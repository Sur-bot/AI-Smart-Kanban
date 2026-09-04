import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let mockAuthService: any;

  beforeEach(() => {
    mockAuthService = {
      accessToken: vi.fn().mockReturnValue('mock-token')
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header if token exists and is an API request', () => {
    http.get('/api/test').subscribe();
    
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush({});
  });

  it('should NOT add Authorization header if not an API request', () => {
    http.get('/assets/i18n/vi.json').subscribe();
    
    const req = httpMock.expectOne('/assets/i18n/vi.json');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
  
  it('should NOT add Authorization header if token is null', () => {
    mockAuthService.accessToken.mockReturnValue(null);
    http.get('/api/test2').subscribe();
    
    const req = httpMock.expectOne('/api/test2');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should pass through 401 error', () => {
    http.get('/api/test3').subscribe({
      next: () => {},
      error: (err: HttpErrorResponse) => {
        expect(err.status).toBe(401);
      }
    });

    const req = httpMock.expectOne('/api/test3');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });
});
