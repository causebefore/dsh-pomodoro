# v0.5.8 验证记录

2026-11-26 完成本地检查，2026-11-27 完成真实宿主界面验证。目标为 DSH `0.2.2-rc.5`，上一 rc `0.2.2-rc.4` 和最低支持 `0.1.0-rc.7` 通过冒烟。本次仅更新补丁版本、中英文兼容性说明及验证记录；功能代码、依赖、peer 范围和客户端声明保持不变。

## 上游影响审查

精确标签为 `dsh-v0.2.2-rc.5`，提交 `9c2670d3bce5275e0d1610272958121af87787bb`。GitHub 发布时间为 `2026-11-18T12:51:39Z`，npm 发布时间为 `2026-11-18T13:17:23.604Z`。

已阅读 rc.4 到 rc.5 的 Release notes、源码变更清单、相关实现及升级指南 `docs/upgrade-guide/v0.2.2-rc.4/web-search-deepseek-model-default/guide.zh.md`。433 个变更文件中的 package.json 均仅更新版本号。实现变化集中在按模型路由选择搜索提供方、可选 llmProvider 字段、搜索结果 snippet 和搜索设置页面。

番茄钟使用的 Cordis/Loader/Fiber、schemastery、settings/configForms/configEditor、connection fetch/RPC/认证、模块加载、共享 locale、UI primitives、插件安装器，以及 sidebar.footer.action、shell.overlay、plugins.bundle.config 均没有实现变化。变更中的 web.search 与番茄钟的 connection.fetch 是不同服务。现有 engines.dsh 和 settings peer 范围经正常 SemVer 检查接受目标 rc.5、上一 rc.4 和最低支持 0.1.0-rc.7，不需要版本豁免。

## 本地检查与发布物

- `npm run check`：72 项通过，0 失败、0 跳过。
- `node scripts/security-scan.mjs`：0 FAIL / 0 WARN / 9 INFO。
- `npm audit`：0 vulnerabilities。
- `npm pack --dry-run`、`npm publish --dry-run`：通过。
- 最终候选包 `dsh-pomodoro-0.5.8.tgz`：44,926 字节、9 个文件；不含测试配置、日志或凭据。
- SHA-512 integrity：`sha512-RM8k4+kynsRvGENudLtSXz8LZgEyt9XAvv7unnE61nGot37HzdA9Mzok40GuSPL5SI2eOgKAiJl+bkwwNPMevw==`。
- 三版均使用精确版本的正式 DSH npm 分发包、独立 DSH_HOME 和独立 loopback 端口，按正常 `dsh plugin --profile web add <tarball>` 路径安装。三个安装目录全部 9 个文件与最终候选包逐字节一致。

## 真实宿主界面验证

使用本机已有 Playwright 与完整 Chromium `149.0.7827.55` 的 headless 模式及独立浏览器上下文，操作真实 DSH Web 页面。没有替换插件运行时、注入假计时器或操作用户日常浏览器；这里的 headless 浏览器仍连接 `web` profile，不是 DSH headless profile。

| DSH 版本 | 通过的验证 |
|---|---|
| 0.2.2-rc.5 | 插件加载、侧栏和设置入口；六项设置保存、刷新后保留、清除；开始/暂停/跳过/重置；自然专注→休息→下一轮专注；暂停状态刷新恢复；宿主重启后设置、阶段和完成次数恢复；禁用时入口卸载、启用后恢复 |
| 0.2.2-rc.4 | 插件加载、侧栏和设置入口；专注时长保存为 30 分钟并应用，清除回 25 分钟；开始/暂停/跳过 |
| 0.1.0-rc.7 | 插件加载、侧栏入口；默认 25 分钟开始/暂停，跳过到 5 分钟休息 |

六项设置保存为专注 31 分钟、休息 7 分钟、自动休息关闭、自动专注开启、提示音开启、系统通知开启；刷新后逐项核对，再清除恢复 25/5/开启/关闭/关闭/关闭。通知权限由独立测试浏览器上下文授予，验证的是配置保存与恢复，未验证操作系统通知交付。

自然循环将专注和休息均设为 1 分钟、两种自动开始均开启，按真实时间运行。观察到专注结束自动休息、已完成次数为 1，再观察到休息结束自动进入下一轮专注且次数仍为 1。暂停后刷新保留 0:55 和完成次数；跳过后为未运行的 1:00 休息，禁用/启用及宿主重启后均恢复该状态与设置。最后清除自定义设置并验证重置和再次开始/暂停。

三版捕获的 JavaScript pageerror 均为空。目标宿主受控重启期间出现连接拒绝和流中断日志；重启后页面、配置、计时恢复正常，后续计时检查没有新的控制台错误。测试操作等待宿主异步保存/启停完成后再断言状态。

本地证据位于 `.validation/rc-maintenance/0.2.2-rc.5/`：`ui-validation.json`、`api-impact.json`、检查日志，以及 `screenshots/target-six-settings.png`、`target-natural-break.png`、`target-restored.png`、`target-restart.png`、`previous-smoke.png`、`minimum-smoke.png`。截图不随 npm 包分发。

## 限制与发布后核验

- 未验证操作系统通知的交互授权和送达、声音可听性、跨机器 TLS/远程设置、安装器回滚。
- 本次没有 UI、迁移、持久化或并发实现变化，未重跑中英文切换、深浅主题、键盘焦点、减少动态效果、拖动和旧设置迁移的人工专项回归；现有相关自动化测试包含在 72 项检查内。
- 本记录描述发布前候选验证。发布 PR 当前提交的 CI、正式 Release/tag、npm 精确版本/latest、包内容、可用来源证明及正式 npm 包独立安装冒烟，须在发布流程中另行核对，结果持久化到 `.validation/rc-maintenance/state.json`；未完成前不标记该 rc 发布完成。
