import {
  EnvironmentProviders,
  InjectionToken,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { environment } from '@env/environment';
import {
  AppEnvName,
  AppEnvironment,
  EnvironmentDiagnostics,
  EnvironmentWarning,
  RawAppEnvironment,
  SupabaseKeyKind,
} from './app-environment.model';

export type FrontendConfigSecurityErrorCode = 'FORBIDDEN_SECRET_KEY' | 'REF_MISMATCH';

export class FrontendConfigSecurityError extends Error {
  constructor(
    public readonly code: FrontendConfigSecurityErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'FrontendConfigSecurityError';
  }
}

const DEFAULT_LOCAL_API_URL = 'http://localhost:3000/api';

function trimTrailingSlashes(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export function isPlaceholderValue(value: string | undefined | null): boolean {
  const clean = String(value ?? '').trim().toLowerCase();
  if (!clean) return true;
  return (
    clean.includes('placeholder') ||
    clean.includes('your_project_id') ||
    clean.includes('your-project-id') ||
    clean.includes('your_supabase_anon_key') ||
    clean.includes('your-preview-')
  );
}

export function extractProjectRefFromUrl(url: string): string | null {
  const clean = trimTrailingSlashes(url);
  if (!clean || isPlaceholderValue(clean)) return null;
  const match = clean.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co(?:\/|$)/i);
  return match ? match[1] : null;
}

function decodeBase64UrlJson(segment: string): Record<string, unknown> | null {
  try {
    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + '='.repeat(padLength);
    if (typeof globalThis.atob !== 'function') {
      return null;
    }
    const decoded = globalThis.atob(padded);
    const parsed: unknown = JSON.parse(decoded);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

export function classifyFrontendSupabaseKey(key: string): {
  kind: SupabaseKeyKind;
  ref: string | null;
  role: string | null;
} {
  const clean = String(key ?? '').trim();
  if (!clean || isPlaceholderValue(clean)) {
    return { kind: 'placeholder', ref: null, role: null };
  }

  if (clean.startsWith('sb_secret_')) {
    return { kind: 'secret', ref: null, role: 'service_role' };
  }

  if (clean.startsWith('sb_publishable_')) {
    return { kind: 'publishable', ref: null, role: 'anon' };
  }

  const parts = clean.split('.');
  if (parts.length === 3) {
    const payload = decodeBase64UrlJson(parts[1]);
    if (payload) {
      const ref = typeof payload['ref'] === 'string' ? payload['ref'] : null;
      const role = typeof payload['role'] === 'string' ? payload['role'] : null;
      if (role === 'service_role') {
        return { kind: 'service-role-jwt', ref, role };
      }
      if (role === 'anon') {
        return { kind: 'anon-jwt', ref, role };
      }
      return { kind: 'unknown', ref, role };
    }
  }

  return { kind: 'unknown', ref: null, role: null };
}

export function normalizeAppEnvironment(raw: RawAppEnvironment): AppEnvironment {
  const envName: AppEnvName = raw.envName ?? (raw.production ? 'production' : 'local');
  const apiUrl = trimTrailingSlashes(raw.apiUrl || DEFAULT_LOCAL_API_URL);

  return {
    production: Boolean(raw.production),
    envName,
    apiUrl,
    supabase: {
      url: trimTrailingSlashes(raw.supabase?.url ?? ''),
      anonKey: String(raw.supabase?.anonKey ?? '').trim(),
    },
  };
}

export function isLocalHostname(hostname?: string): boolean {
  const targetHost = (
    hostname ??
    (typeof globalThis.location !== 'undefined' ? globalThis.location.hostname : '')
  )
    .trim()
    .toLowerCase();

  return targetHost === 'localhost' || targetHost === '127.0.0.1' || targetHost === '[::1]';
}

export function inspectFrontendEnvironment(
  config: AppEnvironment,
  hostname?: string
): EnvironmentDiagnostics {
  const urlMissing = isPlaceholderValue(config.supabase.url);
  const keyInfo = classifyFrontendSupabaseKey(config.supabase.anonKey);

  if (keyInfo.kind === 'secret' || keyInfo.kind === 'service-role-jwt') {
    throw new FrontendConfigSecurityError(
      'FORBIDDEN_SECRET_KEY',
      'LỖI BẢO MẬT NGHIÊM TRỌNG: Phát hiện khóa bí mật Backend (service_role / sb_secret_*) trong cấu hình Frontend! ' +
        'Frontend chỉ được phép dùng Publishable key (sb_publishable_*) hoặc Legacy anon public key.'
    );
  }

  const refFromUrl = urlMissing ? null : extractProjectRefFromUrl(config.supabase.url);
  const refFromKey = keyInfo.ref;

  if (refFromUrl && refFromKey && refFromUrl !== refFromKey) {
    throw new FrontendConfigSecurityError(
      'REF_MISMATCH',
      `Lỗi lệch cấu hình Supabase Frontend (${config.envName.toUpperCase()}): ` +
        `URL thuộc project "${refFromUrl}" nhưng anonKey lại thuộc project "${refFromKey}".`
    );
  }

  const warnings: EnvironmentWarning[] = [];
  const isConfigured = !urlMissing && keyInfo.kind !== 'placeholder';

  if (!isConfigured) {
    warnings.push({
      code: 'PLACEHOLDER_CONFIG',
      message:
        `Môi trường "${config.envName.toUpperCase()}" đang dùng placeholder Supabase URL hoặc anonKey. ` +
        'Hãy cập nhật file src/environments/ tương ứng.',
    });
  } else if (keyInfo.kind === 'unknown') {
    warnings.push({
      code: 'UNKNOWN_KEY_FORMAT',
      message:
        'Định dạng Supabase key ở Frontend không khớp chuẩn Publishable (sb_publishable_*) hoặc Legacy JWT anon.',
    });
  }

  const isLocalProdWarning = config.envName === 'production' && isLocalHostname(hostname);

  return {
    envName: config.envName,
    production: config.production,
    apiUrl: config.apiUrl,
    supabaseUrl: config.supabase.url,
    projectRef: refFromUrl || refFromKey || null,
    refFromUrl,
    refFromKey,
    keyKind: keyInfo.kind,
    isConfigured,
    isLocalProdWarning,
    warnings,
  };
}

export function logAppEnvironmentBanner(
  diagnostics: EnvironmentDiagnostics,
  logger: Pick<Console, 'info' | 'warn'> = console
): void {
  if (
    diagnostics.envName === 'production' &&
    !diagnostics.isLocalProdWarning &&
    diagnostics.warnings.length === 0
  ) {
    return;
  }

  const envLabel = diagnostics.envName.toUpperCase();
  const refLabel = diagnostics.projectRef ?? 'chưa cấu hình';

  if (diagnostics.isLocalProdWarning) {
    logger.warn(
      `%c ⚠️ LOCALHOST ĐANG KẾT NỐI TRỰC TIẾP PRODUCTION `,
      'background:#dc2626;color:#ffffff;font-weight:700;padding:3px 8px;border-radius:4px;',
      `\nEnv: ${envLabel} | Supabase Ref: ${refLabel} | API: ${diagnostics.apiUrl}\n` +
        'Mọi thao tác sửa/xóa dữ liệu sẽ tác động trực tiếp lên dữ liệu người dùng thật!'
    );
  } else {
    logger.info(
      `%c [AppConfig] ${envLabel} `,
      'background:#059669;color:#ffffff;font-weight:700;padding:2px 6px;border-radius:4px;',
      `Supabase Ref: ${refLabel} | Key: ${diagnostics.keyKind} | API: ${diagnostics.apiUrl}`
    );
  }

  for (const warning of diagnostics.warnings) {
    logger.warn(`[AppConfig Warning - ${warning.code}] ${warning.message}`);
  }
}

export const APP_CONFIG = new InjectionToken<AppEnvironment>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => normalizeAppEnvironment(environment as RawAppEnvironment),
});

export function provideAppConfig(override?: Partial<RawAppEnvironment>): EnvironmentProviders {
  const baseEnv = environment as RawAppEnvironment;
  const mergedEnv: RawAppEnvironment = override
    ? {
        ...baseEnv,
        ...override,
        supabase: {
          ...baseEnv.supabase,
          ...(override.supabase ?? {}),
        },
      }
    : baseEnv;

  return makeEnvironmentProviders([
    {
      provide: APP_CONFIG,
      useValue: normalizeAppEnvironment(mergedEnv),
    },
    provideEnvironmentInitializer(() => {
      const config = inject(APP_CONFIG);
      const diagnostics = inspectFrontendEnvironment(config);
      logAppEnvironmentBanner(diagnostics);
    }),
  ]);
}
