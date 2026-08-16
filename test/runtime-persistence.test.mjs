import assert from "node:assert/strict";
import test from "node:test";

import {
  createSharedEnvironment,
  Deferred,
  runtimeSnapshot,
} from "./helpers/client-harness.mjs";

async function waitUntilReady(environment, tab) {
  for (let index = 0; index < 20 && !tab.api.isRuntimeReady(); index += 1) {
    await environment.flush();
  }
  assert.equal(tab.api.isRuntimeReady(), true);
  await tab.api.whenIdle();
  await environment.flush();
}

test("刷新后沿用原绝对截止时间，不在 tick 中重复写入", async () => {
  const environment = createSharedEnvironment(100000);
  environment.seed(runtimeSnapshot({
    running: true,
    totalMs: 25000,
    deadlineAt: 110000,
    updatedAt: 100000,
  }));

  const firstTab = environment.createTab({ debugFocusMs: 25000, debugBreakMs: 5000 });
  await waitUntilReady(environment, firstTab);
  assert.equal(firstTab.api.engine.get().remainingMs, 10000);
  firstTab.dispose();

  environment.advance(3000);
  const secondTab = environment.createTab({ debugFocusMs: 25000, debugBreakMs: 5000 });
  await waitUntilReady(environment, secondTab);
  assert.equal(secondTab.api.engine.get().running, true);
  assert.equal(secondTab.api.engine.get().remainingMs, 7000);
  assert.equal(secondTab.api.getRuntimeSnapshot().deadlineAt, 110000);
  assert.equal(secondTab.completions.length, 0);

  const writesBeforeTick = environment.writeCount;
  environment.advance(250);
  secondTab.runIntervals();
  await environment.flush();
  assert.equal(secondTab.api.engine.get().remainingMs, 6750);
  assert.equal(environment.writeCount, writesBeforeTick);
  secondTab.dispose();
});

test("暂停状态跨关闭恢复时不会扣除离开期间的时间", async () => {
  const environment = createSharedEnvironment(100000);
  environment.seed(runtimeSnapshot({
    running: false,
    totalMs: 25000,
    deadlineAt: null,
    remainingMs: 7000,
    updatedAt: 100000,
  }));

  environment.advance(500000);
  const tab = environment.createTab({ debugFocusMs: 25000, debugBreakMs: 5000 });
  await waitUntilReady(environment, tab);
  assert.equal(tab.api.engine.get().running, false);
  assert.equal(tab.api.engine.get().remainingMs, 7000);
  assert.equal(tab.completions.length, 0);
  tab.dispose();
});

test("关闭期间到期后只结算一个阶段，再次打开不会重复", async () => {
  const environment = createSharedEnvironment(100000);
  environment.seed(runtimeSnapshot({
    running: true,
    totalMs: 10000,
    deadlineAt: 101000,
    updatedAt: 100000,
  }));

  const firstTab = environment.createTab({ debugFocusMs: 10000, debugBreakMs: 5000 });
  await waitUntilReady(environment, firstTab);
  firstTab.dispose();
  environment.advance(500000);

  const secondTab = environment.createTab({ debugFocusMs: 10000, debugBreakMs: 5000 });
  await waitUntilReady(environment, secondTab);
  const settled = environment.read();
  assert.equal(settled.phase, "break");
  assert.equal(settled.running, true);
  assert.equal(settled.deadlineAt, environment.now + 5000);
  assert.equal(settled.pomos, 1);
  assert.equal(settled.transitionSeq, 1);
  assert.equal(secondTab.completions.length, 1);
  secondTab.dispose();

  const thirdTab = environment.createTab({ debugFocusMs: 10000, debugBreakMs: 5000 });
  await waitUntilReady(environment, thirdTab);
  assert.equal(environment.read().pomos, 1);
  assert.equal(environment.read().transitionSeq, 1);
  assert.equal(thirdTab.completions.length, 0);
  thirdTab.dispose();
});

