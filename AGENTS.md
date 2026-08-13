# Repository Guidelines

## 项目定位

本项目是 **DeepSeek Harness（DSH）** 的番茄钟功能插件，发布名称为dsh-pomodoro，为 DSH 提供专注计时、休息阶段切换及相关设置能力。开发、调试、兼容性判断与发布均以 DSH 插件契约为边界，不按独立 Web 应用处理。

## 项目结构与职责

- `lib/index.js` 是 Node/Cordis 入口，拥有生产默认值、可选 settings namespace 和仅限 loopback 的 `/pomodoro` RPC。
- `lib/client.js` 是直接分发的浏览器 bundle，包含计时引擎、React UI、slot 注册和设置同步；保留 `window.__ModuleLoader__.load(...)` 外壳。
- `cordis.patch.yml` 只插入 `ui-pomodoro` 组合行，不复制默认值。
- `debug.html` 与 `vendor/` 组成离线调试台；vendor 仅在有明确依赖升级时修改。
- `package.json` 是 exports、peer 范围、bundle patch 和 npm 发布清单的权威来源。

## 参考文档与架构约束

本机参考文档位于 `C:\Users\lbq08\Desktop\deepseek-harness\docs`，合规参照范围限定在 `user/develop/` 目录：发布与安装以 `user/develop/basic/publish.zh.md` 为准，插件配置参考 `user/develop/basic/config.zh.md`，Cordis 服务与事件用法参考 `user/develop/framework/`。

## 开发与验证命令

```powershell
npm run check
Start-Process .\debug.html
npm pack --dry-run
npm publish --dry-run
dsh --profile web --dump-config | findstr dsh-pomodoro
```

项目没有生成步骤；`lib/client.js` 就是发布产物。调试台使用 `?fast=1` 验证完整阶段切换，使用 `?fast=1&no-settings=1` 验证只读降级。设置或样式变更还要检查保存/清除、明暗主题、键盘焦点、减少动态效果和面板拖动。

## 编码与样式约定

JavaScript 使用 ESM、两空格缩进、双引号、分号和多行尾逗号；变量/函数用 `camelCase`，常量用 `UPPER_SNAKE_CASE`，插件与 namespace 用 kebab-case。注释延续中文契约说明。组件颜色只消费 `--dsw-alias-*`，共享阴影与排版使用宿主 token；新增动画必须保留 `prefers-reduced-motion`，交互控件必须有可见的 `:focus-visible`。

## 提交、PR 与发布

提交采用 Conventional Commit，例如 `fix: 修正阶段提示消失时机`。每个提交只处理一个关注点。PR 需列出验证命令与手测场景；UI 变化附明暗主题截图，peer 或 DSH 契约变化单独说明。发布前核对 README、版本、许可证、`npm pack` 文件清单和干净工作区。除非用户明确授权，代理不得执行真实 `npm publish`。不要提交凭据、`settings.yaml`、日志或 `.tgz`。
