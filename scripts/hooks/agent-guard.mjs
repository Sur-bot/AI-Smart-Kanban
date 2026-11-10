import { readFileSync } from 'node:fs';

function main() {
  let rawInput = '';
  try {
    rawInput = readFileSync(0, 'utf8');
  } catch {
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
    return;
  }

  if (!rawInput.trim()) {
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
    return;
  }

  try {
    const payload = JSON.parse(rawInput);
    const commandLine = payload?.toolCall?.args?.CommandLine ?? '';

    const forceAddSensitive =
      /git\s+add\s+.*(-f|--force)/i.test(commandLine) &&
      /(environment.*\.ts|\.env|audit-report\.md|docker-compose)/i.test(commandLine);

    if (forceAddSensitive) {
      process.stdout.write(
        JSON.stringify({
          decision: 'deny',
          reason:
            'Blocked by workspace security hook: Force-staging git-ignored environment or audit files is prohibited.',
        })
      );
      return;
    }

    const forcePushMain =
      /git\s+push\s+.*(-f|--force)/i.test(commandLine) &&
      /\b(main|master)\b/i.test(commandLine);

    if (forcePushMain) {
      process.stdout.write(
        JSON.stringify({
          decision: 'deny',
          reason:
            'Blocked by workspace security hook: Force-pushing to main branch is prohibited.',
        })
      );
      return;
    }

    process.stdout.write(JSON.stringify({ decision: 'allow' }));
  } catch {
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
  }
}

main();

