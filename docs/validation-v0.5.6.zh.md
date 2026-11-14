# v0.5.6 验证记录

日期：2026-11-14。目标 DSH `0.2.2-rc.3`，官方标签 `dsh-v0.2.2-rc.3`，提交 `38a6a5c965aa99ab525161efb7cc5cf1fe62fced`。GitHub Release 发布时间 `2026-11-13T07:56:55Z`；npm 精确分发包发布时间 `2026-11-13T08:05:45.455Z`。使用独立精确标签检出及正式 npm 分发包，没有采用 master、alpha 或 npm latest 代替目标版本。

本次验证的起始发布基线为插件 v0.5.5 / DSH `0.2.1-rc.2`。本轮复用尚未发布的 v0.5.6 候选及累计变更审查结果，保留 Loader 包装 Fiber 的迁移修复、旧 Fiber 支持及兼容范围。rc.3 未发现需要新增运行时代码的契约变化，本轮实际变更为双语兼容说明及验证记录。

## 接口影响

| 插件使用面 | 累计影响及 rc.2 → rc.3 结果 |
| --- | --- |
| Cordis / Loader | 保留 `candidate.fiber?.ctx.fiber === ctx.fiber` 对包装 Fiber 的识别及旧版直接 Fiber 支持；本轮 vendor 无源码变化。 |
| schemastery / settings / configForms / configEditor | 六字段原子保存、清除、显式值优先及一次性迁移标记继续有效；相关 settings/configEditor 实现未变，仅宿主包版本更新。 |
| connection / fetch / RPC / 认证 | connection、frontend-static、webserver 相关实现未变；实际安装使用独立 loopback 认证，不改变生产安装和配置。 |
| 客户端模块加载 / locale | 包版本变化，未见实现变化；真实组件运行、侧栏和设置入口均已确认。 |
| slots / 侧栏 | 新增 `sidebar.session.action` hoc slot 包裹新会话行，调整该行布局；本插件使用的 `sidebar.footer.action` list / wide、`shell.overlay`、`plugins.bundle.config` keyed 保持。展开/折叠侧栏的番茄钟入口均实测。 |
| UI primitives | 新增 upload 图标，插件仅使用的 Toast 未变；不依赖此前移除的菜单定位接口。 |
| 插件安装器 | plugin-manager 实现未变；三版均通过正常 `dsh plugin` 路径安装 tarball，没有版本豁免。 |
| engines / peers / 客户端声明 | 保留 `^0.2.2-rc.1` 及旧范围；npm 自带 SemVer 核对接受目标 rc.3、上一 rc.2 和最低 rc.7。没有依赖升级或客户端声明变更。 |
| 新增宿主功能 | 实验性 DeepSeek 对话导入及 Windows 桌面更新修复与本插件无直接调用关系，不加入无关功能。 |

复核累计记录和升级指南；本轮精确标签间 `docs/upgrade-guide` 无差异，并阅读目标标签的 `docs/user/develop/basic/publish.zh.md`。完整影响清单保存在工作区 `.validation/rc-maintenance/0.2.2-rc.3/api-impact.json`。

## 自动化与打包

- `npm ci --ignore-scripts --legacy-peer-deps` 后执行 `npm run check`：**72 / 72 通过，0 失败、0 跳过**，包含包装 Fiber / 直接 Fiber 回归。本轮没有新增重复测试。
- `node scripts/security-scan.mjs`：0 FAIL / 0 WARN / 9 INFO；`npm audit --json`：0 vulnerabilities。
- `npm pack --dry-run`、`npm publish --dry-run` 均通过；没有本地真实 npm 发布。
- 宿主全量验证对应的打包复验产物 **44,937 字节、9 个文件**，integrity：`sha512-S8oMGUEox8+3PsKzZ2IcP3AgW9vW6ipaSevJliooKuisijDoppGwLVXt5nV6vhIwddPR+S0oB0YC3lxGMftTDQ==`。
- 发布清单仅含 LICENSE、两份 README、THIRD_PARTY_NOTICES.md、cordis.patch.yml、三个 lib 文件及 package.json，没有日志、截图、测试配置或凭据。
- macOS / Node 26.10.0 / pnpm 11.25.0；每版独立 DSH_HOME、loopback 端口。浏览器连接器当日不可用，改用本机 Chrome 的独立测试窗口，经原生界面完成操作。

## 真实宿主验证

| DSH | 本轮验证范围 | 结果 |
| --- | --- | --- |
| 0.2.2-rc.3 | 安装/加载、展开和折叠侧栏入口、六字段保存/清除、自然循环、暂停/跳过/重置、刷新/宿主重启、禁用/启用、迁移、双语主题、拖动、键盘焦点、减少动态效果下迷你切换 | 通过 |
| 0.2.2-rc.2 | 安装/加载、迁移与显式值保留、保存/清除、开始/暂停/跳过、清除后重启 | 通过 |
| 0.1.0-rc.7 | 安装/加载、侧栏面板、开始/暂停/跳过、最终包重启冒烟 | 通过 |

