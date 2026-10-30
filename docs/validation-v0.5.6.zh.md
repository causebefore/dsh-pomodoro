# v0.5.6 验证记录

日期：2026-10-29。目标 DSH `0.2.1-rc.4`，官方标签 `dsh-v0.2.1-rc.4`，提交 `504a01a9578abc2c6f1fb896b1dc322c9fe24f66`，GitHub 发布时间 `2026-10-28T02:49:58Z`。检查范围为最近已完成发布适配的 `0.2.1-rc.2` 至目标 rc 的累计发布说明、升级指南和源码差异；上游在精确标签的独立工作树中检查。

本候选于 2026-10-24 已验证 `0.2.1-rc.3`（标签 `dsh-v0.2.1-rc.3`，提交 `1f81c047fc48fa190a683e469daa699857e9afe8`，发布时间 `2026-10-23T15:26:39Z`），因 GitHub 认证阻塞未发布。本轮沿用尚未发布的 v0.5.6，追加 rc.4 验证；两个候选 tarball 的 SHA-512 完全一致。

## 接口影响与本次变更

| 插件使用面 | 检查结果 |
| --- | --- |
| Cordis / Loader、schemastery、settings / configForms、configEditor / 旧设置迁移 | 对应实现从 rc.2 至 rc.4 无本次实质变更；保留既有注入、effect 清理、六字段原子保存和迁移行为。 |
| connection / fetch / RPC / 认证、客户端模块加载、locale | 本插件使用的接口无本次实质变更；正式宿主正常认证、加载及中英文切换通过。 |
| slots / 侧栏 | rc.3 新增 `sidebar.panellist.actions` 等“更多”菜单扩展，管理面板列表；本插件的 `sidebar.footer.action`、`shell.overlay` 和 `plugins.bundle.config` 至 rc.4 未变。底部番茄钟入口与新菜单共存，无需换用新的 slot。 |
| UI primitives / 会话界面 | rc.3 的 Menu 可选属性与 Tooltip 摆放调整不影响本插件直接使用的 Toast；rc.4 仅调整会话标签溢出提示、“更多”菜单文案及相关 locale，未改动本插件使用的 UI primitives。 |
| 插件安装器、engines.dsh / settings peer、客户端注入声明 | 现有 `^0.2.1-rc.2` 已按 SemVer 包含 `0.2.1-rc.3` 和 `0.2.1-rc.4`，最低支持范围不变；无需新增范围或豁免版本检查。正常 tarball 安装和禁用/启用通过。 |
| ACP / MCP | rc.4 发布说明修复 ACP 诊断输出污染 stdout；源码将账户日志改写 stderr，并在 MCP 服务端没有资源能力时跳过列资源请求。本插件不调用这些接口，无需适配。 |
| 升级指南、包版本 | rc.3 的新会话复用和模型目录接口未被本插件调用；rc.4 未新增升级指南，变动的 package.json 除 rc 版本替换外无其他变化。 |

本次没有修改运行时代码、依赖或 bundle patch。补丁版本用于记录新 rc 的实测结果，中英文 README 补充新“更多”菜单与番茄钟底部入口的区别，不虚构功能修复。

## 自动化与发布产物

- 2026-10-29 重新执行 `npm ci --ignore-scripts --legacy-peer-deps` 后运行 `npm run check`：70 / 70 通过，无跳过；候选沿用此前同步的版本断言，本轮未新增测试或修改运行时代码。
- `node scripts/security-scan.mjs`：0 FAIL / 0 WARN / 9 INFO。
- `npm audit --json`：0 vulnerabilities。
- `npm pack --dry-run`、`npm publish --dry-run` 均通过。9 个发布文件与白名单一致，不包含测试、验证记录、截图、日志、凭据或 DSH 配置；未执行本地真实 npm 发布。
- 候选 tarball：`dsh-pomodoro-0.5.6.tgz`，SHA-512 integrity：`sha512-WHErokH4f8ZmvITJNncmUxmMvODe7jy9/6/HjnODWd+zNgQkskoV0SfQ+U4D9J69PRUoQSydnyQJJlPRhOXPRw==`。
- profile 内 pnpm 提示缺少 Cordis/settings peer；这些共享实例按 DSH 解析机制由运行中的宿主提供。未向 profile 安装第二份宿主包，也未关闭兼容检查；三版真实加载均成功。

