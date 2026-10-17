const { spawn } = await import('node:child_process');
const check = spawn(process.execPath, ['scripts/check-reminder.mjs'], { stdio: 'inherit', env: process.env });
check.on('exit', (code) => process.exit(code ?? 1));
