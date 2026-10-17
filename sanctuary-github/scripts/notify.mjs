const bosses = [
  { name: '阿沙瓦', english: 'Ashava, The Pestilent' },
  { name: '贪食者', english: 'Avarice, The Gold-Cursed' },
  { name: '流浪死亡', english: 'Wandering Death, Death Given Life' }
];

const intervalMs = (Number(process.env.BOSS_INTERVAL_HOURS) || 3.5) * 60 * 60 * 1000;
const anchor = Date.parse(process.env.BOSS_ANCHOR || '2023-10-27T22:00:00+08:00');
if (!Number.isFinite(anchor)) throw new Error('Invalid BOSS_ANCHOR repository variable. Use an ISO time such as 2026-10-17T15:00:00+08:00.');

const now = Date.now();
const elapsed = now - anchor;
const index = elapsed < 0 ? 0 : Math.floor(elapsed / intervalMs) + 1;
const nextAt = anchor + index * intervalMs;
function bossAtIndex(value) {
  const slot = ((value % 15) + 15) % 15;
  if ([3, 4, 10, 11, 12].includes(slot)) return bosses[2];
  if ([5, 6, 7, 13, 14].includes(slot)) return bosses[1];
  return bosses[0];
}

async function post(url, payload) {
  if (!url) return '未配置';
  const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return '已发送';
}

async function pushPlus(message) {
  if (!process.env.PUSHPLUS_TOKEN) return '未配置';
  const response = await fetch('https://www.pushplus.plus/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token: process.env.PUSHPLUS_TOKEN, title: '暗黑破坏神 IV 世界 Boss 提醒', content: message, template: 'txt' })
  });
  if (!response.ok) throw new Error(`PushPlus returned HTTP ${response.status}`);
  return '已发送';
}

const targets = [30, 15];
for (const minutes of targets) {
  const remaining = nextAt - now;
  const target = minutes * 60 * 1000;
  if (remaining <= target && remaining > target - 5 * 60 * 1000) {
    const boss = bossAtIndex(index);
    const time = new Date(nextAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    const message = `暗黑破坏神 IV 世界 Boss 提醒：${boss.name}（${boss.english}）将在 ${minutes} 分钟后刷新。刷新时间：${time}`;
    const [pushplus, wecom, qq] = await Promise.all([
      pushPlus(message),
      post(process.env.WECOM_WEBHOOK, { msgtype: 'text', text: { content: message } }),
      post(process.env.QQ_WEBHOOK, { content: message, msg_type: 'text', text: message })
    ]);
    console.log(`${message} | 微信 PushPlus：${pushplus} | 企业微信：${wecom} | QQ：${qq}`);
  }
}

console.log(`next=${new Date(nextAt).toISOString()} boss=${bossAtIndex(index).name} remaining=${Math.round((nextAt - now) / 60000)}min`);
