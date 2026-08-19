<!--
本模板同时用于两类 PR：主题分支 PR（feat/fix/test-xxx → dev，自审记录）
与发布 PR（dev → main）。不适用的节整节删除，不要留空节。
-->

## 变更说明

<!-- 一两句话说明本 PR 交付什么；可粘贴 git log --oneline <base>..HEAD 概览 -->

## DSH 契约变化（无则删节）

<!-- AGENTS.md 要求：peer 或 DSH 契约变化必须单独说明，含动机与影响面 -->

- peer 范围：
- slot / 服务 / RPC / 设置契约：

## 验证

- [ ] `npm run check`（测试数：__ / __）
- [ ] `npm pack --dry-run` 清单核对（发布物有变化时）
- [ ] GUI 手测场景（列明覆盖项，如加载 / 计时 / 设置 / 主题 / 恢复）：

| DSH 版本 | 验证级别（GUI 全量 / 冒烟 / 静态） |
|---|---|
| 0.1.0-rc.7 | |
| 0.1.0-rc.6 | |

## UI 变更截图（无则删节）

<!-- 明暗主题各一张 -->

## 发布前检查（仅发布 PR：dev → main；主题分支 PR 删除本节）

- [ ] `package.json` 版本号与目标 Release 名（vX.Y.Z）一致
- [ ] README 中英文的兼容基线引用已同步
- [ ] 工作区干净，合并方向为 dev → main
