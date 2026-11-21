import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import {
  APP_CONFIG,
  FrontendConfigSecurityError,
  classifyFrontendSupabaseKey,
  inspectFrontendEnvironment,
  logAppEnvironmentBanner,
  normalizeAppEnvironment,
  provideAppConfig,
} from './app-config.token';

function createFakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `${header}.${body}.fake_signature`;
}

const PREVIEW_REF = 'bxejkwxsmlnobceuvhvl';
const PROD_REF = 'mnsnhzczrxtfibdntqbt';
const PREVIEW_URL = `https://${PREVIEW_REF}.supabase.co`;
const PROD_URL = `https://${PROD_REF}.supabase.co`;
const PROD_ANON_JWT = createFakeJwt({ iss: 'supabase', ref: PROD_REF, role: 'anon' });
const PROD_SERVICE_ROLE_JWT = createFakeJwt({
  iss: 'supabase',
  ref: PROD_REF,
  role: 'service_role',
});

describe('APP_CONFIG (Enterprise Angular 22 Environment Config)', () => {
  it('cung cấp APP_CONFIG và hỗ trợ override qua provideAppConfig (Happy Path)', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    TestBed.configureTestingModule({
      providers: [
        provideAppConfig({
          production: false,
          envName: 'preview',
          apiUrl: 'http://localhost:3000/api/',
          supabase: {
            url: `${PREVIEW_URL}/`,
            anonKey: 'sb_publishable_demo_preview_key',
          },
        }),
      ],
    });

    const config = TestBed.inject(APP_CONFIG);
    expect(config.envName).toBe('preview');
    expect(config.apiUrl).toBe('http://localhost:3000/api');
    expect(config.supabase.url).toBe(PREVIEW_URL);
    expect(infoSpy).toHaveBeenCalled();

    infoSpy.mockRestore();
  });

  it('nhận diện chính xác Publishable key (sb_publishable_*) và Legacy anon JWT (Happy Path)', () => {
    const publishable = classifyFrontendSupabaseKey('sb_publishable_FN4z77RrqH8DPMEGIEJJrA_test');
    expect(publishable.kind).toBe('publishable');
    expect(publishable.role).toBe('anon');

    const anonJwt = classifyFrontendSupabaseKey(PROD_ANON_JWT);
    expect(anonJwt.kind).toBe('anon-jwt');
    expect(anonJwt.ref).toBe(PROD_REF);
    expect(anonJwt.role).toBe('anon');
  });

  it('chặn fail-fast khi phát hiện sb_secret_* hoặc JWT service_role ở Frontend (Security Guard)', () => {
    const secretConfig = normalizeAppEnvironment({
      production: false,
      envName: 'preview',
      apiUrl: 'http://localhost:3000/api',
      supabase: {
        url: PREVIEW_URL,
        anonKey: 'sb_secret_NEVER_USE_IN_FRONTEND',
      },
    });

    expect(() => inspectFrontendEnvironment(secretConfig, 'localhost')).toThrowError(
      FrontendConfigSecurityError
    );

    const serviceRoleConfig = normalizeAppEnvironment({
      production: false,
      envName: 'production',
      apiUrl: 'https://ai-kanban-api.onrender.com/api',
      supabase: {
        url: PROD_URL,
        anonKey: PROD_SERVICE_ROLE_JWT,
      },
    });

    try {
      inspectFrontendEnvironment(serviceRoleConfig, 'localhost');
      expect.unreachable('Phải ném lỗi FORBIDDEN_SECRET_KEY');
    } catch (err) {
      expect(err).toBeInstanceOf(FrontendConfigSecurityError);
      expect((err as FrontendConfigSecurityError).code).toBe('FORBIDDEN_SECRET_KEY');
    }
  });

  it('chặn fail-fast khi Supabase URL lệch Project Ref so với Legacy anon JWT (Security Guard)', () => {
    const mismatchedConfig = normalizeAppEnvironment({
      production: false,
      envName: 'preview',
      apiUrl: 'http://localhost:3000/api',
      supabase: {
        url: PREVIEW_URL,
        anonKey: PROD_ANON_JWT,
      },
    });

    try {
      inspectFrontendEnvironment(mismatchedConfig, 'localhost');
      expect.unreachable('Phải ném lỗi REF_MISMATCH');
    } catch (err) {
      expect(err).toBeInstanceOf(FrontendConfigSecurityError);
      expect((err as FrontendConfigSecurityError).code).toBe('REF_MISMATCH');
    }
  });

  it('hiển thị cảnh báo đỏ khi Production chạy trên localhost và im lặng trên domain thật (Banner Policy)', () => {
    const prodConfig = normalizeAppEnvironment({
      production: true,
      envName: 'production',
      apiUrl: 'https://ai-kanban-api.onrender.com/api',
      supabase: {
        url: PROD_URL,
        anonKey: PROD_ANON_JWT,
      },
    });

    const localProdDiag = inspectFrontendEnvironment(prodConfig, 'localhost');
    expect(localProdDiag.isLocalProdWarning).toBe(true);

    const localLogger = { info: vi.fn(), warn: vi.fn() };
    logAppEnvironmentBanner(localProdDiag, localLogger);
    expect(localLogger.warn).toHaveBeenCalledTimes(1);
    expect(localLogger.info).not.toHaveBeenCalled();

    const liveProdDiag = inspectFrontendEnvironment(prodConfig, 'ai-smart-kanban.vercel.app');
    expect(liveProdDiag.isLocalProdWarning).toBe(false);

    const liveLogger = { info: vi.fn(), warn: vi.fn() };
    logAppEnvironmentBanner(liveProdDiag, liveLogger);
    expect(liveLogger.warn).not.toHaveBeenCalled();
    expect(liveLogger.info).not.toHaveBeenCalled();
  });
});
