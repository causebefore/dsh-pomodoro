import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";

// lib/index.js 的 Node 半边此前没有单测。这里用最小 mock 把 /pomodoro RPC
// 契约钉进断言：settings 缺席降级、expectedRevision 校验、值校验、
// SETTINGS_CONFLICT 映射、未知端点拒绝，以及 settings 子 fiber 卸载后的
// 回卷行为，防止宿主升级或重构时契约无声漂移。
//
// CI 刻意零依赖（不执行 npm install），两个 @deepseek-ai 导入经
// registerHooks 重定向到下面的语义忠实 mock（与真实 schemastery /
// dsh-settings 的行为逐项核对过：natural=非负整数、min/max 边界、
// default 填充、未知键忽略、settingsNamespace 恒等映射）。lib/index.js
// 本体始终加载真实源码，被测的是它的分支逻辑而非 schema 库本身。

const mockModuleUrl = (source) => "data:text/javascript," + encodeURIComponent(source);

const schemasteryMock = `
const field = (check, typeName) => ({
  typeName,
  minValue: -Infinity,
  maxValue: Infinity,
  defaultValue: undefined,
  min(n) { this.minValue = n; return this; },
  max(n) { this.maxValue = n; return this; },
  default(v) { this.defaultValue = v; return this; },
  validate(value, path) {
    if (!check(value)) throw new TypeError(path + " expected " + typeName + " but got " + JSON.stringify(value));
    if (value < this.minValue) throw new TypeError(path + " expected number >= " + this.minValue + " but got " + value);
    if (value > this.maxValue) throw new TypeError(path + " expected number <= " + this.maxValue + " but got " + value);
  },
});
export default {
  object(shape) {
    return (value) => {
      if (value === undefined || value === null) value = {};
      if (typeof value !== "object" || Array.isArray(value)) {
        throw new TypeError("expected object");
      }
      const out = {};
      for (const [key, entry] of Object.entries(shape)) {
        const raw = Object.prototype.hasOwnProperty.call(value, key) ? value[key] : entry.defaultValue;
        if (raw === undefined) throw new TypeError("$." + key + " is required");
        entry.validate(raw, "$." + key);
        out[key] = raw;
      }
      return out;
    };
  },
  natural: () => field((v) => Number.isSafeInteger(v) && v >= 0, "natural"),
  boolean: () => field((v) => typeof v === "boolean", "boolean"),
};
`;

const dshSettingsMock = `
export const settingsNamespace = (name) => name;
`;

const dependencyHooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "@deepseek-ai/schemastery") {
      return { url: mockModuleUrl(schemasteryMock), shortCircuit: true };
    }
    if (specifier === "@deepseek-ai/dsh-settings") {
      return { url: mockModuleUrl(dshSettingsMock), shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});

const { apply, Config, SETTINGS_NAMESPACE } = await import("../lib/index.js");
dependencyHooks.deregister();

function createSettingsProvider({ revision = 3, value, writable = true, conflictOnUpdate = false } = {}) {
  let current = { revision, value: { ...Config(value ?? {}) } };
  const calls = { updates: [], replaces: [] };
  return {
    calls,
    writable,
    registrations: [],
    async register(ns, schema, options) {
      this.registrations.push({ ns, schema, options });
      return { ns };
    },
    // 宿主 settings 服务的 describe 是同步返回数组（index.js 直接 .find）。
    describe() {
      return [{ ns: SETTINGS_NAMESPACE, value: { ...current.value }, user: null, revision: current.revision }];
    },
    async update(ns, next, expectedRevision) {
      calls.updates.push({ ns, next, expectedRevision });
      if (conflictOnUpdate || expectedRevision !== current.revision) {
        throw { code: "SETTINGS_CONFLICT", expected: expectedRevision, actual: current.revision };
      }
      current = { revision: current.revision + 1, value: next };
    },
    async replace(ns, next, expectedRevision) {
      calls.replaces.push({ ns, next, expectedRevision });
      if (expectedRevision !== current.revision) {
        throw { code: "SETTINGS_CONFLICT", expected: expectedRevision, actual: current.revision };
      }
      current = { revision: current.revision + 1, value: Config(next) };
    },
  };
}

