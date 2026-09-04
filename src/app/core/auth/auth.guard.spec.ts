import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Auth Guards', () => {
  let mockRouter: any;
  let mockAuthService: any;
  
  beforeEach(() => {
    mockRouter = {
      createUrlTree: vi.fn((paths) => `UrlTree: ${paths.join('/')}`)
    };
    
    mockAuthService = {
      loading: vi.fn().mockReturnValue(false),
      isAuthenticated: vi.fn().mockReturnValue(false)
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService }
      ]
    });
  });

  describe('authGuard', () => {
    it('should return true if authenticated (synchronous)', () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should return UrlTree to /login if not authenticated (synchronous)', () => {
      mockAuthService.isAuthenticated.mockReturnValue(false);
      const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      expect(result).toBe('UrlTree: /login');
    });

    it('should wait if loading and return true if authenticated (asynchronous)', async () => {
      mockAuthService.loading.mockReturnValue(true);
      mockAuthService.isAuthenticated.mockReturnValue(true);
      
      const promise = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)) as Promise<boolean>;
      
      // Simulate loading finished
      setTimeout(() => {
        mockAuthService.loading.mockReturnValue(false);
      }, 50);
      
      const result = await promise;
      expect(result).toBe(true);
    });
  });

  describe('guestGuard', () => {
    it('should return true if NOT authenticated (synchronous)', () => {
      mockAuthService.isAuthenticated.mockReturnValue(false);
      const result = TestBed.runInInjectionContext(() => guestGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should return UrlTree to /kanban if authenticated (synchronous)', () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      const result = TestBed.runInInjectionContext(() => guestGuard({} as any, {} as any));
      expect(result).toBe('UrlTree: /kanban');
    });
  });
});
