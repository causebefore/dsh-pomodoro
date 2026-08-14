<div align="center">

<h1>🍅 dsh-pomodoro</h1>

<p>为 DeepSeek Harness Web UI 提供专注与休息循环的番茄钟插件。</p>

<p>
  <a href="https://github.com/causebefore/dsh-pomodoro/blob/dev/README.md">English</a> ·
  <strong>简体中文</strong>
</p>

<p>
  <a href="https://www.npmjs.com/package/dsh-pomodoro"><img alt="npm 版本" src="https://img.shields.io/npm/v/dsh-pomodoro.svg?logo=npm"></a>
  <a href="https://www.npmjs.com/package/dsh-pomodoro"><img alt="Node.js 版本" src="https://img.shields.io/node/v/dsh-pomodoro.svg?logo=node.js"></a>
  <a href="https://github.com/deepseek-ai/deepseek-harness"><img alt="DSH 0.1.0-rc.6" src="https://img.shields.io/badge/DSH-0.1.0--rc.6-4B8BF5"></a>
  <a href="https://github.com/causebefore/dsh-pomodoro/blob/main/LICENSE"><img alt="MIT 许可证" src="https://img.shields.io/npm/l/dsh-pomodoro.svg"></a>
</p>

<p>
  <a href="#界面预览">界面预览</a> ·
  <a href="#功能亮点">功能亮点</a> ·
  <a href="#快速安装">快速安装</a> ·
  <a href="#基本使用">基本使用</a> ·
  <a href="#设置与提醒">设置与提醒</a>
</p>

</div>

> **兼容性提示：** 当前兼容基线为 DeepSeek Harness `0.1.0-rc.6`。Harness 仍处于开发者预览阶段，升级 DSH 后请重新确认插件兼容性。

## 界面预览

支持明暗主题、迷你模式和 DSH 插件配置。

<table>
  <tr>
    <th align="center">浅色主题</th>
    <th align="center">深色主题</th>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/causebefore/dsh-pomodoro/main/docs/images/pomodoro-light.png" alt="浅色主题下的番茄钟浮动面板" width="250"></td>
    <td align="center"><img src="https://raw.githubusercontent.com/causebefore/dsh-pomodoro/main/docs/images/pomodoro-dark.png" alt="深色主题下的番茄钟浮动面板" width="250"></td>
  </tr>
</table>

### 迷你模式

<p align="center">
  <img src="https://raw.githubusercontent.com/causebefore/dsh-pomodoro/main/docs/images/pomodoro-mini.png" alt="只显示阶段、倒计时和主要控制的迷你番茄钟" width="186">
</p>

### 设置页面

<p align="center">
  <img src="https://raw.githubusercontent.com/causebefore/dsh-pomodoro/main/docs/images/pomodoro-settings.png" alt="DSH 插件配置中的番茄钟设置卡片" width="580">
</p>

## 功能亮点

- **融入 DSH：** 从侧栏打开番茄钟，在插件配置页面统一管理设置。
- **完整计时控制：** 支持开始、暂停、重置、跳过、环形进度、阶段提示和已完成专注计数。
- **低干扰迷你模式：** 收起后只保留阶段、倒计时和开始/暂停，仍可拖动、展开或关闭。
- **可配置循环：** 专注与休息时长可调，并可分别控制是否自动开始休息或下一轮专注。
- **阶段结束提醒：** 无论面板是否打开都会显示 DSH 内提醒，还可选择提示音和后台系统通知。
- **DSH 语言支持：** 跟随 DSH 全局语言提供中文和英文；切换语言会立即更新已打开的插件界面，不会重置计时或未保存的设置草稿。
- **界面适配：** 自动适配 DSH 明暗主题、键盘操作和“减少动态效果”偏好。

## 环境要求

| 组件 | 要求 |
|---|---|
| DeepSeek Harness | 兼容基线 `0.1.0-rc.6` |
| Node.js | `^22.19.0` 或 `>=24.0.0` |
| DSH profile | `web`；headless profile 不提供界面 |
| pnpm | 可从命令行使用 |

## 快速安装

将插件安装到 `web` profile：