test("两个标签页同时到期时全局只结算并发布一次", async () => {
  const environment = createSharedEnvironment(100000);
  environment.seed(runtimeSnapshot({
    running: true,
    totalMs: 10000,
    deadlineAt: 101000,
    updatedAt: 100000,
  }));
  const options = {
    debugFocusMs: 10000,
    debugBreakMs: 5000,
    settingsRead: { autoStartBreaks: false },
  };
  const firstTab = environment.createTab(options);
  const secondTab = environment.createTab(options);
  await Promise.all([
    waitUntilReady(environment, firstTab),
    waitUntilReady(environment, secondTab),
  ]);

  environment.advance(2000);
  firstTab.runIntervals();
  secondTab.runIntervals();
  await environment.flush(30);

  const settled = environment.read();
  assert.equal(settled.phase, "break");
  assert.equal(settled.running, false);
  assert.equal(settled.pomos, 1);
  assert.equal(settled.transitionSeq, 1);
  assert.equal(firstTab.completions.length + secondTab.completions.length, 1);
  assert.equal(firstTab.api.engine.get().phase, "break");
  assert.equal(secondTab.api.engine.get().phase, "break");
  assert.ok(environment.lockRequests.length >= 2);
  assert.ok(environment.lockRequests.every((request) => (
    request.name === "dsh-pomodoro.runtime" && request.mode === "exclusive"
  )));
  assert.equal(environment.writesOutsideLock, 0);
  firstTab.dispose();
  secondTab.dispose();
});

test("持久化写入失败的标签不会抢先发布，健康标签恢复后只发布一次", async () => {
  const environment = createSharedEnvironment(102000);
  environment.seed(runtimeSnapshot({
    running: true,
    totalMs: 10000,
    deadlineAt: 101000,
    updatedAt: 100000,
  }));
  const brokenTab = environment.createTab({
    debugFocusMs: 10000,
    debugBreakMs: 5000,
    storageSetError: true,
  });
  await waitUntilReady(environment, brokenTab);
  assert.equal(brokenTab.completions.length, 0);
  assert.equal(environment.read().phase, "focus");
  brokenTab.dispose();

  const healthyTab = environment.createTab({ debugFocusMs: 10000, debugBreakMs: 5000 });
  await waitUntilReady(environment, healthyTab);
  assert.equal(environment.read().phase, "break");
  assert.equal(environment.read().pomos, 1);
  assert.equal(healthyTab.completions.length, 1);
  healthyTab.dispose();
});

test("同 revision 的存储最终值不同也会同步到本地", async () => {
  const environment = createSharedEnvironment(100000);
  environment.seed(runtimeSnapshot({ totalMs: 10000, remainingMs: 10000 }));
  const tab = environment.createTab({ debugFocusMs: 10000, debugBreakMs: 5000 });
  await waitUntilReady(environment, tab);

  environment.seed(runtimeSnapshot({
    revision: 1,
    phase: "break",
    totalMs: 5000,
    remainingMs: 5000,
  }));
  tab.emitWindow("storage", { key: "dsh-pomodoro.runtime.v1" });
  await environment.flush();
  assert.equal(tab.api.engine.get().phase, "break");
  assert.equal(tab.api.engine.get().remainingMs, 5000);
  tab.dispose();
});

test("过期恢复会等待首次设置读取，并采用最新自动开始与时长", async () => {
  const environment = createSharedEnvironment(2000);
  environment.seed(runtimeSnapshot({
    running: true,
    totalMs: 25 * 60 * 1000,
    deadlineAt: 1500,
    updatedAt: 1000,
  }));
  const settings = new Deferred();
  const tab = environment.createTab({ settingsRead: settings.promise });
  await environment.flush();

  assert.equal(tab.api.isRuntimeReady(), false);
  assert.equal(environment.read().phase, "focus");
  assert.equal(environment.read().pomos, 0);

  settings.resolve({
    focusMinutes: 30,
    breakMinutes: 10,
    autoStartBreaks: false,
  });
  await waitUntilReady(environment, tab);

  const settled = environment.read();
  assert.equal(settled.phase, "break");
  assert.equal(settled.running, false);
  assert.equal(settled.totalMs, 10 * 60 * 1000);
  assert.equal(settled.remainingMs, 10 * 60 * 1000);
  assert.equal(settled.pomos, 1);
  assert.equal(tab.completions.length, 1);
  tab.dispose();
});

