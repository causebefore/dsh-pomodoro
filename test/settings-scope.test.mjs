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
  assert.equal(tab.api.getRuntimeSnapshot().totalMs, 35 * 60 * 1000);
  assert.equal(tab.rpcCalls.length, 1);
  assert.equal(tab.api.settings.getSnapshot().status, "unavailable");
  await assert.rejects(
    () => tab.api.settings.save(VALUE, undefined),
    (error) => error?.code === "settings-unavailable",
  );
  tab.dispose();
});

test("0.1.2+ 降级配置由 GET 路由读取且不调用旧 RPC", async () => {
  const { tab } = await readyTab({
    settingsUnavailable: true,
    fetch: async (url) => ({
      status: 200,
      async json() {
        return { ok: true, value: { ...VALUE, focusMinutes: 35 } };
      },
    }),
  });
  assert.equal(tab.api.isRuntimeReady(), true);
  assert.equal(tab.api.getRuntimeSnapshot().totalMs, 35 * 60 * 1000);
  assert.deepEqual(tab.fetchCalls.map(([url]) => url), ["/api/pomodoro/config"]);
  assert.equal(tab.rpcCalls.length, 0);
  assert.equal(tab.errors.length, 0);
  tab.dispose();
});

test("GET 路由返回 404 时回退旧宿主 RPC", async () => {
  const { tab } = await readyTab({
    settingsUnavailable: true,
    settingsRead: { focusMinutes: 35 },
    fetch: async () => ({ status: 404 }),
  });
  assert.equal(tab.api.isRuntimeReady(), true);
  assert.equal(tab.api.getRuntimeSnapshot().totalMs, 35 * 60 * 1000);
  assert.equal(tab.fetchCalls.length, 1);
  assert.equal(tab.rpcCalls.length, 1);
  assert.equal(tab.rpcCalls[0].scope, "/pomodoro");
  assert.equal(tab.rpcCalls[0].endpoint, "config.read");
  assert.deepEqual(Object.keys(tab.rpcCalls[0].payload), []);
  assert.equal(tab.errors.length, 0);
  tab.dispose();
});

test("GET 路由非 404 失败时不回退未注册的旧 RPC", async () => {
  const { tab } = await readyTab({
    settingsUnavailable: true,
    fetch: async () => ({ status: 401 }),
  });
  assert.equal(tab.api.isRuntimeReady(), true);
  assert.equal(tab.api.getRuntimeSnapshot().totalMs, 25 * 60 * 1000);
  assert.equal(tab.fetchCalls.length, 1);
  assert.equal(tab.rpcCalls.length, 0);
  assert.equal(tab.errors.length, 1);
  assert.match(String(tab.errors[0][1]), /config\.read HTTP 401/);
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

for (const modernSettings of [true]) {
  test("configForms：六字段一次原子保存，清除也只提交一次", async () => {
    const { tab } = await readyTab({ modernSettings });
    await tab.api.settings.save(VALUE, 1);
    assert.deepEqual(tab.api.settings.getSnapshot().value, VALUE);
    assert.equal(tab.api.settings.getSnapshot().revision, 2);
    assert.equal(tab.mutations.length, 1);
    assert.equal(tab.mutations[0].ops.length, 6);
    assert.equal(tab.mutations[0].expectedRevision, 1);
    await tab.api.settings.reset(2);
    assert.equal(tab.mutations.length, 2);
    assert.equal(tab.api.settings.getSnapshot().revision, 3);
    assert.deepEqual(tab.api.settings.getSnapshot().user, {});
    tab.dispose();
  });

  test("configForms：拒绝批量保存时没有部分字段成功", async () => {
    const { tab } = await readyTab({ modernSettings, settingsWriteRejected: "breakMinutes" });
    await assert.rejects(() => tab.api.settings.save(VALUE, 1), { code: "SETTINGS_WRITE_REJECTED" });
    assert.equal(tab.api.settings.getSnapshot().user, null);
    assert.equal(tab.api.settings.getSnapshot().value.focusMinutes, 25);
    tab.dispose();
  });

  test("configForms：提交期间的并发修改报告冲突，不覆盖新值", async () => {
    const { tab } = await readyTab({ modernSettings, concurrentSettingsWrite: true });
    await assert.rejects(() => tab.api.settings.save(VALUE, 1), { code: "SETTINGS_CONFLICT" });
    assert.equal(tab.api.settings.getSnapshot().user, null);
    assert.equal(tab.mutations[0].expectedRevision, 1);
    tab.dispose();
  });

  test("configForms：旧服务不存在仍加载新版卡片，卸载移除全部入口", async () => {
    const { tab, environment } = await readyTab({ modernSettings });
    assert.equal(tab.api.isRuntimeReady(), true);
    assert.equal(environment.slotRegistrations.filter((row) => row.name === "plugins.bundle.config").length, 1);
    assert.equal(environment.slotRegistrations.some((row) => row.name === "settings.plugin.item"), false);
    tab.dispose();
    assert.equal(environment.slotRegistrations.length, 0);
    const second = environment.createTab({ modernSettings });
    await environment.flush();
    assert.equal(environment.slotRegistrations.filter((row) => row.name === "sidebar.footer.action").length, 1);
    second.dispose();
  });
}
