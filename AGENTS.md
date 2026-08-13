# Repository Guidelines

## 项目结构与模块职责

- `lib/index.js` 是 Node/Cordis 入口，定义唯一的生产默认值、可选 settings namespace，以及仅限 loopback 的 `/pomodoro` RPC。
- `lib/client.js` 是浏览器端手写 bundle，包含计时引擎、React UI、slot 注册和设置同步。修改时保留 `window.__ModuleLoader__.load(...)` 外壳。
- `cordis.patch.yml` 只负责插入 `ui-pomodoro` 组合行；不要在这里重复默认值。
- `debug.html` 是离线调试台，`vendor/` 存放其固定版本的 React UMD 文件。除依赖升级外，不要编辑压缩后的 vendor 文件。
- `package.json` 是 exports、客户端依赖边、bundle patch 和发布文件清单的权威来源。

## 参考文档与架构约束

DSH API 或集成方式不确定时，先查阅 `C:\Users\lbq08\Desktop\deepseek-harness\docs`。本项目重点参考 `subsystems/client-modules.zh.md`、`subsystems/settings.zh.md`、`web-styling.zh.md` 和 `user/develop/basic/publish.zh.md`。保持配置链路为 `Config schema → settings.yaml 用户覆盖 → /pomodoro RPC → 客户端引擎`；settings 服务缺席时必须保留只读降级能力。

## 开发、检查与本地运行

项目没有生成步骤，也未声明 npm test/lint 脚本；`lib/client.js` 本身就是分发产物。

```powershell
node --check .\lib\index.js
node --check .\lib\client.js
Start-Process .\debug.html
npm pack --dry-run
dsh --profile web --dump-config | findstr dsh-pomodoro
```

前两项检查语法；调试台验证 UI；`npm pack --dry-run` 核对实际发布内容；最后一项确认插件已进入 web profile。需要联调时，用 `dsh plugin --profile web add "link:$PWD"` 建立链接，修改后重启 `dsh web`。

## 编码风格与命名

JavaScript 使用 ESM、两空格缩进、双引号、分号和多行尾逗号；优先 `const`。变量和函数用 `camelCase`，常量用 `UPPER_SNAKE_CASE`，插件、slot 和 namespace 使用小写 kebab-case 或现有点分 ID。注释延续中文风格，只解释契约和非显然行为。组件颜色优先使用 `--dsw-alias-*` 主题令牌。

## 测试要求

当前没有自动化测试框架或覆盖率门槛。每次修改至少运行两项语法检查，并用 `debug.html?fast=1` 验证开始、暂停、重置、跳过和阶段切换；用 `?fast=1&no-settings=1` 验证降级路径。设置或样式变更还需检查保存/清除、明暗主题和面板拖动。

## 提交与 Pull Request

当前目录不含 Git 元数据，无法验证既有提交格式。新增历史统一采用简短的 Conventional Commit，例如 `feat: 支持自定义休息时长` 或 `fix: 修正暂停后的剩余时间`。一个提交只处理一个关注点。PR 应说明行为及配置链路变化、列出实际验证命令与手测场景、关联 issue；UI 变化附明暗主题截图，依赖范围或 DSH 契约变化需单独标明。不要提交 `settings.yaml`、凭据或本地打包生成的 `.tgz`。