function createContext({ provider } = {}) {
  const captured = { rpc: new Map(), effects: [], injected: [] };
  const ctx = {
    connection: {
      rpc: {
        handle(path, handler, options) {
          captured.rpc.set(path, { handler, options });
        },
      },
    },
    inject(deps, install) {
      captured.injected.push(deps);
      // settings 服务存在时立即挂载子 fiber；provider 为 undefined 时模拟
      // 组合里没有 settings 服务（inject 回调不执行，子项保持 PENDING）。
      if (provider !== undefined) {
        const settingsCtx = {
          settings: provider,
          effect(cleanup) {
            captured.effects.push(cleanup);
          },
        };
        install(settingsCtx);
      }
    },
  };
  return { ctx, captured };
}

function rpcOf(captured) {
  const entry = captured.rpc.get("/pomodoro");
  assert.ok(entry, "/pomodoro RPC 应已注册");
  return entry.handler;
}

const VALID_VALUE = {
  focusMinutes: 50,
  breakMinutes: 10,
  autoStartBreaks: false,
  autoStartFocus: true,
  completionSound: true,
  systemNotifications: true,
};

test("RPC 注册契约：/pomodoro 通道 + loopback authority + 可选 settings 注入", () => {
  const { ctx, captured } = createContext();
  apply(ctx, {});
  const entry = captured.rpc.get("/pomodoro");
  assert.ok(entry, "/pomodoro RPC 应已注册");
  assert.equal(typeof entry.handler, "function");
  assert.deepEqual(entry.options, { authority: "loopback" });
  assert.deepEqual(captured.injected, [["settings"]]);
});

test("settings 命名空间注册：ns + Config schema + 行配置作为 base", () => {
  const provider = createSettingsProvider();
  const { ctx } = createContext({ provider });
  apply(ctx, { focusMinutes: 45 });
  assert.equal(provider.registrations.length, 1);
  assert.equal(provider.registrations[0].ns, SETTINGS_NAMESPACE);
  assert.equal(provider.registrations[0].schema, Config);
  assert.deepEqual(provider.registrations[0].options, { base: Config({ focusMinutes: 45 }) });
});

test("settings.read：settings 就绪时透传 describe 视图", async () => {
  const provider = createSettingsProvider({ revision: 7, value: { focusMinutes: 40 } });
  const { ctx, captured } = createContext({ provider });
  apply(ctx, {});
  const result = await rpcOf(captured)("settings.read", undefined);
  assert.equal(result.ok, true);
  assert.equal(result.value.revision, 7);
  assert.equal(result.value.writable, true);
  assert.equal(result.value.user, null);
  assert.equal(result.value.value.focusMinutes, 40);
});

test("settings.read：settings 缺席时降级为 schema 默认值只读视图", async () => {
  const { ctx, captured } = createContext();
  apply(ctx, {});
  const result = await rpcOf(captured)("settings.read", undefined);
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    value: Config(),
    user: null,
    revision: 0,
    writable: false,
  });
});

test("settings.save：缺席时返回 settings-unavailable", async () => {
  const { ctx, captured } = createContext();
  apply(ctx, {});
  const result = await rpcOf(captured)("settings.save", { expectedRevision: 0, value: VALID_VALUE });
  assert.deepEqual(result, {
    ok: false,
    error: { code: "settings-unavailable", message: "当前组合没有可用的 settings 域" },
  });
});

test("settings.save：expectedRevision 缺失或非法时返回 invalid-request", async () => {
  const provider = createSettingsProvider();
  const { ctx, captured } = createContext({ provider });
  apply(ctx, {});
  const rpc = rpcOf(captured);
  for (const payload of [undefined, {}, { expectedRevision: -1 }, { expectedRevision: 1.5 }, { expectedRevision: "3" }, { expectedRevision: [3] }, null]) {
    const result = await rpc("settings.save", { ...payload, value: VALID_VALUE });
    assert.equal(result.error?.code, "invalid-request", `payload ${JSON.stringify(payload)} 应被判为非法`);
  }
  assert.equal(provider.calls.updates.length, 0, "非法请求不得触达 settings 服务");
});

