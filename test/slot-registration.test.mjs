import assert from "node:assert/strict";
import test from "node:test";

import { createSharedEnvironment } from "./helpers/client-harness.mjs";

// rc.7 把 settings.plugin.item 声明为 keyed slot（key 必须等于设置命名空间
// "dsh-pomodoro"），rc.6 及更早为 list slot（按 id 注册）。注册参数漏掉 key 会在
// rc.7 上抛错导致整个插件加载失败；key 漂移则卡片静默消失。此文件把两份契约
// 钉进断言，防止后续改动无声回归。
test("settings.plugin.item 注册同时携带 rc.6 的 id 与 rc.7 的 key", async () => {
  const environment = createSharedEnvironment(100000);
  const tab = environment.createTab({ debugFocusMs: 25000, debugBreakMs: 5000 });
  for (let index = 0; index < 20 && !tab.api.isRuntimeReady(); index += 1) {
    await environment.flush();
  }

  const registration = environment.slotRegistrations
    .find((options) => options.name === "settings.plugin.item");
  assert.ok(registration, "settings.plugin.item 未注册");
  assert.equal(registration.id, "pomodoro", "rc.6 list slot 依赖 id 注册");
  assert.equal(registration.key, "dsh-pomodoro", "rc.7 keyed slot 要求 key=设置命名空间");
  assert.equal(registration.locale, "dsh-pomodoro");
  assert.equal(typeof registration.label, "undefined");

  const sidebar = environment.slotRegistrations
    .find((options) => options.name === "sidebar.footer.action");
  assert.ok(sidebar, "sidebar.footer.action 未注册");
  assert.equal(sidebar.id, "pomodoro.toggle");

  const overlays = environment.slotRegistrations
    .filter((options) => options.name === "shell.overlay");
  assert.deepEqual(overlays.map((options) => options.id).sort(), ["pomodoro.completion", "pomodoro.panel"]);

  tab.dispose();
});
