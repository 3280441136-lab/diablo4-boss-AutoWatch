# GitHub Pages + Actions 部署

这个方案不要求电脑一直运行本地程序：GitHub Pages 展示倒计时页面，GitHub Actions 每 5 分钟检查一次下一次刷新，并调用机器人 Webhook。

## 1. 发布页面

1. 把整个目录推送到 GitHub 仓库。
2. 打开仓库的 **Settings → Pages**。
3. 在 **Build and deployment** 中选择 **Deploy from a branch**，分支选 `main`，目录选 `/ (root)`。
4. 等待 Pages 发布，访问 GitHub 提供的页面地址。

## 2. 配置计划

在 **Settings → Secrets and variables → Actions → Variables** 新建：

- `BOSS_ANCHOR`：一个已知的世界 Boss 刷新时间，例如 `2026-10-17T15:00:00+08:00`。不填时使用暗黑核当前公开规则的起点 `2023-10-27T22:00:00+08:00`。
- `BOSS_INTERVAL_HOURS`：默认 `3.5`；活动期间如果官方安排变化，直接改这个值。

## 3. 最简单的微信提醒：PushPlus

如果你只是想让自己的个人微信收到提醒，推荐使用 PushPlus，不需要企业微信机器人，也不需要自己运行 QQ 机器人：

1. 打开 [PushPlus](https://www.pushplus.plus/)，使用微信扫码登录。
2. 在个人中心找到 **Token**，复制那串字符。
3. 回到 GitHub 仓库，打开 **Settings → Secrets and variables → Actions → Secrets**。
4. 点击 **New repository secret**，名字填写 `PUSHPLUS_TOKEN`，值粘贴刚才的 Token，点击保存。

## 4. 配置企业微信或 QQ（可选）

如果你已经有机器人，再在同一页的 **Secrets** 新建：

- `WECOM_WEBHOOK`：企业微信群机器人 Webhook。
- `QQ_WEBHOOK`：QQ 机器人框架提供的 HTTP Webhook。

两个地址都可以只配置一个。Secrets 不会出现在日志中。个人微信不需要配置 `WECOM_WEBHOOK`。

## 5. 启用提醒

打开仓库的 **Actions → World Boss Reminder**，手动运行一次 `Run workflow` 检查配置。之后由 `*/5 * * * *` 定时运行，在 30 分钟和 15 分钟窗口分别发送一次。

Boss 名称和 15 场循环顺序与暗黑核公开页面的前端规则一致。GitHub Actions 的定时任务可能延迟几分钟，适合“提前半小时 / 15 分钟”的提醒，不适合秒级倒计时。页面本身只负责展示，不需要一直打开。
