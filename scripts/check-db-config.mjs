import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '..');
const envDir = resolve(projectRoot, 'src/environments');
const siblingBackendRoot = resolve(projectRoot, '../ai-smart-kanban-backend');

function extractStringField(content, fieldName) {
  const regex = new RegExp(`${fieldName}\\s*:\\s*['"\`]([^'"\`]+)['"\`]`);
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

function extractBooleanField(content, fieldName) {
  const regex = new RegExp(`${fieldName}\\s*:\\s*(true|false)`);
  const match = content.match(regex);
  return match ? match[1] === 'true' : null;
}

function isPlaceholder(val) {
  const clean = String(val ?? '').trim().toLowerCase();
  return (
    !clean ||
    clean.includes('placeholder') ||
    clean.includes('your_project_id') ||
    clean.includes('your-project-id') ||
    clean.includes('your_supabase_anon_key')
  );
}

function extractRefFromUrl(url) {
  if (!url || isPlaceholder(url)) return null;
  const match = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co(?:\/|$)/i);
  return match ? match[1] : null;
}

function classifyKey(key) {
  const clean = String(key ?? '').trim();
  if (!clean || isPlaceholder(clean)) return { kind: 'placeholder', ref: null, role: null };
  if (clean.startsWith('sb_secret_')) return { kind: 'secret', ref: null, role: 'service_role' };
  if (clean.startsWith('sb_publishable_')) return { kind: 'publishable', ref: null, role: 'anon' };

  const parts = clean.split('.');
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      const role = payload.role ?? null;
      const ref = payload.ref ?? null;
      if (role === 'service_role') return { kind: 'service-role-jwt', ref, role };
      if (role === 'anon') return { kind: 'anon-jwt', ref, role };
      return { kind: 'unknown', ref, role };
    } catch {
      return { kind: 'unknown', ref: null, role: null };
    }
  }
  return { kind: 'unknown', ref: null, role: null };
}

function inspectEnvironmentFile(fileName, commandLabel) {
  const fullPath = resolve(envDir, fileName);
  if (!existsSync(fullPath)) {
    return { fileName, commandLabel, exists: false, errors: [`Thiếu file ${fileName}`], warnings: [] };
  }

  const content = readFileSync(fullPath, 'utf8');
  const production = extractBooleanField(content, 'production');
  const envName = extractStringField(content, 'envName') ?? (production ? 'production' : 'local');
  const apiUrl = extractStringField(content, 'apiUrl');
  const url = extractStringField(content, 'url');
  const anonKey = extractStringField(content, 'anonKey');

  const refFromUrl = extractRefFromUrl(url);
  const keyInfo = classifyKey(anonKey);

  const errors = [];
  const warnings = [];

  if (keyInfo.kind === 'secret' || keyInfo.kind === 'service-role-jwt') {
    errors.push(
      `NGUY HIỂM: Phát hiện khóa bí mật (${keyInfo.kind}) trong ${fileName}! Frontend chỉ được dùng sb_publishable_* hoặc anon JWT.`
    );
  }

  if (refFromUrl && keyInfo.ref && refFromUrl !== keyInfo.ref) {
    errors.push(`Lệch Project Ref: URL là "${refFromUrl}" nhưng JWT key là "${keyInfo.ref}".`);
  }

  if (!url || isPlaceholder(url) || keyInfo.kind === 'placeholder') {
    errors.push(`Chưa điền đủ Supabase URL hoặc Publishable/anon key trong ${fileName}.`);
  } else if (keyInfo.kind === 'unknown') {
    warnings.push(`Không nhận diện được định dạng key trong ${fileName}.`);
  }

  return {
    fileName,
    commandLabel,
    exists: true,
    production,
    envName,
    apiUrl,
    url,
    refFromUrl,
    refFromKey: keyInfo.ref,
    keyKind: keyInfo.kind,
    errors,
    warnings,
  };
}

