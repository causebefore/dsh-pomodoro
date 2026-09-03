# dsh-pomodoro 安全审查机制

本文件定义一套可重复执行的插件安全审查机制，用于在每次发布前验证 npm 发布面（`files` 白名单内的产物 + `package.json` + `cordis.patch.yml`）不含安全问题。规则维度来自 DSH 社区讨论区沉淀的插件威胁模型与各家扫描器的公开启发式，不是自创标准。

## 威胁模型与规则来源

DSH 插件在宿主进程内以全权限执行，且安装链（`dsh plugin add` = `pnpm add`）无签名与来源校验。以下讨论构成本机制的规则依据：

| 讨论 | 要点 | 对应审查项 |
| --- | --- | --- |
| [deepseek-harness#454](https://github.com/deepseek-ai/deepseek-harness/discussions/454) 第三方插件模型安全审计 | 插件=进程内全权限代码；loopback RPC 是敏感服务面 | RPC 通道逐个钉死 `authority: "loopback"`（≤0.1.1 生效；0.1.2 起宿主对所有通道统一实施"受信来源 + 浏览器会话认证"围栏，该选项被忽略，实测无 cookie 请求 401） |
| [deepseek-harness#587](https://github.com/deepseek-ai/deepseek-harness/discussions/587) 启动期配置树写权限 | `cordis.patch.yml` 可在守卫生效前改写 approval/sandbox/credentials 行 | 组合补丁只允许纯 `insert`，禁止引用核心行标识 |
| [deepseek-harness#3421](https://github.com/deepseek-ai/deepseek-harness/discussions/3421) 补丁静默禁用核心 provider | `replace`/`disabled: true` 可关掉 fs-sandbox、bash、pwsh | 同上 |
| [deepseek-harness#1770](https://github.com/deepseek-ai/deepseek-harness/discussions/1770) dsh.so 1309 插件扫描 | 严重风险集中在：硬编码密钥、数据外传、混淆代码、破坏性命令 | L1 逐行规则全部四类 |
| [deepseek-harness#1663](https://github.com/deepseek-ai/deepseek-harness/discussions/1663) dsh-plugin-vetting 15 条启发式 | 网络外传/凭据访问/混淆/持久化/会话日志/install 脚本 | L1 逐行规则 + L3 工具 |
| [deepseek-harness#2215](https://github.com/deepseek-ai/deepseek-harness/discussions/2215) plugin_vet 供应链门禁 | 生命周期脚本、typosquat、SBOM | L1 依赖允许列表 + 无 install 脚本 |

## 审查机制（五层）

### L1 静态规则审查（每次改动，必跑）

```bash
node scripts/security-scan.mjs
```

零依赖、纯静态（从不执行被审代码），只扫发布面文件以避免 vendor/ 缓存/日志噪声。退出码 0 干净 / 1 存在 FAIL，可直接作 CI 门禁。覆盖：硬编码密钥、浏览器与 Node 网络出口、子进程、fs、eval/Function/混淆、凭据与环境变量访问、持久化、破坏性命令、DOM 注入 sink、跨窗口调用、localStorage 命名空间、RPC loopback 钉死、组合补丁纯 insert、依赖官方域允许列表、无安装期脚本、files 白名单一致性。

### L2 契约面人工核对（发布前，或 L1 规则覆盖不到的变更）

- [ ] 新增/修改 RPC 端点：`/pomodoro` 仅暴露只读 `config.read`，返回的六个计时字段均为非敏感配置；不新增写端点，设置写入只经浏览器 settingsScope（revision 乐观锁）落到宿主 settings 服务。
- [ ] 新增浏览器能力（通知/音频/存储之外的新 API）：确认有用户授权门（如 `Notification.requestPermission`），无静默触发。
- [ ] 设置文案与帮助文本不出现真实路径外的敏感信息。

### L3 供应链工具（发布前）

```bash
npx -y dsh-poison-guard@latest scan . --json   # zoahdev 供应链扫描，纯静态
npm pack --dry-run                              # 逐项核对发布清单
```

poison-guard 会扫全目录（含 vendor、缓存、CI 配置），结果按"是否属于发布面"甄别，已知误报见下方台账。可选交叉验证：`dsh-plugin-vetting`（社区启发式体检器）与 dsh.so 插件详情页的公开扫描报告。

### L4 隔离安装冒烟（版本发布前）

用 zoahdev/dsh-plugin-doctor 在临时 `DSH_HOME` 里走完整 安装→启动→配置 链路：

```bash
git clone https://github.com/zoahdev/dsh-plugin-doctor   # 注意：npm 同名包是另一个项目
cd dsh-plugin-doctor && pnpm install --frozen-lockfile && pnpm build
node lib/bin.js --full <本仓库路径>
```

注意：`--build` 会在插件目录真实执行 `pnpm install` 并残留 lockfile（本插件产物直接提交、无构建步骤，不需要 `--build`）；doctor 报告的"缺 `prepare` 脚本"是面向"git 安装需构建"模板插件的规则，对本插件不适用。

### L5 CI 集成（建议，尚未接入）

在 `.github/workflows/ci.yml` 的 validate job 末尾追加一步即可让 L1 成为硬门禁：

```yaml
      - name: Security scan (publish surface)
        run: node scripts/security-scan.mjs
```

可选：接入 [zoahdev/dsh-plugin-doctor-action](https://github.com/zoahdev/dsh-plugin-doctor-action)@v1（#2049）获得 manifest/patch/入口点/白名单检查与 `full: true` 的全新 profile 安装冒烟。

## 审查记录：v0.4.2（2026-08-20）

| 层 | 结果 | 说明 |
| --- | --- | --- |
| L1 静态规则 | ✅ 0 FAIL / 0 WARN / 7 INFO | 提示音 base64 为已知豁免项 |
| L2 契约面 | ✅ | `/pomodoro` RPC loopback + revision 乐观锁 + `redactSecrets`；写入字段白名单逐个显式传递 |
| L3 poison-guard | ✅（发布面） | 发布文件内 3 处命中均为台账误报；95 个 high 全部位于不随 npm 发布的文件（vendor React 调试副本、`.codegraph`/`.serena` 缓存、playwright 日志、workflows、测试） |
| L3 npm pack | ✅ | 发布清单 8 项与 `files` 白名单一致，vendor/test/CI 均不在内 |
| L4 doctor | —（沿用 0.4.0 基线） | 0.4.0 时 pack+install+config 全链路 PASS、唯一 FAIL 为不适用的 prepare 规则；0.4.1→0.4.2 未触及安装面，发布前如有余力建议重跑 |

依赖面：唯一运行依赖 `@deepseek-ai/schemastery` 维护者含 `tianyi@deepseek.com`（官方域）；peer 全部 `@deepseek-ai/*` 与 `react`；无任何生命周期安装脚本。

## 审查记录：v0.5.2（2026-09-03，DSH 0.1.2-rc.1 跟进）

背景：DSH 0.1.2 移除了 `rpc.handle` 的 `authority` 选项，所有通道改由宿主统一围栏（非受信来源 403、无浏览器会话 401）。插件声明的第三参数在 ≤0.1.1 仍是唯一钉死手段，在 0.1.2 被忽略，故保留。

| 层 | 结果 | 说明 |
| --- | --- | --- |
| L1 静态规则 | ✅ 0 FAIL / 0 WARN / 7 INFO | 与 0.5.1 基线一致 |
| L2 契约面 | ✅ | `/pomodoro` 只读 `config.read` 仅返回六个非敏感计时字段；rc.1 真实宿主实测：认证会话 200、无 cookie 401 |
| L4 隔离冒烟 | —（本版以真实宿主实测替代） | 0.1.2-rc.1 全周期实测：插件加载零报错、设置卡片六字段保存回路、阶段自动切换、明暗主题、reduced-motion、拖动持久化、`:focus-visible` 均通过 |

## 误报台账

社区扫描器的已知误报及甄别理由（poison-guard / dsh.so 维度通用）：

| 命中 | 位置 | 甄别 |
| --- | --- | --- |
| `exfil-secrets`：credential-style 名称 | `lib/index.js` `describe({ redactSecrets: true })` | 参数名是宿主 settings API 的脱敏开关，该文件零网络代码 |
| `obfuscation`：base64 解码 | `lib/client.js` `COMPLETION_SOUND_BASE64` + `atob` | 内嵌完成提示音，9.6KB MP3（ID3 头校验），WebAudio 本地播放，无网络 |
| `exfil-combo`：读凭据+网络请求 | 全目录组合判定 | 跨文件拼接的产物：凭据词来自上一条参数名，网络代码位于 vendor/测试，发布文件内不存在该组合 |
| 短标识符 / 大量 high | `vendor/react*.production.min.js` | 本地调试台依赖（`debug.html` 配套），不随 npm 发布 |
| `exfil-secrets` | `.github/workflows/*.yml` | GitHub Actions 的 `secrets.*` 引用，属 CI 标准写法，不随 npm 发布 |
| `ast/unsafe-vm-context` | `test/helpers/client-harness.mjs` | 测试桩用 vm 模拟宿主 Loader，不随 npm 发布 |

若未来扫描器新增命中，先对照"是否在发布面 + 是否能构成本地数据→网络出口的真实链路"再定性。

## 复审触发条件

出现以下任一变更时，重跑对应层级（默认全跑 L1，其余按面触及）：

- 新增或升级任何依赖（含 devDependencies）→ L1 + L3 + L4
- 新增/修改 RPC 端点或 settings 读写路径 → L1 + L2
- `cordis.patch.yml` 结构变化 → L1
- `files` 白名单或打包产物变化 → L1 + L3
- `lib/client.js` 引入新的浏览器 API → L2
- DSH peer 范围升级（rc 版本跟进）→ L4，并按发布说明核对 slot/settings/RPC 契约变化
