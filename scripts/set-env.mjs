import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '..');
const envDir = resolve(projectRoot, 'src/environments');

const targetFiles = [
  { path: resolve(envDir, 'environment.ts'), production: false },
  { path: resolve(envDir, 'environment.development.ts'), production: false },
  { path: resolve(envDir, 'environment.prod.ts'), production: true },
];

const isTestMode = process.argv.includes('--mode=test');
const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
const forceGenerate = process.env.FORCE_SET_ENV === 'true';

const allFilesExist = targetFiles.every((file) => existsSync(file.path));

// Preserve existing local environment files unless running on Vercel or explicitly forced
if (allFilesExist && !isVercel && !forceGenerate) {
  process.exit(0);
}

const apiUrl = process.env.API_URL?.trim();
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim();

function buildEnvContent({ production, api, url, anonKey }) {
  return `export const environment = {
  production: ${production},
  apiUrl: ${JSON.stringify(api)},
  supabase: {
    url: ${JSON.stringify(url)},
    anonKey: ${JSON.stringify(anonKey)}
  }
};
`;
}

if (isTestMode && (!apiUrl || !supabaseUrl || !supabaseAnonKey)) {
  mkdirSync(envDir, { recursive: true });
  for (const file of targetFiles) {
    if (!existsSync(file.path)) {
      writeFileSync(
        file.path,
        buildEnvContent({
          production: file.production,
          api: apiUrl || 'http://localhost:3000/api',
          url: supabaseUrl || 'https://placeholder.supabase.co',
          anonKey: supabaseAnonKey || 'placeholder-anon-key',
        }),
        'utf8'
      );
    }
  }
  process.exit(0);
}

const missingVars = [];
if (!apiUrl) missingVars.push('API_URL');
if (!supabaseUrl) missingVars.push('SUPABASE_URL');
if (!supabaseAnonKey) missingVars.push('SUPABASE_ANON_KEY');

if (missingVars.length > 0) {
  console.error(
    `[set-env] Missing environment configuration. Either keep local files in src/environments/ or set environment variables: ${missingVars.join(', ')}`
  );
  process.exit(1);
}

mkdirSync(envDir, { recursive: true });

for (const file of targetFiles) {
  if (isVercel || forceGenerate || !existsSync(file.path)) {
    writeFileSync(
      file.path,
      buildEnvContent({
        production: file.production,
        api: apiUrl,
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
      }),
      'utf8'
    );
  }
}

console.log('[set-env] Environment configuration files generated successfully.');

