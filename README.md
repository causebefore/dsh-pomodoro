# dsh-pomodoro（番茄钟面板 · 常驻插件）

25 分钟专注 / 5 分钟休息的番茄钟，注册为 DeepSeek Harness web profile 的常驻客户端插件：
侧栏底部 🍅 按钮开关面板，右下角浮动面板（进度环、开始/暂停/重置/跳过、拖动、阶段切换面板内视觉提示）。

## 结构

- `lib/index.js` —— Node 半边：schemastery `Config` schema 校验行配置；
  经 `ctx.connection.rpc.handle("/pomodoro", …)` 始终把有效值暴露给浏览器半边；
  settings 服务存在时，由依赖子 fiber 注册域名空间 `dsh-pomodoro`（三层解析 + settings.yaml 持久化），
  缺席时退回行配置而不影响番茄钟主体启动
- `lib/client.js` —— 浏览器半边（手写构建产物，`window.__ModuleLoader__.load` 格式），
  经 `exports["./client"]` + `dsh.client` 声明被客户端模块系统发现；
  经包私有 `/pomodoro` RPC 读取、保存并订阅设置，实时热更新计时引擎；
  注册侧栏开关、浮动面板、设置页三个挂载点
- `cordis.patch.yml` —— 组合补丁层（随包分发）：只注册 `ui-pomodoro` 行，不重复保存默认值
- `debug.html` —— **独立调试台**：不依赖 DSH，伪造 `__ModuleLoader__`/`ctx`/`slots`/
  `connection`，浏览器直接打开即可调试 UI、计时与配置链路
- `vendor/` —— 调试台用的 React/ReactDOM 18 UMD（本地化，离线可用）

## 设置

普通用户只使用 DSH 的「设置 → 番茄钟」页面；其持久化文件是
`$DSH_HOME/settings.yaml` 的 `dsh-pomodoro:` 分节。无需修改 profile 的
`cordis.patch.yml`，包内 `cordis.patch.yml` 也只负责启用插件。

生产默认值只定义在 `lib/index.js` 的 `Config` schema：

- 专注时长：25 分钟
- 休息时长：5 分钟
- 自动开始休息：开启
- 自动开始下一轮专注：关闭

未自定义时，用户分节可以为空：

```yaml
dsh-pomodoro: {}
```

这表示继承 `Config` schema 默认值，并非配置缺失。设置页点击「保存」后，四个用户覆盖字段会写入该分节；
点击「清除自定义设置」会调用 settings 的 `replace({})`，重新继承插件默认值。

运行时链路：`Config` schema 默认值 → `settings.yaml` 用户覆盖 → `/pomodoro` RPC
→ 浏览器计时引擎。未开始且未改动的阶段会立即采用新值，进行中的阶段从下一阶段起采用。
若组合没有 settings 域，父插件仍会启动并使用 schema 默认值，设置页显示只读降级说明。

默认行为：专注结束后自动开始休息；休息结束后停在下一轮专注的待开始状态；
手动点击「跳过」只切换阶段，下一阶段始终等待用户点击「开始」。

## 调试（无需 DSH 环境）

直接用浏览器打开 `debug.html`：

- `?fast=1`：专注 8s / 休息 4s，可完整观察阶段切换与视觉提示
- 不带参数：真实时长 25min / 5min
- `?fast=1&no-settings=1`：模拟组合没有 settings 域，验证番茄钟仍出现且设置页只读降级
- 页面底部渲染**设置页**：默认使用伪 settings 域，改时长点保存会实时同步到计时引擎
- "切换明暗主题"按钮模拟 `--dsw-alias-*` 令牌的两种取值
- 接线日志显示 bundle 对 `slots` / `ctx.interval` / `/pomodoro` RPC 的调用

调试时长还可通过 `window.__POMO_DEBUG_FOCUS_MS` / `__POMO_DEBUG_BREAK_MS` 注入（毫秒），
生产环境不设置，行为与默认值完全一致。

## 安装 / 更新（在 $DSH_HOME/profiles/web 生效）

```powershell
node $env:DSH_HOME\profiles\node_modules\@deepseek-ai\dsh\lib\bin.js plugin --profile web add link:C:\Users\lbq08\.dsh\profiles\plugins\dsh-pomodoro
```

- **源码位置必须在 profiles 树内**（本目录即 `profiles\plugins\dsh-pomodoro`）：Node ESM 会把
  Junction 解析到真实路径，源码目录的上级必须有 `node_modules` 供 `schemastery` 等依赖解析。
- **`link:` 协议**：安装副本是 Junction 指向本源码目录，**改源码后无需重装**，
  重启 `dsh web` 即生效。（注意：不要用 `file:` 协议 —— pnpm 会打包进 store，
  后续 `add` 不重新拷贝，改动不同步。）
- **零配置注册**：包声明了 `dsh.bundle.patch`，`dsh plugin add` 自动把它追加进
  `dsh.profile.bundles`，组合行 `ui-pomodoro` 随包生效，用户无需手改组合文件。
- 改完源码后，**重启 `dsh web`** 生效；先用
  `dsh --profile web --dump-config | findstr dsh-pomodoro` 验证行已组合。

## 移除

1. `dsh plugin --profile web remove dsh-pomodoro`（会自动从 bundles 中剔除）
2. 重启 `dsh web`

## 分发（npm）

包已按官方规范就绪（`exports["./client"]`、`dsh.client`、`dsh.bundle`、peerDependencies、
`publishConfig.access: public`）。发布流程：

1. `npm login`（注册 npm 账号）并确认包名 `dsh-pomodoro` 未被占用
2. 在包目录执行 `pnpm publish`（或 `npm publish`）
3. 用户侧安装即零配置：

```powershell
dsh plugin --profile web add dsh-pomodoro   # bundle 自动注册
# 重启 dsh web，侧栏即出现 🍅
```

注意事项：

- 依赖 DSH rc.6 的约定（`__ModuleLoader__` 格式、slot 名、`timer`/`connection` 服务、
  `rpc.handle`/`rpc.call` 通道），DSH 后续版本若变更需同步升级；peerDependencies 已锁版本区间。
- 仅对 `web` profile 有意义（纯客户端 UI）；安装到 headless 等 profile 不会报错，只是不显示。

## 约定

- 样式颜色走 `--dsw-alias-*` 主题令牌，自动适配明暗主题；进度环使用固定品牌色。
- 计时状态为内存态（进程级），不做持久化，与动态插件版行为一致。
- 与动态插件版（pomo-*）使用相同 slot id（`pomodoro.toggle` / `pomodoro.panel`），
  不要与动态版同时运行，否则同 cell 相互替换。