test("首次设置返回前的用户操作会排队并采用真实配置", async () => {
  const environment = createSharedEnvironment(100000);
  const settings = new Deferred();
  const tab = environment.createTab({ settingsRead: settings.promise });
  const skip = tab.api.engine.skip();
  const start = tab.api.engine.toggleRun();
  await environment.flush();
  assert.equal(tab.api.isRuntimeReady(), false);
  assert.equal(environment.read(), null);

  settings.resolve({
    focusMinutes: 30,
    breakMinutes: 10,
    autoStartBreaks: false,
  });
  await Promise.all([skip, start]);
  await waitUntilReady(environment, tab);

  const persisted = environment.read();
  assert.equal(persisted.phase, "break");
  assert.equal(persisted.running, true);
  assert.equal(persisted.totalMs, 10 * 60 * 1000);
  assert.equal(persisted.deadlineAt, environment.now + 10 * 60 * 1000);
  tab.dispose();
});

test("恢复完成事件会交给首个迟到订阅者且只交付一次", async () => {
  const environment = createSharedEnvironment(102000);
  environment.seed(runtimeSnapshot({
    running: true,
    totalMs: 10000,
    deadlineAt: 101000,
    updatedAt: 100000,
  }));
  const tab = environment.createTab({
    debugFocusMs: 10000,
    debugBreakMs: 5000,
    captureCompletions: false,
  });
  await waitUntilReady(environment, tab);

  const first = [];
  const dispose = tab.api.completionEvents.subscribe((event) => first.push(event));
  dispose();
  const second = [];
  tab.api.completionEvents.subscribe((event) => second.push(event));
  assert.equal(first.length, 1);
  assert.equal(second.length, 0);
  tab.dispose();
});

test("损坏或不兼容快照会安全回退，后续操作仍可重新持久化", async () => {
  const now = 100000;
  const invalidRecords = [
    "{broken-json",
    JSON.stringify(runtimeSnapshot({ version: 2 })),
    JSON.stringify(runtimeSnapshot({ phase: "invalid" })),
    JSON.stringify(runtimeSnapshot({ running: true, deadlineAt: null, remainingMs: null })),
    JSON.stringify(runtimeSnapshot({ remainingMs: null })),
    JSON.stringify(runtimeSnapshot({ totalMs: 240 * 60 * 1000 + 1, remainingMs: 10000 })),
    JSON.stringify(runtimeSnapshot({ updatedAt: now + 6 * 60 * 1000 })),
    JSON.stringify(runtimeSnapshot({
      running: true,
      totalMs: 10000,
      deadlineAt: now + 12000,
      remainingMs: null,
      updatedAt: now,
    })),
    JSON.stringify(runtimeSnapshot({ remainingMs: 0 })),
    JSON.stringify(runtimeSnapshot({ lastCompletionId: "completion-1" })),
  ];

  for (const raw of invalidRecords) {
    const environment = createSharedEnvironment(now);
    environment.seedRaw(raw);
    const tab = environment.createTab({ debugFocusMs: 10000, debugBreakMs: 5000 });
    await waitUntilReady(environment, tab);

    assert.equal(tab.api.engine.get().phase, "focus");
    assert.equal(tab.api.engine.get().running, false);
    assert.equal(tab.api.engine.get().remainingMs, 10000);
    await tab.api.engine.toggleRun();
    await environment.flush();

    const persisted = environment.read();
    assert.equal(persisted.version, 1);
    assert.equal(persisted.running, true);
    assert.equal(persisted.deadlineAt, environment.now + 10000);
    tab.dispose();
  }
});
