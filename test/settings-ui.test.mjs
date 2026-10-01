import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { act, create } from "react-test-renderer";
import { createSharedEnvironment } from "./helpers/client-harness.mjs";

async function mountSettings(t, options = {}) {
  const environment = createSharedEnvironment();
  const tab = environment.createTab({ modernSettings: true, react: React, ...options });
  await environment.flush();
  const slot = environment.slotRegistrations.find((entry) => entry.name === "plugins.bundle.config");
  let view;
  await act(async () => { view = create(slot.render({ t: (key) => key })); });
  t.after(() => { act(() => view.unmount()); tab.dispose(); });
  const button = (key) => view.root.findAllByType("button").find((node) => node.children.includes(key));
  const focus = () => view.root.findByProps({ id: "dsh-pomodoro-focus-minutes" });
  const notification = () => view.root.findAllByType("input").filter((node) => node.props.type === "checkbox")[3];
  return { environment, tab, view, button, focus, notification };
}

for (const [scenario, options, message] of [
  ["并发冲突", { concurrentSettingsWrite: true }, "settings.conflict.save.withDraft"],
  ["写入失败", { settingsWriteRejected: true }, "notice.save.failed"],
]) {
  test(`新版设置 UI：${scenario}后草稿保留并显示错误`, async (t) => {
    const ui = await mountSettings(t, options);
    act(() => ui.focus().props.onChange({ target: { value: "45" } }));
    await act(async () => { ui.button("action.save").props.onClick(); await ui.environment.flush(); });
    assert.equal(ui.focus().props.value, "45");
    assert.equal(ui.tab.api.settings.getSnapshot().value.focusMinutes, 25);
    assert.match(JSON.stringify(ui.view.toJSON()), new RegExp(message.replaceAll(".", "\\.")));
    assert.equal(ui.button("action.save").props.disabled, options.concurrentSettingsWrite === true);
    if (options.concurrentSettingsWrite) {
      act(() => ui.button("action.reload").props.onClick());
      assert.equal(ui.focus().props.value, "25");
      assert.equal(ui.button("action.save").props.disabled, false);
    }
  });
}

for (const permission of ["granted", "denied"]) {
  test(`通知授权 ${permission}：只在授权且保存后启用`, async (t) => {
    class Notification {
      static permission = "default";
      static requests = 0;
      static async requestPermission() { this.requests += 1; this.permission = permission; return permission; }
    }
    const ui = await mountSettings(t, { Notification });
    await act(async () => { ui.notification().props.onChange({ target: { checked: true } }); await ui.environment.flush(); });
    assert.equal(Notification.requests, 1);
    assert.equal(ui.notification().props.checked, permission === "granted");
    assert.equal(ui.tab.api.settings.getSnapshot().value.systemNotifications, false);
    await act(async () => { ui.button("action.save").props.onClick(); await ui.environment.flush(); });
    assert.equal(ui.tab.api.settings.getSnapshot().value.systemNotifications, permission === "granted");
    if (permission === "denied") {
      await act(async () => { ui.notification().props.onChange({ target: { checked: true } }); });
      assert.equal(Notification.requests, 1, "拒绝后不重复弹出授权");
    }
  });
}

test("通知请求失败：恢复按钮并保持关闭", async (t) => {
  class Notification {
    static permission = "default";
    static async requestPermission() { throw new Error("permission unavailable"); }
  }
  const ui = await mountSettings(t, { Notification });
  await act(async () => { ui.notification().props.onChange({ target: { checked: true } }); await ui.environment.flush(); });
  assert.equal(ui.notification().props.checked, false);
  assert.equal(ui.button("action.save").props.disabled, false);
  assert.match(JSON.stringify(ui.view.toJSON()), /notice.notification.requestFailed/);
});