test("settings.save：值不满足 schema 时返回 invalid-value", async () => {
  const provider = createSettingsProvider();
  const { ctx, captured } = createContext({ provider });
  apply(ctx, {});
  const rpc = rpcOf(captured);
  for (const value of [null, [], "x", 0, { focusMinutes: 0 }, { focusMinutes: 999 }, { autoStartBreaks: "yes" }]) {
    const result = await rpc("settings.save", { expectedRevision: 3, value });
    assert.equal(result.error?.code, "invalid-value", `value ${JSON.stringify(value)} 应被 schema 拒绝`);
  }
  assert.equal(provider.calls.updates.length, 0);
});

test("settings.save：合法请求把六个字段与 expectedRevision 交给 update 并返回新视图", async () => {
  const provider = createSettingsProvider({ revision: 3 });
  const { ctx, captured } = createContext({ provider });
  apply(ctx, {});
  const result = await rpcOf(captured)("settings.save", { expectedRevision: 3, value: VALID_VALUE });
  assert.equal(result.ok, true);
  assert.equal(provider.calls.updates.length, 1);
  assert.equal(provider.calls.updates[0].ns, SETTINGS_NAMESPACE);
  assert.deepEqual(provider.calls.updates[0].next, VALID_VALUE);
  assert.equal(provider.calls.updates[0].expectedRevision, 3);
  assert.deepEqual(result.value.value, VALID_VALUE);
  assert.equal(result.value.revision, 4);
});

test("settings.save：SETTINGS_CONFLICT 映射为结构化错误并透传双方 revision", async () => {
  const provider = createSettingsProvider({ revision: 5, conflictOnUpdate: true });
  const { ctx, captured } = createContext({ provider });
  apply(ctx, {});
  const result = await rpcOf(captured)("settings.save", { expectedRevision: 3, value: VALID_VALUE });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "SETTINGS_CONFLICT");
  assert.equal(result.error.expected, 3);
  assert.equal(result.error.actual, 5);
});

test("settings.save：非冲突异常原样上抛，不吞错", async () => {
  const provider = createSettingsProvider();
  provider.update = async () => {
    throw new Error("disk full");
  };
  const { ctx, captured } = createContext({ provider });
  apply(ctx, {});
  await assert.rejects(
    () => rpcOf(captured)("settings.save", { expectedRevision: 3, value: VALID_VALUE }),
    /disk full/,
  );
});

test("settings.reset：以空对象调用 replace 清回默认值", async () => {
  const provider = createSettingsProvider({ revision: 3, value: { focusMinutes: 40 } });
  const { ctx, captured } = createContext({ provider });
  apply(ctx, {});
  const result = await rpcOf(captured)("settings.reset", { expectedRevision: 3 });
  assert.equal(result.ok, true);
  assert.equal(provider.calls.replaces.length, 1);
  assert.deepEqual(provider.calls.replaces[0].next, {});
  assert.equal(provider.calls.replaces[0].expectedRevision, 3);
  assert.deepEqual(result.value.value, Config());
});

test("settings.reset：revision 不匹配同样映射 SETTINGS_CONFLICT", async () => {
  const provider = createSettingsProvider({ revision: 4 });
  const { ctx, captured } = createContext({ provider });
  apply(ctx, {});
  const result = await rpcOf(captured)("settings.reset", { expectedRevision: 2 });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "SETTINGS_CONFLICT");
});

test("未知端点直接抛错", async () => {
  const { ctx, captured } = createContext();
  apply(ctx, {});
  await assert.rejects(
    () => rpcOf(captured)("settings.nuke", {}),
    /未知端点/,
  );
});

test("settings 子 fiber 卸载（HMR/停用）后写路径回卷为 settings-unavailable", async () => {
  const provider = createSettingsProvider();
  const { ctx, captured } = createContext({ provider });
  apply(ctx, {});
  const rpc = rpcOf(captured);
  const readBefore = await rpc("settings.read", undefined);
  assert.equal(readBefore.value.revision, 3);
  // settingsCtx.effect(fn) 的 fn() 返回清理函数，模拟子 fiber 销毁。
  const cleanup = captured.effects[0]();
  cleanup();
  const result = await rpc("settings.save", { expectedRevision: 3, value: VALID_VALUE });
  assert.equal(result.error?.code, "settings-unavailable");
  assert.equal(provider.calls.updates.length, 0);
});
