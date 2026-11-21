export type AppEnvName = 'local' | 'preview' | 'production';

export type SupabaseKeyKind =
  | 'anon-jwt'
  | 'publishable'
  | 'secret'
  | 'service-role-jwt'
  | 'placeholder'
  | 'unknown';

export interface SupabasePublicConfig {
  readonly url: string;
  readonly anonKey: string;
}

export interface AppEnvironment {
  readonly production: boolean;
  readonly envName: AppEnvName;
  readonly apiUrl: string;
  readonly supabase: SupabasePublicConfig;
}

export interface RawAppEnvironment {
  readonly production: boolean;
  readonly envName?: AppEnvName;
  readonly apiUrl?: string;
  readonly supabase: {
    readonly url: string;
    readonly anonKey: string;
  };
}

export type EnvironmentWarningCode = 'PLACEHOLDER_CONFIG' | 'UNKNOWN_KEY_FORMAT';

export interface EnvironmentWarning {
  readonly code: EnvironmentWarningCode;
  readonly message: string;
}

export interface EnvironmentDiagnostics {
  readonly envName: AppEnvName;
  readonly production: boolean;
  readonly apiUrl: string;
  readonly supabaseUrl: string;
  readonly projectRef: string | null;
  readonly refFromUrl: string | null;
  readonly refFromKey: string | null;
  readonly keyKind: SupabaseKeyKind;
  readonly isConfigured: boolean;
  readonly isLocalProdWarning: boolean;
  readonly warnings: readonly EnvironmentWarning[];
}
