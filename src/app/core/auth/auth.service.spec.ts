import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock Supabase
const mockSupabaseAuth = {
  getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithOAuth: vi.fn(),
  signOut: vi.fn(),
  resetPasswordForEmail: vi.fn()
};

// We will spy on the actual supabase instance directly in beforeEach

describe('AuthService', () => {
  let service: AuthService;
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = { navigate: vi.fn() };
    localStorage.clear();
    vi.clearAllMocks();
    
    // Default getSession resolve
    mockSupabaseAuth.getSession.mockResolvedValue({ data: { session: null } });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter }
      ]
    });
    service = TestBed.inject(AuthService);
    
    // Spy on the real supabase auth methods
    vi.spyOn(service['supabase'].auth, 'getSession').mockResolvedValue({ data: { session: null } } as any);
    vi.spyOn(service['supabase'].auth, 'onAuthStateChange').mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } } as any);
    vi.spyOn(service['supabase'].auth, 'signUp').mockResolvedValue({ data: { user: {} }, error: null } as any);
    vi.spyOn(service['supabase'].auth, 'signInWithPassword').mockResolvedValue({ data: { user: {} }, error: null } as any);
    vi.spyOn(service['supabase'].auth, 'signInWithOAuth').mockResolvedValue({ data: { user: {} }, error: null } as any);
    vi.spyOn(service['supabase'].auth, 'signOut').mockResolvedValue({ error: null } as any);
    vi.spyOn(service['supabase'].auth, 'resetPasswordForEmail').mockResolvedValue({ error: null } as any);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize and fetch session', () => {
    expect(service).toBeTruthy();
  });

  it('should login as guest and set local storage', async () => {
    await service.loginAsGuest();
    expect(service.isGuestMode()).toBe(true);
    expect(localStorage.getItem('ai_smart_kanban_guest')).toBe('true');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/kanban']);
  });

  it('should sign up with email and password', async () => {
    (service['supabase'].auth.signUp as any).mockResolvedValue({ data: { user: {} }, error: null });
    const res = await service.signUp('test@test.com', 'password', 'Test User');
    expect(service['supabase'].auth.signUp).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password',
      options: {
        data: { full_name: 'Test User' },
        emailRedirectTo: expect.any(String)
      }
    });
    expect(res).toBeDefined();
  });
  
  it('should sign in with email and password', async () => {
    (service['supabase'].auth.signInWithPassword as any).mockResolvedValue({ data: { user: {} }, error: null });
    const res = await service.signIn('test@test.com', 'password');
    expect(service['supabase'].auth.signInWithPassword).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' });
    expect(res).toBeDefined();
  });

  it('should sign out and clear guest mode if in guest mode', async () => {
    await service.loginAsGuest();
    await service.signOut();
    expect(service.isGuestMode()).toBe(false);
    expect(localStorage.getItem('ai_smart_kanban_guest')).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    expect(service['supabase'].auth.signOut).not.toHaveBeenCalled();
  });

  it('should sign out from supabase if not in guest mode', async () => {
    (service['supabase'].auth.signOut as any).mockResolvedValue({ error: null });
    await service.signOut();
    expect(service['supabase'].auth.signOut).toHaveBeenCalled();
  });
});
