const bosses = [
  { name: '阿沙瓦', english: 'Ashava, The Pestilent' },
  { name: '贪食者', english: 'Avarice, The Gold-Cursed' },
  { name: '流浪死亡', english: 'Wandering Death, Death Given Life' }
];

const intervalMs = (Number(process.env.BOSS_INTERVAL_HOURS) || 3.5) * 60 * 60 * 1000;
const anchor = Date.parse(process.env.BOSS_ANCHOR || '2023-10-27T22:00:00+08:00');
if (!Number.isFinite(anchor)) throw new Error('Invalid BOSS_ANCHOR.');

const now = Date.now();
const elapsed = now - anchor;
const index = elapsed < 0 ? 0 : Math.floor(elapsed / intervalMs) + 1;
const nextAt = anchor + index * intervalMs;
const remaining = nextAt - now;
const slot = ((index % 15) + 15) % 15;
const boss = [3, 4, 10, 11, 12].includes(slot) ? bosses[2] : [5, 6, 7, 13, 14].includes(slot) ? bosses[1] : bosses[0];

let reminderMinutes = 0;
for (const target of [30, 15]) {
  const targetMs = target * 60 * 1000;
  // GitHub cron can start late. The cache key below prevents duplicate sends.
  if (remaining <= targetMs && remaining > targetMs - 12 * 60 * 1000) {
    reminderMinutes = target;
    break;
  }
}

const time = new Date(nextAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
const message = reminderMinutes ? `暗黑破坏神 IV 世界 Boss 提醒：${boss.name}（${boss.english}）将在约 ${reminderMinutes} 分钟后刷新。刷新时间：${time}` : '';
const key = reminderMinutes ? `${nextAt}-${reminderMinutes}` : 'none';
const output = process.env.GITHUB_OUTPUT;
if (output) {
  const fs = await import('node:fs');
  fs.appendFileSync(output, `should_send=${Boolean(reminderMinutes)}\nreminder_key=${key}\n`);
  fs.appendFileSync(output, `message<<EOF\n${message}\nEOF\n`);
}
console.log(`next=${new Date(nextAt).toISOString()} boss=${boss.name} remaining=${Math.round(remaining / 60000)}min should_send=${Boolean(reminderMinutes)}`);
