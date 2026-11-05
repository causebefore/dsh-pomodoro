# v0.5.6 验证记录

日期：2026-11-05。目标 DSH `0.2.2-rc.1`，官方标签 `dsh-v0.2.2-rc.1`，提交 `66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db`。官方 Release 页面显示发布时间为 `2026-11-04 13:07 UTC`（分钟精度），npm 发布时间为 `2026-11-04T09:20:32.310Z`。已确认非 draft Release、精确标签和 npm 正式分发包；没有把 alpha、npm latest 或 master 当作本次基线。

最近已发布适配基线为插件 v0.5.5 / DSH `0.2.1-rc.2`。此前 rc.3、rc.4、rc.5 的 v0.5.6 候选因 GitHub 认证不可用未发布，本轮复用该未发布版本。已检查 rc.2 至 rc.5 的累计分析记录，以及 rc.5 至本目标的 Release notes、升级指南和精确标签源码差异。本轮有运行时代码修复，tarball 与此前候选不同；旧候选的实测结果不能直接视为本包验证结果。

## 接口影响与变更

| 插件使用面 | 本次结果与处置 |
| --- | --- |
| Cordis / Loader 生命周期 | Cordis 4.0.5 → 4.1.0、Loader 1.0.6 → 1.1.0。Loader 配置行现在保留可等待的 Fiber 包装，与 `ctx.fiber` 不再直接相等。旧实现会找不到配置行，导致旧设置迁移失败。本次通过配置行的 `fiber.ctx.fiber` 定位实际运行实例，兼容旧版直接 Fiber 和新版包装 Fiber。 |
| settings / configForms / configEditor | 上游 SettingsForms 同样将 owner 归一到 `owner.ctx.fiber`，读取 effectiveConfig；configEditor 内部改用 resolveConfig，公开 entries/edit 回调仍可用。插件保留六字段配置、宿主编辑锁、显式配置优先和一次性迁移标记。 |
| Loader 配置持久化升级 | `EntryTree.write` 改为 `commit`，Include 使用 journal/flush，配置 patch 由对应 entry tree 持有。插件不直接调用这些内部写入接口，仍使用 configEditor；新版真实保存、清除和重启回归通过。 |
| schemastery | 3.18.5 → 3.19.0，相关实现未变；现有 `^3.18.1` 已覆盖，保留 volatile 字段 `.get()` 用法。 |
| connection / fetch / RPC / 认证、模块加载 | 新增可选 resolveAsset 和资源 manifest 扩展；本插件使用既有 fetch/RPC 和内嵌 bundle，不需要采用新资源接口。未更改认证边界。 |
| locale / slots / UI primitives | 新增语言与 fallback 行为；中文、英文实测通过。`sidebar.footer.action`、`shell.overlay`、`plugins.bundle.config` 仍可用；settings.section.icon 为新增可选能力。Toast 接口未变，hover 样式增加设备条件；本次无客户端布局或样式修改。 |
| 插件安装器 / 运行环境 | 上游新增插件 README/详情及更新、回滚与平台校验能力。三版宿主正常 tarball 安装均通过；不使用版本豁免。DSH 0.2.2 rc 宿主要求 Node >=24.9.0，已在中英文 README 区分宿主与插件自身的 Node 要求。 |
| engines / peers / 客户端声明 | engines.dsh 和 settings peer 增加 `^0.2.2-rc.1`，保留原有范围；Cordis `^4.0.1` 已覆盖 4.1.0。客户端声明无需改变，没有升级插件依赖。 |
| 累计 rc.3 / rc.4 / rc.5 变化 | rc.3 侧栏“更多”菜单、rc.4 ACP/MCP 日志与资源处理、rc.5 推理内容 slot 的 text/rawText 变化均未改变本插件使用的契约；保留中英文 README 的底部番茄钟入口说明。 |

参考精确标签中的 `docs/user/develop/basic/publish.zh.md`、`docs/upgrade-guide/v0.2.2-alpha.2/cordis-loader-entry-trees/guide.zh.md` 和 `docs/upgrade-guide/v0.2.1-rc.2/node-24/guide.zh.md`。指南目录名称不等同于实际发布基线。本次仅修复迁移实例定位、更新兼容范围与验证资料，没有无关重构。

## 自动化与发布产物

- `npm ci --ignore-scripts --legacy-peer-deps` 后执行 `npm run check`：**72 / 72 通过，0 失败，0 跳过**。
- 新增旧版直接 Fiber、新版包装 Fiber 两项迁移回归：使用临时旧配置文件，混入无关配置行，验证正确定位、显式配置优先、完成标记及原文件保留。修复前新版包装用例失败并出现“找不到番茄钟配置行”，修复后通过。
- `node scripts/security-scan.mjs`：0 FAIL / 0 WARN / 9 INFO；`npm audit --json`：0 vulnerabilities。
- `npm pack --dry-run`、`npm publish --dry-run` 均通过；未执行本地真实 npm 发布。
- 本轮候选 `dsh-pomodoro-0.5.6.tgz`：44,865 字节，9 个文件，解包大小 147,425 字节。SHA-512 integrity：`sha512-Txrgj4pWJMXxDNGEvd1FJxdmbN/LQRYjlzZnWzfV+aB43QeUHHkE2LiQEhNICv2lVbxR5q5Us6I+td2Z9qbHjg==`。
- 发布清单只包含 LICENSE、两份 README、THIRD_PARTY_NOTICES.md、cordis.patch.yml、三个 lib 文件及 package.json；不包含测试、截图、验证记录、日志、凭据或宿主配置。
- 验证环境：macOS、Node 26.10.0、pnpm 11.25.0。新宿主首次安装因 pnpm 构建脚本白名单要求退出，使用此前隔离运行环境相同的明确 allowBuilds 后安装通过；没有修改全局配置。