function inspectSiblingBackend() {
  const switchPath = resolve(siblingBackendRoot, 'src/config/dbTarget.local.js');
  const envPath = resolve(siblingBackendRoot, '.env');
  if (!existsSync(switchPath) || !existsSync(envPath)) {
    return null;
  }

  const switchRaw = readFileSync(switchPath, 'utf8');
  const uncommentedLines = switchRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//'));
  const targetMatch = uncommentedLines.join('\n').match(/module\.exports\s*=\s*['"](preview|prod)['"]/);
  const backendTarget = targetMatch ? targetMatch[1] : 'invalid';

  const envRaw = readFileSync(envPath, 'utf8');
  const envMap = {};
  for (const line of envRaw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      envMap[trimmed.slice(0, eq).trim()] = trimmed
        .slice(eq + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '');
    }
  }

  const backendUrl =
    backendTarget === 'preview'
      ? envMap.SUPABASE_PREVIEW_URL
      : backendTarget === 'prod'
        ? envMap.SUPABASE_PROD_URL || envMap.SUPABASE_URL
        : null;

  return {
    target: backendTarget,
    url: backendUrl || null,
    ref: extractRefFromUrl(backendUrl),
  };
}

const checks = [
  inspectEnvironmentFile('environment.development.ts', 'npm start / npm run start:preview'),
  inspectEnvironmentFile('environment.preview.ts', 'npm run build:preview'),
  inspectEnvironmentFile('environment.prod.ts', 'npm run start:prod / npm run build'),
];

const devCheck = checks[0];
const prodCheck = checks[2];

let hasFailure = false;

console.log('\n=== KIỂM TRA CẤU HÌNH FRONTEND ANGULAR 22 (ENTERPRISE CLI) ===');

for (const item of checks) {
  console.log(`\n[${item.commandLabel}] -> src/environments/${item.fileName}`);
  if (!item.exists) {
    console.error(`  ❌ ${item.errors[0]}`);
    hasFailure = true;
    continue;
  }

  console.log(`  - envName      : ${item.envName}`);
  console.log(`  - apiUrl       : ${item.apiUrl || '(chưa có)'}`);
  console.log(`  - Supabase URL : ${item.url || '(chưa có)'}`);
  console.log(`  - Project Ref  : ${item.refFromUrl || '(chưa có)'}`);
  console.log(`  - Key Type     : ${item.keyKind}`);

  for (const err of item.errors) {
    console.error(`  ❌ ${err}`);
    hasFailure = true;
  }
  for (const warn of item.warnings) {
    console.warn(`  ⚠️  ${warn}`);
  }
  if (item.errors.length === 0) {
    console.log('  ✅ Hợp lệ & an toàn cho Frontend');
  }
}

if (
  devCheck.exists &&
  prodCheck.exists &&
  devCheck.refFromUrl &&
  prodCheck.refFromUrl &&
  devCheck.refFromUrl === prodCheck.refFromUrl
) {
  console.error(
    `\n❌ CẢNH BÁO NGHIÊM TRỌNG: environment.development.ts đang trỏ TRÙNG DB Production (${devCheck.refFromUrl})!`
  );
  hasFailure = true;
}

const backendInfo = inspectSiblingBackend();
if (backendInfo) {
  console.log('\n=== ĐỐI CHIẾU CHÉO VỚI BACKEND LOCAL (../ai-smart-kanban-backend) ===');
  console.log(`  - Backend local target : ${backendInfo.target}`);
  console.log(`  - Backend Project Ref  : ${backendInfo.ref || '(chưa có)'}`);

  if (devCheck.refFromUrl && backendInfo.ref && devCheck.refFromUrl === backendInfo.ref) {
    console.log(
      `  ✅ KHỚP 100%: Frontend (npm start) và Backend Local cùng kết nối Project "${devCheck.refFromUrl}".`
    );
  } else {
    console.warn(
      `  ⚠️  LỆCH MÔI TRƯỜNG: Frontend (npm start) đang là "${devCheck.refFromUrl || 'chưa có'}" ` +
        `nhưng Backend Local đang là "${backendInfo.ref || 'chưa có'}" (target: ${backendInfo.target}). ` +
        'Nếu gọi Backend Local sẽ gặp lỗi 401 InvalidToken!'
    );
  }
}

console.log('\n==============================================================');
if (hasFailure) {
  console.error('Trạng thái tổng thể: THẤT BẠI ❌ — Hãy xử lý các lỗi trên trước khi chạy.');
  process.exitCode = 1;
} else {
  console.log('Trạng thái tổng thể: SẴN SÀNG ✅');
}
console.log('==============================================================\n');
