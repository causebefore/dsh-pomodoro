import assert from "node:assert/strict";
import test from "node:test";

import { createSharedEnvironment } from "./helpers/client-harness.mjs";

// 面板拖动位置的持久化契约：位置不进入 runtime snapshot（那是带 revision /
// claim 语义的计时体系），而是独立 localStorage key；拖动经防抖落盘，新会话
// 启动时恢复，损坏数据安全回退默认位置。

const POSITION_KEY = "dsh-pomodoro.panel-position.v1";
const FLUSH_DEBOUNCE_MS = 250;

async function waitUntilReady(environment, tab) {
  for (let index = 0; index < 20 && !tab.api.isRuntimeReady(); index += 1) {
    await environment.flush();
  }
  assert.equal(tab.api.isRuntimeReady(), true);
  await tab.api.whenIdle();
  await environment.flush();
}

test("move 后防抖窗口内不落盘，窗口到期写一次", async () => {
  const environment = createSharedEnvironment(100000);
  const tab = environment.createTab({ debugFocusMs: 25000, debugBreakMs: 5000 });
  await waitUntilReady(environment, tab);

  const before = environment.writeCount;
  tab.api.engine.move(120, 80);
  environment.advance(FLUSH_DEBOUNCE_MS - 1);
  tab.runDueTimers();
  await environment.flush();
  assert.equal(environment.readKey(POSITION_KEY), null, "防抖窗口内不得落盘");

  environment.advance(1);
  tab.runDueTimers();
  await environment.flush();
  assert.deepEqual(JSON.parse(environment.readKey(POSITION_KEY)), { left: 120, top: 80 });
  assert.equal(environment.writeCount, before + 1, "一次拖动只写一次");
  tab.dispose();
});

test("连续 move 重置防抖，只写最终位置", async () => {
  const environment = createSharedEnvironment(100000);
  const tab = environment.createTab({ debugFocusMs: 25000, debugBreakMs: 5000 });
  await waitUntilReady(environment, tab);

  const before = environment.writeCount;
  tab.api.engine.move(10, 10);
  environment.advance(100);
  tab.runDueTimers();
  tab.api.engine.move(20, 20);
  environment.advance(100);
  tab.runDueTimers();
  tab.api.engine.move(30, 15);
  environment.advance(FLUSH_DEBOUNCE_MS);
  tab.runDueTimers();
  await environment.flush();
  assert.deepEqual(JSON.parse(environment.readKey(POSITION_KEY)), { left: 30, top: 15 });
  assert.equal(environment.writeCount, before + 1);
  tab.dispose();
});

test("新会话从持久化位置启动，恢复本身不产生写", async () => {
  const environment = createSharedEnvironment(100000);
  environment.seedKey(POSITION_KEY, JSON.stringify({ left: 333, top: 111 }));
  const tab = environment.createTab({ debugFocusMs: 25000, debugBreakMs: 5000 });
  await waitUntilReady(environment, tab);
  assert.equal(tab.api.engine.get().left, 333);
  assert.equal(tab.api.engine.get().top, 111);
  assert.equal(environment.writeCount, 0, "恢复不得触发写回");
  tab.dispose();
});

test("损坏或越界的持久化位置安全回退默认", async () => {
  for (const bad of ["not json", '{"left":10}', '{"left":-5,"top":5}', '{"left":"x","top":2}', "[1,2]", "null", '"str"']) {
    const environment = createSharedEnvironment(100000);
    environment.seedKey(POSITION_KEY, bad);
    const tab = environment.createTab({ debugFocusMs: 25000, debugBreakMs: 5000 });
    await waitUntilReady(environment, tab);
    assert.equal(tab.api.engine.get().left, null, `坏数据 ${bad} 应回退默认位置`);
    assert.equal(tab.api.engine.get().top, null);
    tab.dispose();
  }
});

test("位置写失败不影响引擎运行", async () => {
  const environment = createSharedEnvironment(100000);
  const tab = environment.createTab({ debugFocusMs: 25000, debugBreakMs: 5000, storageSetError: true });
  await waitUntilReady(environment, tab);
  tab.api.engine.move(50, 60);
  environment.advance(FLUSH_DEBOUNCE_MS);
  tab.runDueTimers();
  await environment.flush();
  assert.equal(tab.api.engine.get().left, 50, "写失败后内存状态不受影响");
  assert.equal(tab.api.engine.get().running, false);
  tab.dispose();
});