## 真实宿主验证

本轮三版均使用 npm 正式分发的精确 DSH 版本、全新独立 DSH_HOME、仅绑定 `127.0.0.1` 的端口，按正常 `dsh plugin --profile web add <tarball>` 安装上述同一候选包。旧版复用固定运行时，新建 profile。用户生产安装和配置未改动。

| DSH | 本轮范围 | 结果 |
| --- | --- | --- |
| 0.2.2-rc.1 | 安装/加载、侧栏与设置、六字段保存/清除、自然循环、暂停/跳过/重置、刷新/重启、禁用/启用、旧设置迁移、界面交互 | 通过，限制见下文 |
| 0.2.1-rc.5 | 安装/加载、设置保存/清除、开始/暂停/跳过、旧设置迁移与清除后重启 | 通过 |
| 0.1.0-rc.7 | 安装/加载、侧栏面板、开始/暂停、跳过至休息 | 通过 |

### 迁移与重启

目标版和上一 rc 均放入合成旧设置：专注 42、休息 8、自动休息关闭、自动专注开启、提示音和系统通知关闭；同时预置显式休息 11。启动后 UI 与 profile 均为 **42 / 11**，迁移完成标记为 1，显式值未被覆盖。宿主将旧文件重命名为 `settings.yaml.imported`，核对其字节与原始 fixture 相同。

随后通过 UI 保存、清除，并真实停止/重启宿主。两版番茄钟 patch 都只保留迁移标记，设置恢复 25 / 5 与默认开关，未再次导入旧值。目标版重启后仍为暂停休息 5:00、完成数 1；上一 rc 仍为暂停休息 5:00、完成数 0。最低版不使用本次修改的现代迁移分支。

### 目标宿主操作

- 六字段保存组合为 32 / 6、自动休息关闭、自动专注开启、提示音开启、系统通知关闭；显示已保存，面板同步 32 分钟。清除恢复 25 / 5、true / false / false / false。
- 保存 1 / 1、两个自动开始选项开启，真实等待专注到期进入休息、休息到期进入下一轮专注，完成专注数为 1。未注入时钟或计时状态；观察到休息 0:46 和随后专注 0:55。
- 暂停、跳过至暂停休息 1:00；刷新重新打开面板后阶段、剩余时间和完成数保持。
- 禁用后侧栏入口与面板消失；启用后恢复且只出现一个入口，原暂停状态和完成数保持。
- 清除设置、重置并重启，确认恢复默认设置且没有重复迁移。
- 中文深色、英文浅色均检查并留存截图；切换语言时计时继续。拖动面板后位置改变；Tab 聚焦 Reset 时显示清晰蓝色焦点环。
- 通过 Chrome DevTools Rendering 临时将 prefers-reduced-motion 设为 reduce，确认选择值并验证迷你/完整面板切换可用，之后恢复 No emulation。未修改系统辅助功能设置；本轮未取得计算后的 transitionDuration 数值，不声称该数值已验证。
- 三版共五次启动日志均未见错误。测试结束关闭任务标签页并停止全部三个隔离宿主，确认端口关闭。

## 未验证项与发布状态

系统通知开启时的浏览器授权与操作系统送达、提示音实际可听性、跨机器网络/TLS、远程设置路径，以及安装器新回滚功能本轮未实测。没有持续采集整轮浏览器 console；不声明零前端错误。其他 rc 的旧候选验证见历史提交，本轮新包仅声明上表三个已实测版本。

本记录对应本地候选包。GitHub CLI 认证仍不可用；已连接的 GitHub 工具可读，但写入 blob 返回 `403 Resource not accessible by integration`，未形成远端修改。尚未推送、创建发布 PR、执行该提交的必需 CI、合并 main、创建正式 Release 或触发 npm Trusted Publishing；从 npm 正式包重新安装的发布后冒烟亦未执行。恢复入口与发布草稿保存在工作区 `.validation/rc-maintenance/state.json`。完成完整发布核验前，不把目标 rc 标记为已发布适配。

## 截图

截图裁去浏览器工具栏，仅展示隔离验证页面。

- [目标版中文深色](images/validation-v0.5.6-022rc1-zh-dark.jpg)
- [目标版英文浅色](images/validation-v0.5.6-022rc1-en-light.jpg)
- [目标版重启恢复](images/validation-v0.5.6-022rc1-restart.jpg)
- [键盘焦点](images/validation-v0.5.6-022rc1-keyboard-focus.jpg)
- [上一 rc 重启恢复](images/validation-v0.5.6-022rc1-previous-rc5.jpg)
- [最低支持 rc 冒烟](images/validation-v0.5.6-022rc1-minimum-rc7.jpg)

历史候选记录保留在 Git 提交 `33e8906`（2026-10-24，rc.3）、`ee95842`（2026-10-29，rc.4）、`a232d9f`（2026-10-31，rc.5）；对应历史截图继续保留。已发布 v0.5.5 的基线验证见 [v0.5.5](validation-v0.5.5.zh.md)。
