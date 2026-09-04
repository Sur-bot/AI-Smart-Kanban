import { TestBed } from '@angular/core/testing';
import { PreferencesService } from './preferences.service';
import { AuthService } from '../auth/auth.service';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('PreferencesService', () => {
  let service: PreferencesService;
  let mockAuthService: any;
  let mockSupabase: any;

  beforeEach(() => {
    vi.useFakeTimers();
    mockSupabase = {
      auth: {
        updateUser: vi.fn().mockResolvedValue({ error: null })
      }
    };

    mockAuthService = {
      getClient: vi.fn().mockReturnValue(mockSupabase),
      user: vi.fn().mockReturnValue(null),
      isGuestMode: vi.fn().mockReturnValue(false)
    };

    TestBed.configureTestingModule({
      providers: [
        PreferencesService,
        { provide: AuthService, useValue: mockAuthService }
      ]
    });
    
    localStorage.clear();
    service = TestBed.inject(PreferencesService);
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should load preferences from user metadata', () => {
    mockAuthService.user.mockReturnValue({
      user_metadata: { preferences: { 'test-context': { columns: [] } } }
    });
    const prefs = service.loadPreferences();
    expect(prefs['test-context']).toBeDefined();
    expect(service.preferences()).toEqual(prefs);
  });

  it('should return empty object if no user metadata', () => {
    mockAuthService.user.mockReturnValue(null);
    expect(service.loadPreferences()).toEqual({});
  });

  it('should save column widths to localStorage if in guest mode', async () => {
    mockAuthService.isGuestMode.mockReturnValue(true);
    await service.saveColumnWidths('test', [{ id: 'col1', width: 200 }]);
    
    const saved = JSON.parse(localStorage.getItem('guest_preferences') || '{}');
    expect(saved['test'].columns[0].width).toBe(200);
  });

  it('should return column widths from localStorage in guest mode', () => {
    mockAuthService.isGuestMode.mockReturnValue(true);
    localStorage.setItem('guest_preferences', JSON.stringify({ 'test': { columns: [{ id: 'col1', width: 300 }] } }));
    
    const widths = service.getColumnWidths('test');
    expect(widths?.[0].width).toBe(300);
  });

  it('should get column widths from user metadata if NOT guest mode', () => {
    mockAuthService.isGuestMode.mockReturnValue(false);
    mockAuthService.user.mockReturnValue({
      user_metadata: { preferences: { 'test': { columns: [{ id: 'col1', width: 400 }] } } }
    });
    
    const widths = service.getColumnWidths('test');
    expect(widths?.[0].width).toBe(400);
  });

  it('should debounce and save preferences to supabase', async () => {
    mockAuthService.isGuestMode.mockReturnValue(false);
    await service.saveColumnWidths('test', [{ id: 'col1', width: 200 }]);
    
    // Fast-forward time for debounce
    vi.advanceTimersByTime(1500);
    
    // Allow promises to resolve
    await Promise.resolve();
    
    expect(mockSupabase.auth.updateUser).toHaveBeenCalled();
  });
});