## 真实宿主验证

使用 npm 正式分发的 DSH、独立 DSH_HOME 和仅绑定 `127.0.0.1` 的端口，均经正常 `dsh plugin --profile web add <tarball>` 安装本轮候选包。用户生产安装与配置未改动。旧版复用此前固定的正式运行环境，但新建本轮 profile 和安装候选包。

| DSH | 本轮范围 | 结果 |
| --- | --- | --- |
| 0.2.1-rc.4 | 安装/加载、侧栏与设置、保存/清除、自然循环、暂停/跳过/重置、刷新/重启、禁用/启用、界面检查 | 通过，未验证项见下文 |
| 0.2.1-rc.3 | 安装/加载、插件详情与设置入口、保存 30 分钟、开始/暂停/跳过/重置 | 通过 |
| 0.1.0-rc.7 | 安装/加载、侧栏面板、25 分钟开始/暂停、跳过进入 5 分钟休息 | 通过 |

`0.2.1-rc.2` 于 2026-10-24 使用相同 SHA-512 的 v0.5.6 候选完成安装、设置保存 30 分钟及开始/暂停/跳过/重置冒烟，本轮未重复执行；rc.3 的完整宿主验证也于该日通过。其他 rc 本轮未重新测试，历史记录见 [v0.5.5](validation-v0.5.5.zh.md) 与更早验证文档。

### 目标宿主操作证据

- 保存六字段组合：32 / 6 分钟、自动休息关闭、自动专注开启、提示音开启、系统通知关闭；显示 Saved / 已保存，未开始的面板同步为 32 分钟。清除后恢复 25 / 5 与默认四个开关。
- 设置 1 / 1 分钟、两个自动开始选项开启；真实等待专注到期进入休息、休息到期进入下一轮专注，完成专注数为 1。未缩短系统时钟或注入计时状态。
- 暂停、跳过后为暂停休息 1:00；刷新并重新打开面板后仍为 1:00、完成数 1。
- 禁用后侧栏入口与面板消失；重新启用后仅一个入口，原暂停阶段和完成数恢复。开关异步完成后核对真实状态，未把点击回执当作成功。
- 再次清除并重置，停止并重启隔离宿主后：设置仍为 25 / 5、默认开关，面板仍为暂停休息 5:00、完成数 1。
- 中文浅色、英文深色均检查并留存截图；切换语言未重置正在运行的计时。拖动面板改变位置，Tab 聚焦 Reset 时有 `:focus-visible` 和 solid outline。
- 临时模拟 `prefers-reduced-motion: reduce` 后面板 animation 为 none，随后恢复模拟；未修改系统外观或系统辅助功能设置。
- 三个宿主页面测试期间未捕获 console error；目标宿主两次启动日志无错误。重启期间的连接断开属预期。

## 未验证项与发布状态

系统通知开启时的浏览器授权及操作系统送达、提示音实际可听性、跨机器网络/TLS、远程设置路径和旧配置迁移本轮未重新实测。通知开关在本轮 UI 保存中保持关闭；相关逻辑仍由已有自动化测试覆盖。

本记录验证的是本地候选 tarball。GitHub CLI 当前认证不可用，发布 PR、当前提交 CI、正式 Release、npm Trusted Publishing 及从 npm 正式包安装的发布后冒烟尚未执行。完成这些步骤前，不把该 rc 标记为已发布适配。恢复入口保存在工作区 `.validation/rc-maintenance/state.json`。

## 截图

- [rc.4 中文浅色](images/validation-v0.5.6-rc4-zh-light.jpg)
- [rc.4 英文深色](images/validation-v0.5.6-rc4-en-dark.jpg)
- [rc.4 重启后默认设置与暂停计时恢复](images/validation-v0.5.6-rc4-restart.jpg)
- 2026-10-24 rc.3 历史截图：[中文浅色](images/validation-v0.5.6-zh-light.png)、[英文深色](images/validation-v0.5.6-en-dark.png)
