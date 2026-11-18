# v0.5.7 验证记录

验证日期为 2026-11-18，起始基线为插件 v0.5.6 / DSH 0.2.2-rc.3。目标为官方 DSH 0.2.2-rc.4，精确标签 dsh-v0.2.2-rc.4，提交 3f321d32bfe382212a8ed8785c1d47a5a300aa23。GitHub 发布时间为 2026-11-17T17:53:41Z，npm 发布时间为 2026-11-17T17:03:03.170Z。

## 上游影响审查

阅读了 rc.3 到 rc.4 的完整源码差异、Release notes 和新增升级指南 docs/upgrade-guide/v0.2.2-rc.3/deepseek-refusal-code/guide.zh.md，并按目标标签中的 docs/user/develop/basic/publish.zh.md 安装实际插件 tarball。

| 插件使用的接口 | 审查结果 |
| --- | --- |
| Cordis / Loader 生命周期与 Fiber | 实现没有变化，沿用现有迁移逻辑。 |
| schemastery、settings/configForms、configEditor | 实现没有变化，保留六字段保存和清除逻辑。 |
| connection fetch / RPC / 认证 | 实现没有变化，继续使用宿主连接和 loopback 限制。 |
| 客户端模块加载、locale、UI primitives | 实现没有变化，客户端注入声明适用。 |
| sidebar.footer.action、shell.overlay、plugins.bundle.config | 插件使用的 slot 没有变化。 |
| 插件安装器与包声明 | 所有变更的 package.json 均仅改版本号。SemVer 核验现有 engines.dsh 和 settings peer 范围接受目标、上一 rc 和最低支持版。 |

新增 CONTENT_REFUSED 错误码用于模型流拒答处理，LiveShare 修改用于 Electron 子进程的 Node 模式。番茄钟没有调用这些接口，本次发布更新兼容性说明、补丁版本及现有版本断言，功能代码沿用 v0.5.6。

## 自动化和发布物

- npm run check 通过 72 项测试，0 失败、0 跳过。第一次检查提示版本断言仍为 0.5.6，随补丁版本更新为 0.5.7 后全量通过。
- node scripts/security-scan.mjs 结果为 0 FAIL / 0 WARN / 9 INFO，npm audit 报告 0 vulnerabilities。
- npm pack --dry-run 和 npm publish --dry-run 均通过。
- 实测 tarball 为 44926 字节、9 个文件，integrity 为 sha512-nd33wbvAcO6OW0pjlA71RkqdwUAV6utIbjDrhOZOT09wfYDTDoPECIgBq2mm0fdDOEC53G9g3rgoq10znN0nNw==。
- 三版均通过正常 dsh plugin --profile web add 路径安装该 tarball，安装目录的全部文件与 tarball 逐字节一致。
- 发布文件为 LICENSE、两份 README、THIRD_PARTY_NOTICES.md、cordis.patch.yml、三个 lib 文件和 package.json。测试、配置、日志与截图保存在独立验证目录。

## 真实宿主验证

三版分别使用独立 DSH_HOME、官方精确版本分发包和独立 loopback 端口，在 Chrome 中操作。

| DSH | 本轮范围 | 结果 |
| --- | --- | --- |
| 0.2.2-rc.4 | 安装/加载、侧栏和设置入口、六字段保存/清除、开始/暂停/跳过、自然循环、刷新与宿主重启恢复、禁用/启用 | 通过 |
| 0.2.2-rc.3 | 安装/加载、设置保存/清除、开始/暂停/跳过 | 通过 |
| 0.1.0-rc.7 | 安装/加载、侧栏面板、开始/暂停/跳过 | 通过 |

目标六字段保存为 31 / 7、自动休息 false、自动专注 true、声音 true、通知 false，界面显示已保存，计时器同步到 31:00。清除后恢复 25 / 5、true / false / false / false。通知关闭状态经过保存与清除验证，系统通知授权和送达未测。

将专注与休息均设为一分钟并开启两项自动开始后，实际等待自然到期。先观察到休息 0:50、完成数 1，再观察到下一轮专注 0:34、完成数仍为 1。没有注入时钟或计时状态。暂停后为专注 0:21，跳过后为休息 1:00。刷新、禁用后重新启用、重启宿主后均恢复休息 1:00 / 完成数 1，重启后的设置仍为 1 / 1、true / true / false / false。再次清除恢复六项默认值。

上一 rc 保存专注 30 后清除为 25，计时暂停于 24:46，跳过为休息 5:00。最低支持版计时暂停于 24:50，跳过为休息 5:00。目标浏览器捕获的 error 日志为 0 条。禁用操作的同步控件断言早于异步响应，随后读取界面确认开关已关闭、入口已移除，重新启用后正常恢复。

本次没有修改 UI、持久化或迁移实现。截图保存在工作区 .validation/rc-maintenance/0.2.2-rc.4/screenshots/，详细操作证据在 ui-validation.json，接口影响清单在 api-impact.json。

## 限制

系统通知授权与送达、声音实际可听性、跨机器 TLS/远程设置和安装器回滚未验证。本次没有重新检查中英文主题、键盘焦点、减少动态效果及拖动，既有检查见 v0.5.6 验证记录。

本文记录发布前验证。正式 npm 包的独立安装、设置和计时冒烟将在发布后记录于维护状态。发布结果见 [GitHub Release](https://github.com/causebefore/dsh-pomodoro/releases/tag/v0.5.7) 和 [npm 版本](https://www.npmjs.com/package/dsh-pomodoro/v/0.5.7)。
