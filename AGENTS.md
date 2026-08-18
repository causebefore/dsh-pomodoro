# Repository Guidelines

## 项目定位

本项目是 **DeepSeek Harness（DSH）** 的番茄钟功能插件，发布名称为dsh-pomodoro，为 DSH 提供专注计时、休息阶段切换及相关设置能力。开发、调试、兼容性判断与发布均以 DSH 插件契约为边界，不按独立 Web 应用处理。

## 项目结构与职责

- `lib/index.js` 是 Node/Cordis 入口，拥有生产默认值、可选 settings namespace 和仅限 loopback 的 `/pomodoro` RPC。
- `lib/client.js` 是直接分发的浏览器 bundle，包含计时引擎、React UI、slot 注册和设置同步；保留 `window.__ModuleLoader__.load(...)` 外壳。
- `cordis.patch.yml` 只插入 `ui-pomodoro` 组合行，不复制默认值。
- 维护者本地且被 Git 忽略的 `debug.html` 与 `vendor/` 组成离线调试台；vendor 仅在有明确依赖升级时修改。
- `package.json` 是 exports、peer 范围、bundle patch 和 npm 发布清单的权威来源。

## 参考文档与架构约束

本机参考文档位于 `C:\Users\lbq08\Desktop\deepseek-harness\docs`，合规参照范围限定在 `user/develop/` 目录：发布与安装以 `user/develop/basic/publish.zh.md` 为准，插件配置参考 `user/develop/basic/config.zh.md`，Cordis 服务与事件用法参考 `user/develop/framework/`。

## 开发与验证命令

```powershell
npm run check
npm pack --dry-run
npm publish --dry-run
dsh --profile web --dump-config | findstr dsh-pomodoro
```

项目没有生成步骤；`lib/client.js` 就是发布产物。维护者本地调试台使用 `?fast=1` 验证完整阶段切换，使用 `?fast=1&no-settings=1` 验证只读降级。设置或样式变更还要检查保存/清除、明暗主题、键盘焦点、减少动态效果和面板拖动。

## 编码与样式约定

JavaScript 使用 ESM、两空格缩进、双引号、分号和多行尾逗号；变量/函数用 `camelCase`，常量用 `UPPER_SNAKE_CASE`，插件与 namespace 用 kebab-case。注释延续中文契约说明。组件颜色只消费 `--dsw-alias-*`，共享阴影与排版使用宿主 token；新增动画必须保留 `prefers-reduced-motion`，交互控件必须有可见的 `:focus-visible`。

## 分支策略

- `dev` 是默认开发分支。功能、修复、重构、文档等日常修改必须在 `dev` 或从 `dev` 创建的主题分支上进行，PR 默认合入 `dev`。
- 单关注点的小改动可直接提交 `dev`；多步、跨文件或需要阶段性验证的改动必须从 `dev` 切主题分支（`feat/xxx`、`fix/xxx`、`test/xxx`），完成后以 PR 合回 `dev`。单人项目的 PR 定位是自审与验证记录，不是协作门槛，合入前必须按下方 PR 要求填写验证命令与手测场景。
- 开始修改前先检查当前分支；如果位于 `main`，应在工作区干净时切换到 `dev`，不得把日常开发提交直接留在 `main`。
- `main` 只负责发布。只有完成发布检查、准备正式发布时，才允许通过发布 PR 将 `dev` 合入 `main`。
- 除非用户明确授权执行发布，代理不得直接提交或推送 `main`；发布完成后继续回到 `dev` 开发。

## 提交、PR 与发布

提交采用 Conventional Commit，例如 `fix: 修正阶段提示消失时机`。每个提交只处理一个关注点。PR 需列出验证命令与手测场景；UI 变化附明暗主题截图，peer 或 DSH 契约变化单独说明。发布前核对 README、版本、许可证、`npm pack` 文件清单和干净工作区。除非用户明确授权，代理不得执行真实 `npm publish`。不要提交凭据、`settings.yaml`、日志或 `.tgz`。
