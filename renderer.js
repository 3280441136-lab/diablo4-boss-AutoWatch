let state;
let ticker;
const desktopApi = window.sanctuary;
const D2CORE_ANCHOR = Date.parse('2023-10-27T22:00:00+08:00');
const bossList = [
  { id: 'ashava', name: '阿沙瓦', english: 'Ashava, The Pestilent', tone: '毒疫' },
  { id: 'avarice', name: '贪食者', english: 'Avarice, The Gold-Cursed', tone: '贪欲' },
  { id: 'wandering-death', name: '流浪死亡', english: 'Wandering Death, Death Given Life', tone: '亡魂' }
];

const $ = (id) => document.getElementById(id);

function pad(value) { return String(value).padStart(2, '0'); }
function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}
function formatDate(value, options = {}) {
  return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit', ...options }).format(new Date(value));
}
function toLocalInput(value) {
  const date = new Date(value); const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
function bossLetter(boss) { return boss.id === 'wandering-death' ? 'W' : boss.id === 'avarice' ? 'G' : 'A'; }
function defaultWebConfig() {
  return { anchor: D2CORE_ANCHOR, intervalMs: 3.5 * 3600000, remindersEnabled: true, notify30: true, notify15: true, launchAtLogin: false, wecomWebhook: '', qqWebhook: '' };
}
function bossAtIndex(index) {
  const slot = ((index % 15) + 15) % 15;
  if ([3, 4, 10, 11, 12].includes(slot)) return bossList[2];
  if ([5, 6, 7, 13, 14].includes(slot)) return bossList[1];
  return bossList[0];
}
function calculateState(config, now = Date.now()) {
  const interval = Number(config.intervalMs) || 3.5 * 3600000;
  const anchor = Number(config.anchor) || now;
  const elapsed = now - anchor;
  const index = elapsed < 0 ? 0 : Math.floor(elapsed / interval) + 1;
  const nextAt = anchor + index * interval;
  const upcoming = { ...bossAtIndex(index), index, nextAt, interval };
  const events = Array.from({ length: 4 }, (_, offset) => ({ ...bossAtIndex(index + offset), index: index + offset, at: nextAt + offset * interval }));
  return { config, upcoming, events };
}

function render() {
  const { upcoming, events, config } = state;
  $('countdown').textContent = formatCountdown(upcoming.nextAt - Date.now());
  $('next-date').textContent = formatDate(upcoming.nextAt);
  $('boss-name').textContent = upcoming.name;
  $('boss-english').textContent = upcoming.english;
  $('boss-tone').textContent = upcoming.tone;
  $('boss-emblem').textContent = bossLetter(upcoming);
  $('art-boss').textContent = upcoming.id === 'wandering-death' ? 'WANDERING DEATH' : upcoming.id === 'avarice' ? 'AVARICE' : 'ASHAVA';
  $('art-panel').style.background = upcoming.id === 'ashava' ? 'linear-gradient(130deg,#32231d,#131b25 47%,#233a3b)' : upcoming.id === 'avarice' ? 'linear-gradient(130deg,#322b1b,#151c24 47%,#273d3b)' : 'linear-gradient(130deg,#292137,#131a25 47%,#233c40)';
  $('reminders-enabled').checked = config.remindersEnabled;
  $('notify-30').checked = config.notify30;
  $('notify-15').checked = config.notify15;
  $('launch-at-login').checked = config.launchAtLogin;
  $('wecom-webhook').value = config.wecomWebhook || '';
  $('qq-webhook').value = config.qqWebhook || '';
  $('anchor-input').value = toLocalInput(config.anchor);
  $('interval-input').value = (config.intervalMs / 3600000).toString();
  $('reminder-text').textContent = config.remindersEnabled ? '提醒已开启' : '提醒已暂停';
  const ready = Boolean(config.wecomWebhook || config.qqWebhook);
  $('webhook-badge').textContent = ready ? '已配置' : '未配置';
  $('webhook-badge').classList.toggle('ready', ready);
  $('timeline').innerHTML = events.map((event, index) => `<div class="timeline-item ${index === 0 ? 'current' : ''}"><div class="timeline-top"><span class="timeline-boss">${event.name}</span><span class="timeline-index">${index === 0 ? 'NEXT' : `+${index}`}</span></div><div class="timeline-time">${new Date(event.at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div><div class="timeline-date">${formatDate(event.at, { hour: undefined, minute: undefined })}</div></div>`).join('');
}

async function getState() {
  if (desktopApi) return desktopApi.getState();
  let config;
  try { config = { ...defaultWebConfig(), ...JSON.parse(localStorage.getItem('sanctuary-config') || '{}') }; } catch { config = defaultWebConfig(); }
  return calculateState(config);
}
async function reload() { state = await getState(); render(); }
async function save() {
  $('save-state').textContent = '保存中…';
  const nextConfig = {
    remindersEnabled: $('reminders-enabled').checked,
    notify30: $('notify-30').checked,
    notify15: $('notify-15').checked,
    launchAtLogin: $('launch-at-login').checked,
    wecomWebhook: $('wecom-webhook').value.trim(),
    qqWebhook: $('qq-webhook').value.trim(),
    anchor: new Date($('anchor-input').value).getTime(),
    intervalMs: Math.max(1, Number($('interval-input').value) || 3.5) * 3600000
  };
  state = desktopApi ? await desktopApi.saveConfig(nextConfig) : calculateState({ ...state.config, ...nextConfig });
  if (!desktopApi) localStorage.setItem('sanctuary-config', JSON.stringify(state.config));
  render(); $('save-state').textContent = '已保存 · 本机配置';
}

$('refresh-button').addEventListener('click', reload);
$('hide-button').addEventListener('click', () => desktopApi ? desktopApi.hideWindow() : window.close());
$('save-button').addEventListener('click', save);
['reminders-enabled', 'notify-30', 'notify-15', 'launch-at-login'].forEach((id) => $(id).addEventListener('change', save));
$('test-button').addEventListener('click', async () => { $('test-button').textContent = '已发送测试提醒'; if (desktopApi) await desktopApi.testNotification(); else if ('Notification' in window) { if (Notification.permission !== 'granted') await Notification.requestPermission(); if (Notification.permission === 'granted') new Notification('Sanctuary Watch 测试提醒', { body: `示例：${state.upcoming.name} 将在 15 分钟后刷新` }); } setTimeout(() => { $('test-button').textContent = '发送一条测试提醒'; }, 1800); });

reload();
ticker = setInterval(() => { if (state) { render(); if (state.upcoming.nextAt <= Date.now()) reload(); } }, 1000);
