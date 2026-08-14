<div align="center">

<h1>🍅 dsh-pomodoro</h1>

<p>为 DeepSeek Harness Web UI 提供专注与休息循环的轻量番茄钟插件。</p>

<p>
  <a href="https://www.npmjs.com/package/dsh-pomodoro"><img alt="npm version" src="https://img.shields.io/npm/v/dsh-pomodoro.svg?logo=npm"></a>
  <a href="https://www.npmjs.com/package/dsh-pomodoro"><img alt="Node.js version" src="https://img.shields.io/node/v/dsh-pomodoro.svg?logo=node.js"></a>
  <a href="https://github.com/deepseek-ai/deepseek-harness"><img alt="DSH 0.1.0-rc.6" src="https://img.shields.io/badge/DSH-0.1.0--rc.6-4B8BF5"></a>
  <a href="https://github.com/causebefore/dsh-pomodoro/blob/main/LICENSE"><img alt="MIT license" src="https://img.shields.io/npm/l/dsh-pomodoro.svg"></a>
</p>

<p>
  <a href="#界面预览">界面预览</a> ·
  <a href="#功能亮点">功能亮点</a> ·
  <a href="#快速安装">快速安装</a> ·
  <a href="#使用与设置">使用与设置</a> ·
  <a href="#本地开发">本地开发</a>
</p>

</div>

> **兼容性提示：** 当前兼容基线为 DeepSeek Harness `0.1.0-rc.6`。Harness 仍处于开发者预览阶段，升级 DSH 后请重新确认插件兼容性。

## 界面预览

截图来自插件在真实 DSH Web 宿主中的运行效果，仅裁取插件界面。

<table>
  <tr>
    <th align="center">浅色主题</th>
    <th align="center">深色主题</th>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/causebefore/dsh-pomodoro/dev/docs/images/pomodoro-light.png" alt="浅色主题下的番茄钟浮动面板" width="250"></td>
    <td align="center"><img src="https://raw.githubusercontent.com/causebefore/dsh-pomodoro/dev/docs/images/pomodoro-dark.png" alt="深色主题下的番茄钟浮动面板" width="250"></td>
  </tr>
</table>

### 插件配置集成

<p align="center">
  <img src="https://raw.githubusercontent.com/causebefore/dsh-pomodoro/dev/docs/images/pomodoro-settings.png" alt="DSH 插件配置中的番茄钟设置卡片" width="612">
</p>

## 功能亮点

- **原生集成：** 注册到 DSH 侧栏、浮层和“插件配置”，不需要手动修改 profile 配置。
- **完整计时控制：** 支持开始、暂停、重置、跳过、环形进度、阶段提示和已完成专注计数。
- **可配置循环：** 专注与休息时长可调，并可分别控制是否自动开始休息或下一轮专注。
- **宿主主题适配：** 复用 DSH 设计令牌，支持明暗主题、键盘焦点和“减少动态效果”偏好。
- **可预期的降级：** settings 服务不可用或浏览器不是 loopback 连接时，计时器仍可使用，并明确进入只读模式。

## 兼容性

| 组件 | 要求 |
|---|---|
| DeepSeek Harness | 兼容基线 `0.1.0-rc.6` |
| Node.js | `^22.19.0` 或 `>=24.0.0` |
| DSH profile | `web`；headless profile 不提供界面 |
| 包管理器 | `pnpm` 需在 `PATH` 中，DSH 的 `plugin` 命令会转发给它 |

## 快速安装

将插件安装到 `web` profile，并确认组合配置中出现 `dsh-pomodoro`：

```powershell
dsh plugin --profile web add dsh-pomodoro
dsh --profile web --dump-config
```

随后启动或重启 DSH Web：

```powershell
dsh web
```

侧栏底部出现 🍅 按钮即表示插件已加载。包内已经声明 `dsh.bundle`，无需手动编辑 profile 的 `cordis.patch.yml`。

## 使用与设置

点击侧栏 🍅 按钮打开或关闭面板，拖动标题栏可以调整面板位置。

| 控件 | 行为 |
|---|---|
| 开始 / 暂停 | 启动或暂停当前阶段 |
| 重置 | 将当前阶段恢复到完整时长并暂停 |
| 跳过 | 切换到下一阶段并保持暂停 |

在 DSH 的“设置 → 插件 → 插件配置 → 番茄钟”中展开卡片即可修改：

| 设置 | 默认值 | 作用 |
|---|---:|---|
| 专注时长 | 25 分钟 | 每轮专注阶段的完整时长 |
| 休息时长 | 5 分钟 | 每轮休息阶段的完整时长 |
| 自动开始休息 | 开启 | 专注自然结束后自动启动休息 |
| 自动开始下一轮专注 | 关闭 | 休息自然结束后自动启动下一轮 |

设置保存在 DSH 设置文档的 `dsh-pomodoro` 分节。尚未开始且未被改动的当前阶段会立即采用新时长；运行中或已经暂停的阶段从下一次阶段切换起采用。

保存和清除操作会携带读取时的 revision。若其他标签页或外部编辑已经更新设置，插件会拒绝旧写入、保留当前草稿，并提示重新加载最新设置。

## 更新与移除

```powershell
# 更新到 npm 上的当前版本
dsh plugin --profile web update dsh-pomodoro

# 从 web profile 移除插件
dsh plugin --profile web remove dsh-pomodoro
```

执行后重启 `dsh web`。

## 本地开发

```powershell
git clone https://github.com/causebefore/dsh-pomodoro.git
Set-Location dsh-pomodoro
dsh plugin --profile web add .
npm run check
npm pack --dry-run
```

项目没有生成步骤，`lib/client.js` 就是直接发布的浏览器 bundle。日常开发在 `dev` 分支进行，`main` 只接收已经完成发布检查的版本。

### 项目结构

| 路径 | 职责 |
|---|---|
| `lib/index.js` | Node/Cordis 入口、配置 schema 和 loopback RPC |
| `lib/client.js` | 浏览器计时引擎、React UI、slot 注册和设置同步 |
| `cordis.patch.yml` | 向 DSH Web 组合插入插件服务 |
| `package.json` | exports、peer 范围、bundle 声明和 npm 发布清单 |
| `.github/workflows/publish.yml` | GitHub Release 到 npm 的可信发布流程 |

<details>
<summary><strong>维护者发布流程</strong></summary>

1. 在 `dev` 完成开发和验证，并更新 `package.json` 版本。
2. 通过发布 PR 将 `dev` 合入 `main`。
3. 从对应的 `main` 提交创建名称匹配 `vX.Y.Z` 的稳定 GitHub Release。
4. 发布工作流会验证版本、tag 和 `main` 归属，运行语法与打包检查，再通过 npm Trusted Publishing 发布。

</details>

## 相关链接

- [npm 包](https://www.npmjs.com/package/dsh-pomodoro)
- [版本发布](https://github.com/causebefore/dsh-pomodoro/releases)
- [问题反馈](https://github.com/causebefore/dsh-pomodoro/issues)
- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

## License

[MIT](LICENSE)。React/ReactDOM 等第三方组件的许可信息见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
