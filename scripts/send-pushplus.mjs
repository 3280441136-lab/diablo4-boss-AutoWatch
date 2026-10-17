if (!process.env.PUSHPLUS_TOKEN) throw new Error('PUSHPLUS_TOKEN is not configured.');
if (!process.env.REMINDER_MESSAGE) throw new Error('REMINDER_MESSAGE is empty.');

const response = await fetch('https://www.pushplus.plus/send', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ token: process.env.PUSHPLUS_TOKEN, title: '暗黑破坏神 IV 世界 Boss 提醒', content: process.env.REMINDER_MESSAGE, template: 'txt' })
});
if (!response.ok) throw new Error(`PushPlus HTTP ${response.status}`);
const result = await response.json();
if (Number(result.code) !== 200) throw new Error(`PushPlus rejected the message: ${JSON.stringify(result)}`);
console.log(`PushPlus sent: ${result.message || 'ok'}`);
