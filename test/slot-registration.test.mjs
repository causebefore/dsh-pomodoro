import assert from "node:assert/strict";
import test from "node:test";

import { createSharedEnvironment } from "./helpers/client-harness.mjs";

// 支持基线 rc.7 起 settings.plugin.item 是 keyed slot，key 必须等于 Host 注册的
// settings namespace。id/order 属于旧 list slot，不再混入新版卡片契约。
test("settings.plugin.item 只按 settings namespace 注册 keyed entry", async () => {
  const environment = createSharedEnvironment(100000);
  const tab = environment.createTab({ debugFocusMs: 25000, debugBreakMs: 5000 });
  for (let index = 0; index < 20 && !tab.api.isRuntimeReady(); index += 1) {
    await environment.flush();
  }

  const registration = environment.slotRegistrations
    .find((options) => options.name === "settings.plugin.item");
  assert.ok(registration, "settings.plugin.item 未注册");
  assert.equal(registration.key, "dsh-pomodoro", "key 必须等于设置命名空间");
  assert.equal(registration.locale, "dsh-pomodoro");
  assert.equal(typeof registration.id, "undefined");
  assert.equal(typeof registration.order, "undefined");
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
