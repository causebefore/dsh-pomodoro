import assert from "node:assert/strict";
import test from "node:test";

import { createSharedEnvironment } from "./helpers/client-harness.mjs";

const VALUE = {
  focusMinutes: 50,
  breakMinutes: 10,
  autoStartBreaks: false,
  autoStartFocus: true,
  completionSound: true,
  systemNotifications: true,
};

async function readyTab(options = {}) {
  const environment = createSharedEnvironment(100000);
  const tab = environment.createTab(options);
  for (let index = 0; index < 20 && !tab.api.isRuntimeReady(); index += 1) {
    await environment.flush();
  }
  await environment.flush();
  return { environment, tab };
}

test("官方 settingsScope：保存六个字段并发布 user 层", async () => {
  const { tab } = await readyTab();
  const initial = tab.api.settings.getSnapshot();
  assert.equal(initial.status, "ready");
  assert.equal(initial.revision, 1);

  await tab.api.settings.save(VALUE, initial.revision);
  const saved = tab.api.settings.getSnapshot();
  assert.equal(saved.revision, 7);
  assert.deepEqual(saved.value, VALUE);
  assert.deepEqual(saved.user, VALUE);
  tab.dispose();
});

test("官方 settingsScope：清除覆盖后重新继承组合默认值", async () => {
  const { tab } = await readyTab();
  await tab.api.settings.save(VALUE, 1);
  await tab.api.settings.reset(7);
  const reset = tab.api.settings.getSnapshot();
  assert.equal(reset.revision, 13);
  assert.deepEqual(reset.user, {});
  assert.deepEqual(reset.value, {
    focusMinutes: 25,
    breakMinutes: 5,
    autoStartBreaks: true,
    autoStartFocus: false,
    completionSound: false,
    systemNotifications: false,
  });
  tab.dispose();
});

test("官方 settingsScope：陈旧 revision 在写入前报告冲突", async () => {
  const { tab } = await readyTab();
  await tab.api.settings.save(VALUE, 1);
  await assert.rejects(
    () => tab.api.settings.save({ ...VALUE, focusMinutes: 60 }, 1),
    (error) => error?.code === "SETTINGS_CONFLICT" && error.expected === 1 && error.actual === 7,
  );
  tab.dispose();
});

test("官方 settingsScope：宿主吞掉写入失败时不误报成功", async () => {
  const { tab } = await readyTab({ settingsWriteRejected: "breakMinutes" });
  await assert.rejects(
    () => tab.api.settings.save(VALUE, 1),
    (error) => error?.code === "SETTINGS_WRITE_REJECTED" && /breakMinutes/.test(error.message),
  );
  const current = tab.api.settings.getSnapshot();
  assert.equal(current.user.focusMinutes, 50, "前一字段已由官方逐字段接口提交");
  assert.equal(Object.prototype.hasOwnProperty.call(current.user, "breakMinutes"), false);
  tab.dispose();
});

test("settingsScope 不可用时 config.read 仍让计时引擎完成降级启动", async () => {
  const { tab } = await readyTab({ settingsUnavailable: true, settingsRead: { focusMinutes: 35 } });
  assert.equal(tab.api.isRuntimeReady(), true);
  assert.equal(tab.api.settings.getSnapshot().status, "unavailable");
  await assert.rejects(
    () => tab.api.settings.save(VALUE, undefined),
    (error) => error?.code === "settings-unavailable",
  );
  tab.dispose();
});

test("只读 settingsScope 拒绝保存", async () => {
  const { tab } = await readyTab({ settingsWritable: false });
  const snapshot = tab.api.settings.getSnapshot();
  assert.equal(snapshot.status, "ready");
  assert.equal(snapshot.writable, false);
  await assert.rejects(
    () => tab.api.settings.save(VALUE, snapshot.revision),
    (error) => error?.code === "settings-read-only",
  );
  tab.dispose();
});
