# Sanctuary Watch

一个可部署到 GitHub Pages、也可选用 Electron 托盘模式的 Diablo IV 国际服世界 Boss 倒计时应用。

如果不希望本地常驻，请按 [GITHUB_SETUP.md](GITHUB_SETUP.md) 使用 GitHub Pages + GitHub Actions：页面负责展示，Actions 负责后台提醒。

## 运行

```powershell
npm install
npm start
```

关闭窗口按钮只会隐藏界面，主进程会继续在托盘运行并触发 30 分钟、15 分钟提醒。通过托盘菜单的“退出”才会结束后台进程。

直接用浏览器打开 `index.html` 时，页面会自动切换到网页模式，计划保存在浏览器本地；后台微信 / QQ 提醒由 GitHub Actions 工作流负责。

## 微信 / QQ

提醒层支持 PushPlus 个人微信通知，也支持企业微信群机器人 Webhook 和 QQ 机器人 HTTP Webhook。GitHub 部署时推荐使用 PushPlus，具体步骤见 [GITHUB_SETUP.md](GITHUB_SETUP.md)。

## 世界 Boss 计划

应用内置暗黑核公开页面使用的世界 Boss 轮换规则：起点为 `2023-10-27 22:00:00`，每 `3.5` 小时一次，Boss 按 15 场循环分布。首屏下方仍可以修改起点和间隔，以适配活动或地区差异。
