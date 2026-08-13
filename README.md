# dsh-pomodoro

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web UI 提供的番茄钟插件。它在侧栏加入 🍅 入口，并显示一个可拖动的浮动面板，帮助你在编码过程中完成专注与休息循环。

> 当前版本面向 DeepSeek Harness `0.1.0-rc.6`。Harness 仍处于开发者预览阶段，升级 DSH 后请重新确认兼容性。

## 功能

- 默认 25 分钟专注、5 分钟休息，可在 DSH 设置页修改
- 开始、暂停、重置和跳过当前阶段
- 专注完成计数、环形进度和阶段切换提示
- 专注结束后可自动开始休息，休息结束后可选择自动开始下一轮
- 可拖动浮动面板，自动适配 DSH 明暗主题
- settings 服务缺席时仍可计时，并明确显示只读降级状态

## 环境要求

- DeepSeek Harness `0.1.0-rc.6`
- Node.js `^22.19.0 || >=24.0.0`
- `web` profile；headless profile 不提供本插件的界面

## 安装

```powershell
dsh plugin --profile web add dsh-pomodoro
dsh --profile web --dump-config | findstr dsh-pomodoro
```

重启 `dsh web` 后，侧栏底部会出现 🍅 按钮。包内已经声明 `dsh.bundle`，无需手动编辑 profile 的 `cordis.patch.yml`。

## 使用与设置

点击侧栏 🍅 按钮打开或关闭面板。面板标题栏可拖动；「开始／暂停」「重置」「跳过」分别控制当前阶段。

在 DSH「设置 → 番茄钟」中可以修改：

| 设置 | 默认值 |
|---|---:|
| 专注时长 | 25 分钟 |
| 休息时长 | 5 分钟 |
| 自动开始休息 | 开启 |
| 自动开始下一轮专注 | 关闭 |

设置写入 `$DSH_HOME/settings.yaml` 的 `dsh-pomodoro` 分节。保存时，尚未开始且未被改动的阶段会立即采用新时长；运行中或已暂停的阶段从下一次切换起采用。手动「跳过」只切换阶段，不会自动启动下一阶段。

## 更新与移除

```powershell
# 更新到 npm 上的当前版本
dsh plugin --profile web add dsh-pomodoro

# 移除插件
dsh plugin --profile web remove dsh-pomodoro
```

执行后重启 `dsh web`。

## 隐私与限制

- 插件只通过宿主的 loopback `/pomodoro` RPC 读写设置，不请求外部服务，也不需要凭据。
- 计时进度和完成数量只保存在浏览器内存中；刷新页面或重启 DSH 后会重置。
- 非 loopback 的远程浏览器仍可使用计时器，但使用内置默认值且不能写入持久化设置。
- 当前不提供系统通知或提示音；阶段完成仅在面板内提示。
- 当前界面文案与设置分节名称只提供简体中文，不随宿主 locale 切换。
- 不要与使用 `pomodoro.toggle` / `pomodoro.panel` slot ID 的动态版番茄钟同时启用。

## 本地开发

```powershell
npm run check
npm pack --dry-run
```

联调本地源码可运行 `dsh plugin --profile web add "link:$PWD"`，修改后重启 `dsh web`。

项目没有构建步骤，`lib/client.js` 是直接发布的浏览器 bundle，因此组件样式由该 bundle 通过 `style[data-plugin]` 注入并由宿主模块系统接管。若以后引入构建链，应重新评估迁移到 CSS Modules。

## License

[MIT](LICENSE)。离线调试台中 React/ReactDOM 的许可信息见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
