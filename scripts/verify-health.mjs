import { execSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '..');

const args = new Set(process.argv.slice(2));
const installHookOnly = args.has('--install-git-hook');
const stagedOnly = args.has('--staged');

function installGitPreCommitHook() {
  const gitHooksDir = resolve(projectRoot, '.git/hooks');
  if (!existsSync(gitHooksDir)) {
    return;
  }
  const preCommitPath = resolve(gitHooksDir, 'pre-commit');
  const hookScript = `#!/bin/sh
node scripts/verify-health.mjs --staged
`;
  writeFileSync(preCommitPath, hookScript, 'utf8');
  try {
    chmodSync(preCommitPath, 0o755);
  } catch {
    // Ignore chmod notice on Windows NTFS
  }
  console.log('[verify-health] Git pre-commit guard installed at .git/hooks/pre-commit');
}

if (installHookOnly) {
  installGitPreCommitHook();
  process.exit(0);
}

// 1. Check staged files for forbidden sensitive paths (excluding deletions)
const forbiddenFilePatterns = [
  /^src\/environments\/.*\.ts$/i,
  /^\.env/i,
  /^docs\/audit-report\.md$/i,
  /^docker-compose.*\.yml$/i,
];

try {
  const stagedOutput = execSync('git diff --cached --name-only --diff-filter=d', {
    cwd: projectRoot,
    encoding: 'utf8',
  }).trim();

  if (stagedOutput) {
    const stagedFiles = stagedOutput.split(/\r?\n/).filter(Boolean);
    const violations = stagedFiles.filter((file) =>
      forbiddenFilePatterns.some((pattern) => pattern.test(file))
    );

    if (violations.length > 0) {
      console.error(
        `[verify-health] BLOCKED: Sensitive or internal files are staged for commit:\n  - ${violations.join('\n  - ')}`
      );
      process.exit(1);
    }

    // 2. Scan staged diff content for accidental hardcoded JWT tokens
    const stagedDiff = execSync('git diff --cached --diff-filter=d', {
      cwd: projectRoot,
      encoding: 'utf8',
    });

    const addedLines = stagedDiff
      .split(/\r?\n/)
      .filter((line) => line.startsWith('+') && !line.startsWith('+++'));

    const jwtPattern = /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/;
    if (addedLines.some((line) => jwtPattern.test(line))) {
      console.error(
        '[verify-health] BLOCKED: Detected hardcoded JWT token in staged changes.'
      );
      process.exit(1);
    }
  }
} catch (error) {
  console.error('[verify-health] Failed to inspect git staged state:', error.message);
  process.exit(1);
}

// 3. Ensure environment files exist before typechecking
execSync('node scripts/set-env.mjs --mode=test', {
  cwd: projectRoot,
  stdio: 'inherit',
});

// 4. Run TypeScript compiler verification (App + Spec)
try {
  execSync('npx tsc --noEmit -p tsconfig.app.json', {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  execSync('npx tsc --noEmit -p tsconfig.spec.json', {
    cwd: projectRoot,
    stdio: 'inherit',
  });
} catch {
  console.error('[verify-health] TypeScript compilation check failed.');
  process.exit(1);
}

if (!stagedOnly) {
  console.log('[verify-health] Security & TypeScript checks passed with 0 errors.');
}

