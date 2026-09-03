---
name: release
description: dsh-pomodoro 的固定发布流程：从合并主题分支、发布 PR 到创建 GitHub Release 的每一步，以及 Release 说明的固定骨架。当用户要发布新版本、发版、升版本号、把 dev 合入 main、创建 Release 或写发布说明时使用——即使用户只说"发一下 0.5.2"或"这版可以发了"也要触发。
---

# dsh-pomodoro 发布流程

把一次发布从"主题分支就绪"带到"npm 上线"。职责分两段：

- **本地只做合并与同步**——合并、推送、发布 PR、建 Release；
- **npm publish 永远由 GitHub Action 执行**（`.github/workflows/publish.yml`，由 Release published 事件触发）。本地任何情况下不跑 `npm publish`。

## 前置核对（任何一项不通过就地停下，报告用户，不要带病发布）

- 工作区干净；主题分支的提交已经过用户人工审阅，且用户明确表示要发布；
- `npm run check` 全绿（含 package-compat 的版本断言）；
- `node scripts/security-scan.mjs` 退出码 0；
- `npm pack --dry-run` 文件清单与 `files` 白名单一致；
- `package.json` 版本号已按约定提升，README 无过期的版本号表述（适配的 DSH 版本只写在 Release 说明里，README 不写具体号）。

版本号约定：兼容声明/文档跟进 = patch；新功能 = minor；破坏性变更（提升 DSH 最低版本、移除旧宿主支持）= major。

## 步骤

1. 合并主题分支回 `dev`（普通 merge，保留合并记录）：

   ```bash
   git checkout dev && git merge --no-ff <branch> -m "merge: <一句话说明>"
   ```

   合并说明中列验证命令与手测场景（AGENTS.md 要求；UI 有变化时附明暗主题截图链接）。

2. 推送：`git push origin dev`。注意：推送后 GitHub 页面会出现 recent pushes 提示条，**不要从那里建 PR**——平时不建 dev→main 的 PR，只在发版时走下一步。

3. 发布 PR（服务端合并，禁止本地 merge 后直推 main）：

   ```bash
   gh pr create --base main --head dev --title "release: v<版本>"
   gh pr merge --merge
   ```

4. 同步两分支：`git checkout main && git pull`，然后 `git checkout dev && git pull`。

5. 按“Release 说明骨架”起草说明，**先给用户过目**。

6. 用户确认后创建 Release（tag 打在 main 上）：

   ```bash
   gh release create v<版本> --target main --title "v<版本>" --notes-file <草稿>
   ```

   **创建 Release 即触发 publish.yml 自动发布 npm——这是整个流程中唯一需要用户点头的关口。** 用户对第 5 步草稿的确认即视为对第 6 步的授权；用户只让"合并"不让"发版"时，止步于第 4 步。

7. 确认 CI 发布成功：`gh run list --workflow publish.yml --limit 1`（或 `gh run watch`）。npm 页面出现新版本可能有几分钟延迟。

## Release 说明骨架（结构固定，勿增删段落）

````markdown
适配 DSH：`<rc 版本列表>`（仅 rc 基线）

中文 | English

### <一句话主题>

- <变更点；同类归并，写用户可感知的效果，不罗列提交>

### <English Topic>

- <对应英文>

## 更新 | Update

```powershell
dsh plugin --profile web update dsh-pomodoro
```

更新后请重启 DSH Web 宿主 / Restart the DSH web host after updating.

**Full Changelog**: https://github.com/causebefore/dsh-pomodoro/compare/<prev-tag>...<this-tag>
````

规则：

- **"适配 DSH"行必须存在且置顶**（AGENTS.md 硬性要求），只写 rc 版本，不写 alpha 等中间预发布；
- 双语两段内容对应，小节标题按本版主题命名；
- `## 更新 | Update` 段为固定段：升级命令与重启提示固定不变，本版特有的安装注意事项按需补充在该段内；
- 长篇行为解释放 README 或提交说明，不进 Release。

## 红线

- Release 说明缺"适配 DSH"行 = 不发布；
- 未经用户确认不执行 `gh release create`（等价于授权 npm publish）；
- 本地任何情况下不执行 `npm publish`；
- 只在发版时建 dev→main 的 PR。
