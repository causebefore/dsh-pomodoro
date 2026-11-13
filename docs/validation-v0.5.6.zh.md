# v0.5.6 验证记录

日期：2026-11-13。目标 DSH `0.2.2-rc.2`，官方标签 `dsh-v0.2.2-rc.2`，提交 `ddac96760b6edf8fa0fe17cbdcf0b512f4c12b2c`。GitHub Release 发布时间 `2026-11-11T11:33:06Z`，npm 正式分发发布时间 `2026-11-12T02:16:12.076Z`。此前仅有 GitHub Release，11 月 13 日确认 npm 精确版本可用后才开展宿主验证。没有把 alpha、npm latest 或 master 当作本次发布基线。

最近已发布适配基线仍为插件 v0.5.5 / DSH `0.2.1-rc.2`。此前 rc.3、rc.4、rc.5 和 `0.2.2-rc.1` 候选未发布，本轮复用 v0.5.6。已阅读累计 Release notes、升级指南及精确标签源码差异。本轮未新增运行时代码修改，保留此前候选中必要的 Loader 迁移修复及兼容范围；新增的是 rc.2 实测、双语兼容性说明和截图。

## 接口影响与变更

| 插件使用面 | 累计影响及本轮结果 |
| --- | --- |
| Cordis / Loader 生命周期 | 0.2.2-rc.1 引入 Cordis 4.1.0 / Loader 1.1.0，配置行 Fiber 变为可等待包装。候选通过 `candidate.fiber?.ctx.fiber === ctx.fiber` 定位运行实例，修复旧设置迁移找不到配置行的问题；保留旧版直接 Fiber 支持。rc.2 未进一步更改相关实现。 |
| settings / configForms / configEditor | 保留六字段原子保存、清除、显式配置优先及一次性迁移标记。rc.1 的 owner 归一化、effectiveConfig、EntryTree.commit / journal 更改不要求插件直接调用内部接口；rc.2 没有新的公开接口差异。两版实测保存、清除和重启通过。 |
| schemastery | 3.19.0 在 rc.1 至 rc.2 间未变，现有范围覆盖；保留 volatile 字段 `.get()`，不升级插件依赖。 |
| connection / fetch / RPC / 认证 | reviewed connection、frontend-static、webserver 路径未见 rc.2 相关契约变化。真实宿主采用正常 loopback 认证，未改变用户安装或认证边界。 |
| 客户端模块加载 | rc.2 隔离初始配置行创建异常，对可选未激活客户端条目发出警告而非使整个页面失败。本轮确认番茄钟组件实际运行、入口和设置存在，未把页面打开当作插件加载成功。 |
| slots / 侧栏 / locale | 新增 hoc slot、侧栏图标 factory 和滚动/固定布局；本插件使用的 `sidebar.footer.action` list / wide、`shell.overlay` 以及 `plugins.bundle.config` keyed 契约保持。侧栏入口、中英文、拖动和恢复实测通过。locale 未见相关实现差异。 |
| UI primitives | rc.2 的菜单改用 CSS anchors，移除 useAnchoredPosition / Menu.getAnchorRect；本插件仅消费 Toast，不调用被移除接口。Toast 样式使用宿主 alias，本次不引入无关菜单改造。 |
| 插件安装器 | BundleInfo 的 updatable 变为可选 update，增加 unexpected-package；插件不调用这些管理 API。三版均通过正常 `dsh plugin` 路径安装，未使用版本豁免。 |
| engines / peers / 客户端声明 | 相对 v0.5.5 增加 `^0.2.2-rc.1`，SemVer 核对覆盖 rc.2；原有范围保留。Cordis `^4.0.1` 和客户端声明继续有效。DSH 0.2.2 rc 要求 Node >=24.9.0，与插件自身要求在 README 中分别说明。 |
| 先前 0.2.1 rc 累计变化 | 侧栏“更多”、ACP/MCP 日志、资源处理和推理 text/rawText slot 差异未改变本插件所用接口，保留底部番茄钟入口说明。 |

参照目标精确标签的 `docs/user/develop/basic/publish.zh.md`、`docs/upgrade-guide/v0.2.2-alpha.2/css-anchored-menus/guide.zh.md`、`docs/upgrade-guide/v0.2.2-rc.1/plugin-update-method/guide.zh.md`，以及此前 Loader entry-tree 升级指南。指南目录名不作为发布基线。

## 自动化和打包

- `npm ci --ignore-scripts --legacy-peer-deps` 后运行 `npm run check`：**72 / 72 通过，0 失败、0 跳过**。包含旧版直接 Fiber、新版包装 Fiber 两项迁移回归；本轮没有新增与实现重复的测试。
- `node scripts/security-scan.mjs`：0 FAIL / 0 WARN / 9 INFO；`npm audit --json`：0 vulnerabilities。
- `npm pack --dry-run`、`npm publish --dry-run` 均通过，没有本地真实 npm 发布。
- 最终包 44,936 字节，9 个文件，解包大小 147,630 字节；integrity：`sha512-ZD1hDLXmW2grXEScA6B1pjeVNC5wZVwLNiDR7YE4RYTp8cdOnkv6bhHXxAfbhV2BVP7Q615mDv3kFGC5OPGIwg==`。
- 清单仅含 LICENSE、两份 README、THIRD_PARTY_NOTICES.md、cordis.patch.yml、三个 lib 文件及 package.json；没有测试配置、日志、截图、凭据或验证记录。
- 环境：macOS、Node 26.10.0、pnpm 11.25.0。目标运行时锁定官方 `@deepseek-ai/dsh@0.2.2-rc.2`，复用现有明确 allowBuilds 配置，无全局配置或生产安装变更。