```powershell
dsh plugin --profile web add dsh-pomodoro
```

安装后启动或重启 DSH Web：

```powershell
dsh web
```

侧栏底部出现 🍅 按钮即表示插件已加载。

## 基本使用

点击侧栏 🍅 按钮打开或关闭面板，拖动标题栏可以调整面板位置。标题栏中的“迷你”会收起次要信息，“展开”可恢复完整面板。

| 控件 | 行为 |
|---|---|
| 开始 / 暂停 | 启动或暂停当前阶段 |
| 重置 | 将当前阶段恢复到完整时长并暂停 |
| 跳过 | 切换到下一阶段并保持暂停 |
| 迷你 / 展开 | 在低遮挡布局与完整控制之间切换 |

## 设置与提醒

在 DSH 的“设置 → 插件 → 插件配置 → 番茄钟”中展开卡片即可修改：

| 设置 | 默认值 | 作用 |
|---|---:|---|
| 专注时长 | 25 分钟 | 每轮专注阶段的完整时长，可设置为 1–240 分钟的整数 |
| 休息时长 | 5 分钟 | 每轮休息阶段的完整时长，可设置为 1–240 分钟的整数 |
| 自动开始休息 | 开启 | 专注自然结束后自动启动休息 |
| 自动开始下一轮专注 | 关闭 | 休息自然结束后自动启动下一轮 |
| 阶段结束时播放提示音 | 关闭 | 阶段自然结束时播放三次提示音，可直接试听 |
| 后台时发送系统通知 | 关闭 | DSH 页面位于后台时发送浏览器通知 |

当前阶段尚未开始时，新时长会立即生效；计时已经开始后，从下一阶段生效。

### 完成提醒

- **DSH 内提醒：** 始终开启。专注或休息自然结束时会显示，即使番茄钟面板已经关闭也能看到；若下一阶段自动开始，提醒中会一并说明。
- **提示音：** 默认关闭。开启并保存后，每次阶段自然结束会播放三次提示音；“试听”无需先保存。
- **系统通知：** 默认关闭。首次开启时请按浏览器提示允许通知，然后点击“保存”。通知只在 DSH 页面位于后台或失去焦点时发送。

系统通知需要通过 `localhost`、`127.0.0.1` 或 HTTPS 访问，并保持 DSH 页面打开。提示音或系统通知不可用时，DSH 内提醒仍然有效。

## 更新与移除

```powershell
# 更新插件
dsh plugin --profile web update dsh-pomodoro

# 移除插件
dsh plugin --profile web remove dsh-pomodoro
```

执行后重启 `dsh web`。

## 相关链接

- [npm 包](https://www.npmjs.com/package/dsh-pomodoro)
- [版本发布](https://github.com/causebefore/dsh-pomodoro/releases)
- [问题反馈](https://github.com/causebefore/dsh-pomodoro/issues)
- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

## License

[MIT](LICENSE)。React/ReactDOM 与 CC0 完成提示音等第三方素材的许可信息见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 开发与维护

<details>
<summary><strong>展开本地开发、项目结构与发布流程</strong></summary>

### 本地开发

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
| `lib/client.js` | 浏览器计时引擎、React UI、slot 注册、locale 文案和设置同步 |
| `assets/sounds/deep-ding.mp3` | CC0 低沉提示音源文件；运行时字节嵌入客户端 bundle |
| `docs/images/` | 中英文 README 截图与 GitHub Social Preview 图片 |
| `cordis.patch.yml` | 向 DSH Web 组合插入插件服务 |
| `package.json` | exports、peer 范围、bundle 声明和 npm 发布清单 |
| `.github/workflows/publish.yml` | GitHub Release 到 npm 的可信发布流程 |

### 发布流程

1. 在 `dev` 完成开发和验证，并更新 `package.json` 版本。
2. 通过发布 PR 将 `dev` 合入 `main`。
3. 从对应的 `main` 提交创建名称匹配 `vX.Y.Z` 的稳定 GitHub Release。
4. 发布工作流会验证版本、tag 和 `main` 归属，运行语法与打包检查，再通过 npm Trusted Publishing 发布。

</details>