### 设置与迁移

目标版及上一 rc 的合成旧配置：专注 42、休息 8、自动休息 false、自动专注 true、声音与通知 false；另预置显式休息 11。两版界面均显示 **42 / 11**，旧值没有覆盖显式配置。`settings.yaml.imported` 与原 fixture 逐字节一致。

目标保存 **32 / 6、false / true / true / false** 后显示 Saved，未启动计时同步为 32:00。清除后六项恢复 **25 / 5、true / false / false / false**。上一 rc 保存专注 30 并清除通过。两版清除后重启，界面仍显示 25 / 5，番茄钟 patch 仅保留迁移标记 1，没有再次导入旧值。

原生自动化首次用 setValue 填数字框没有形成有效输入，界面正确提示整数范围；改用选中并键盘输入后保存成功。开始循环前确认已保存值并重置为 1:00；不把设置提交仍在传播时启动的旧时长计时算作一分钟验证。

### 计时、生命周期与界面

- 保存 1 / 1、自动休息及自动专注开启，真实等待专注到期，观察 **休息 0:58、完成数 1**；再等待休息到期，观察 **下一轮专注 0:56、完成数仍为 1**，未注入时钟或运行状态。
- 暂停及跳过后为休息 1:00 / 完成数 1；刷新重新打开面板后保持。禁用移除入口与面板，启用后恢复单个入口及相同暂停状态。
- 清除后休息为 5:00；最终包重装并重启后仍为暂停休息 5:00 / 完成数 1。上一版及最低版恢复暂停休息 5:00 / 完成数 0。
- 中文深色、英文浅色、拖动、键盘 Tab 到 Reset 的可见蓝色焦点环均检查并留图。语言切换不重置计时。
- Chrome Rendering 面板临时设置 `prefers-reduced-motion: reduce`，迷你/完整模式切换正常，之后恢复 No emulation。本轮未读取 computed transitionDuration，不沿用上一轮的 0s 测量结论。
- 六份宿主启动日志未检出 error / failed / exception。检查目标浏览器控制台时，发现一条来自已有翻译扩展 content.js 的 “Extension context invalidated” 错误；不能据此声称浏览器零错误，也未修改该扩展。本轮未完整采集浏览器日志。

### 最终发布物复验

完整宿主测试使用初始候选包。双语 README 更新后重新打包至独立 `final/` 路径，避免 pnpm 同路径缓存复用。核对最终包相对初始包仅两份 README 有变化，三版安装目录的 **全部 9 个文件**与最终 tarball 一致。

三版最终包均完成重启、加载、开始/暂停冒烟；目标版再次保存专注 30 并清除，恢复 25 / 5。最终暂停显示目标休息 4:54、上一版 4:55、最低版 4:56。测试窗口已关闭，临时宿主已停止。

六张本轮原始截图保存在工作区 `.validation/rc-maintenance/0.2.2-rc.3/screenshots/`：中文深色、英文浅色、拖动/焦点、目标重启、上一版和最低版最终包。本轮未改变插件 UI；截图包含本机 Chrome 工具栏，因此仅保留本地证据，不加入公开仓库及 npm 包。既有公开界面截图保留。

## 正式发布前的说明更新

中英文 README 将“候选”改为实际测试范围。重新打包结果为 44925 字节、9 个文件，integrity 为 `sha512-vzLymFHWTjjWzbpiIeOOTps4dZJAjG2WaqmNgahVGGbnfyMVfl38HfDdLqSAO+AVFrvjkWmGaDTlMxXdWWbq+w==`。逐文件比较确认仅两份 README 改变。该产物在目标、上一 rc 及最低版的隔离 profile 中重新安装，三版的 9 个安装文件均与 tarball 一致，组合配置均包含 `ui-pomodoro`。发布演练再次通过 72 项测试，安全扫描为 0 FAIL / 0 WARN。正式 npm 包的加载、设置和计时冒烟在发布后单独进行。

## 限制与发布状态

未验证系统通知授权/操作系统送达、声音实际可听性、跨机器 TLS/远程设置、安装器回滚、完整浏览器日志，以及正式 npm 发布后的独立安装。只声明表中实际验证的三版及范围。

本文记录发布前实测。正式发布结果见 [GitHub Release](https://github.com/causebefore/dsh-pomodoro/releases/tag/v0.5.6) 和 [npm 版本页](https://www.npmjs.com/package/dsh-pomodoro/v/0.5.6)。

历史候选记录在 `1cbb218`（0.2.2-rc.2）、`d907c08`（0.2.2-rc.1）、`a232d9f`（0.2.1-rc.5）、`ee95842`（0.2.1-rc.4）、`33e8906`（0.2.1-rc.3）；已发布基线见 [v0.5.5 验证记录](validation-v0.5.5.zh.md)。