## 真实宿主验证

三版均使用独立 DSH_HOME 和 loopback 端口，使用精确 npm DSH 发行包，通过 `dsh plugin --profile web add <tarball>` 安装。目标版全量测试先使用与上一候选相同的运行时代码包；更新 README 后重新打包，只改变两份 README。发现 pnpm 对同一路径 tarball 使用旧缓存后，改从 `final/` 的独立产物路径安装，逐文件核对三版安装目录全部 9 个文件与最终包一致，再完成加载/开始/暂停冒烟及目标设置保存/清除。

| DSH | 本轮范围 | 结果 |
| --- | --- | --- |
| 0.2.2-rc.2 | 安装/组件运行、侧栏与设置、六字段保存/清除、自然循环、暂停/跳过/重置、刷新/重启、禁用/启用、旧设置迁移、双语主题与交互；最终包加载/设置/计时冒烟 | 通过 |
| 0.2.2-rc.1 | 安装/加载、旧设置迁移、保存/清除、开始/暂停/跳过、清除后重启；最终包加载/计时冒烟 | 通过 |
| 0.1.0-rc.7 | 安装/加载、侧栏面板、开始/暂停/跳过；最终包加载/计时冒烟 | 通过 |

### 设置与迁移

目标版、上一 rc 的合成旧配置为专注 42 / 休息 8、自动休息 false、自动专注 true、提示音和通知 false，同时预置显式休息 11。两版 UI 读取 **42 / 11**，显式值未覆盖；原 settings 文件经宿主改名为 `settings.yaml.imported` 后，与 fixture 逐字节相同。

目标版保存 **32 / 6、false / true / true / false**，显示已保存，未开始的计时同步为 32:00；清除恢复 **25 / 5、true / false / false / false**。上一 rc 保存专注 30 并清除。两版清除后实际重启，番茄钟 patch 只保留迁移标记 1，没有旧值重新导入。最终包在目标版再次保存专注 30 并清除成功。

### 计时与界面

- 目标保存 1 / 1、自动休息和自动专注开启，真实等待专注到期、休息到期，先观察到休息 0:56 / 完成数 1，再观察到下一轮专注 0:55 / 完成数 1；未注入时钟或运行状态。
- 暂停、跳过为暂停休息 1:00；刷新后重新打开面板，阶段、剩余时间和完成数一致。
- 禁用时入口和面板均移除；重新启用后只出现一个入口，仍为暂停休息 1:00 / 完成数 1。异步开关在一次工具的即时检查中尚未翻转，随后页面确认已成功；没有重复禁用操作。
- 清除、重置后首次宿主重启恢复暂停休息 5:00 / 完成数 1；最终包重装前暂停在 4:54，重启后仍为 4:54。上一 rc 完成数 0，最低版完成数 0。最终目标清除并重置为暂停休息 5:00。
- 中文深色、英文浅色均留图；语言切换保留阶段与完成数。拖动后面板位置改变，Tab 到重置按钮显示清晰焦点环。
- 临时模拟 prefers-reduced-motion: reduce，读取匹配值 true，面板 transitionDuration 为 0s，迷你/完整切换正常；已恢复原媒体模拟状态。
- 浮动面板在拖到中央后会遮挡底层设置卡片；关闭浮层后正常展开，符合浮层交互，未修改代码。
- 三版共九份启动日志未检出错误；浏览器捕获记录无 error，17 条 warn 均为两次受控重启期间的 connection lost/retry（目标 6、上一 rc 6、最低版 5）。不将工具捕获记录解释为完整浏览器日志。
- 测试标签页已关闭，三个临时宿主已停止，三个端口均关闭。

## 未验证项与发布状态

本轮未验证系统通知授权/操作系统送达、提示音实际可听性、跨机器网络/TLS、远程设置路径和安装器回滚。正式 npm 包发布后的独立重装冒烟尚未执行。只声明本轮表中实际验证的三版；其他历史候选证据不能替代本包验证。

当前为本地 v0.5.6 候选。GitHub CLI 认证不可用；本轮尝试写入实际验证文档时，连接器再次返回 `403 Resource not accessible by integration`，未形成远端修改。尚未推送、创建发布 PR、执行发布提交必需 CI、合并 main、创建 Release 或触发 npm Trusted Publishing。具体恢复状态保存在工作区 `.validation/rc-maintenance/state.json`，恢复认证后应先重查远端事实再续跑；在发布及正式 npm 包核验完成前，不标记目标 rc 为已发布适配。

## 截图

- [中文深色](images/validation-v0.5.6-022rc2-zh-dark.png)
- [英文浅色](images/validation-v0.5.6-022rc2-en-light.png)
- [拖动与键盘焦点](images/validation-v0.5.6-022rc2-keyboard-focus.png)
- [最终包设置与计时](images/validation-v0.5.6-022rc2-restart.png)
- [上一 rc 最终包冒烟](images/validation-v0.5.6-022rc2-previous-rc1.png)
- [最低支持版最终包冒烟](images/validation-v0.5.6-022rc2-minimum-rc7.png)

历史候选记录保留于 `33e8906`（rc.3）、`ee95842`（rc.4）、`a232d9f`（rc.5）、`d907c08`（0.2.2-rc.1）；历史截图保留。已发布基线见 [v0.5.5 验证记录](validation-v0.5.5.zh.md)。
