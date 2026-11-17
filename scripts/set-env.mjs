import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '..');
const envDir = resolve(projectRoot, 'src/environments');

/**
 * Mô hình 3 Môi trường (3-Tier Environment Architecture):
 * 1. local      : Máy trạm phát triển (localhost) -> kết nối Development Database
 * 2. preview    : PR Preview URL (Vercel Preview / CI) -> kết nối Preview/Test Database
 * 3. production : Nhánh main chính thức (Vercel Production) -> kết nối Production Database
 */
const vercelEnv = process.env.VERCEL_ENV?.trim(); // 'production' | 'preview' | 'development'
const explicitEnv = process.env.APP_ENV?.trim();
const isTestMode = process.argv.includes('--mode=test');
const isVercel = process.env.VERCEL === '1' || Boolean(vercelEnv);
const isCi = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const forceGenerate = process.env.FORCE_SET_ENV === 'true';

function resolveTargetEnvName() {
  if (explicitEnv === 'production' || vercelEnv === 'production') {
    return 'production';
  }
  if (explicitEnv === 'preview' || vercelEnv === 'preview') {
    return 'preview';
  }
  return 'local';
}

const activeEnvName = resolveTargetEnvName();

const targetFiles = [
  { path: resolve(envDir, 'environment.ts'), production: false, envName: 'local' },
  { path: resolve(envDir, 'environment.development.ts'), production: false, envName: 'local' },
  { path: resolve(envDir, 'environment.preview.ts'), production: false, envName: 'preview' },
  {
    path: resolve(envDir, 'environment.prod.ts'),
    production: true,
    envName: activeEnvName === 'preview' ? 'preview' : 'production',
  },
];

const allFilesExist = targetFiles.every((file) => existsSync(file.path));

// Giữ nguyên file cấu hình tại máy local trừ khi chạy trên Vercel hoặc ép tạo mới
if (allFilesExist && !isVercel && !forceGenerate) {
  process.exit(0);
}

function resolveEnvCredentials(envName) {
  if (envName === 'preview') {
    return {
      api: (process.env.PREVIEW_API_URL || process.env.API_URL)?.trim(),
      url: (process.env.PREVIEW_SUPABASE_URL || process.env.SUPABASE_URL)?.trim(),
      anonKey: (process.env.PREVIEW_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)?.trim(),
    };
  }
  if (envName === 'production') {
    return {
      api: (process.env.PROD_API_URL || process.env.API_URL)?.trim(),
      url: (process.env.PROD_SUPABASE_URL || process.env.SUPABASE_URL)?.trim(),
      anonKey: (process.env.PROD_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)?.trim(),
    };
  }
  return {
    api: (process.env.DEV_API_URL || process.env.API_URL)?.trim(),
    url: (process.env.DEV_SUPABASE_URL || process.env.SUPABASE_URL)?.trim(),
    anonKey: (process.env.DEV_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)?.trim(),
  };
}

function buildEnvContent({ production, envName, api, url, anonKey }) {
  return `export const environment = {
  production: ${production},
  envName: ${JSON.stringify(envName)},
  apiUrl: ${JSON.stringify(api)},
  supabase: {
    url: ${JSON.stringify(url)},
    anonKey: ${JSON.stringify(anonKey)}
  }
};
`;
}

const activeCreds = resolveEnvCredentials(activeEnvName);

if (
  (isTestMode || isCi) &&
  (!activeCreds.api || !activeCreds.url || !activeCreds.anonKey)
) {
  mkdirSync(envDir, { recursive: true });
  for (const file of targetFiles) {
    if (!existsSync(file.path) || forceGenerate) {
      writeFileSync(
        file.path,
        buildEnvContent({
          production: file.production,
          envName: file.envName,
          api: activeCreds.api || 'http://localhost:3000/api',
          url: activeCreds.url || 'https://placeholder.supabase.co',
          anonKey: activeCreds.anonKey || 'placeholder-anon-key',
        }),
        'utf8'
      );
    }
  }
  process.exit(0);
}

const missingVars = [];
if (!activeCreds.api) missingVars.push('API_URL');
if (!activeCreds.url) missingVars.push('SUPABASE_URL');
if (!activeCreds.anonKey) missingVars.push('SUPABASE_ANON_KEY');

if (missingVars.length > 0) {
  console.error(
    `[set-env] Missing environment configuration for '${activeEnvName}'. Either keep local files in src/environments/ or set environment variables: ${missingVars.join(', ')}`
  );
  process.exit(1);
}

mkdirSync(envDir, { recursive: true });

for (const file of targetFiles) {
  if (isVercel || forceGenerate || !existsSync(file.path)) {
    const creds = resolveEnvCredentials(file.envName);
    writeFileSync(
      file.path,
      buildEnvContent({
        production: file.production,
        envName: file.envName,
        api: creds.api || activeCreds.api,
        url: creds.url || activeCreds.url,
        anonKey: creds.anonKey || activeCreds.anonKey,
      }),
      'utf8'
    );
  }
}

console.log(
  `[set-env] Environment configuration files generated successfully (target: ${activeEnvName}).`
);
