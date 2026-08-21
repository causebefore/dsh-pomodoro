import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";

// Node 半边迁移到 DSH 官方 installSettingsSection 后，包私有 /pomodoro RPC
// 只承担 config.read 降级：settings 存在时返回三层解析值，缺席或卸载时退回
// 组合 entry。CI 仍保持零依赖，两个 @deepseek-ai 导入用语义忠实 mock 接入。

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
      if (typeof value !== "object" || Array.isArray(value)) throw new TypeError("expected object");
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
export function installSettingsSection(ctx, ns, schema, entry, hooks) {
  ctx.inject(["settings"], (settingsCtx) => {
    const scope = settingsCtx.settings.register(ns, schema, { base: entry });
    hooks.setSource(() => scope.get());
    settingsCtx.effect(() => () => {
      hooks.setSource(() => entry);
      hooks.onChange();
    });
    hooks.onChange();
    scope.watch(() => hooks.onChange());
  });
}
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

function createSettingsProvider(initial = {}) {
  let current = Config(initial);
  const watchers = new Set();
  const provider = {
    registrations: [],
    register(ns, schema, options) {
      provider.registrations.push({ ns, schema, options });
      return {
        get: () => current,
        watch(listener) {
          watchers.add(listener);
          return () => watchers.delete(listener);
        },
      };
    },
    publish(next) {
      current = Config(next);
      for (const watcher of watchers) watcher();
    },
  };
  return provider;
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
      if (provider !== undefined) {
        install({
          settings: provider,
          effect(setup) {
            captured.effects.push(setup);
          },
        });
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

test("RPC 注册契约：只读 config.read + loopback authority + 可选 settings 注入", () => {
  const { ctx, captured } = createContext();
  apply(ctx, {});
  const entry = captured.rpc.get("/pomodoro");
  assert.ok(entry);
  assert.equal(typeof entry.handler, "function");
  assert.deepEqual(entry.options, { authority: "loopback" });
  assert.deepEqual(captured.injected, [["settings"]]);
});

test("installSettingsSection：namespace、Config 与组合 entry 作为 base", () => {
  const provider = createSettingsProvider();
  const { ctx } = createContext({ provider });
  apply(ctx, { focusMinutes: 45 });
  assert.equal(provider.registrations.length, 1);
  assert.equal(provider.registrations[0].ns, SETTINGS_NAMESPACE);
  assert.equal(provider.registrations[0].schema, Config);
  assert.deepEqual(provider.registrations[0].options, { base: Config({ focusMinutes: 45 }) });
});

test("config.read：settings 缺席时返回组合 entry", async () => {
  const { ctx, captured } = createContext();
  apply(ctx, { focusMinutes: 40, autoStartBreaks: false });
  const result = await rpcOf(captured)("config.read", undefined);
  assert.deepEqual(result, {
    ok: true,
    value: Config({ focusMinutes: 40, autoStartBreaks: false }),
  });
});

test("config.read：settings 就绪时返回分层解析值并跟随更新", async () => {
  const provider = createSettingsProvider({ focusMinutes: 50 });
  const { ctx, captured } = createContext({ provider });
  apply(ctx, { focusMinutes: 40 });
  const rpc = rpcOf(captured);
  assert.equal((await rpc("config.read", {})).value.focusMinutes, 50);
  provider.publish({ focusMinutes: 55, completionSound: true });
  const updated = await rpc("config.read", {});
  assert.equal(updated.value.focusMinutes, 55);
  assert.equal(updated.value.completionSound, true);
});

test("settings 子 fiber 卸载后 config.read 回退组合 entry", async () => {
  const provider = createSettingsProvider({ focusMinutes: 50 });
  const { ctx, captured } = createContext({ provider });
  apply(ctx, { focusMinutes: 35 });
  assert.equal((await rpcOf(captured)("config.read", {})).value.focusMinutes, 50);
  const cleanup = captured.effects[0]();
  cleanup();
  assert.equal((await rpcOf(captured)("config.read", {})).value.focusMinutes, 35);
});

test("config.read 返回副本，调用方不能改写当前配置源", async () => {
  const { ctx, captured } = createContext();
  apply(ctx, { focusMinutes: 40 });
  const rpc = rpcOf(captured);
  const first = await rpc("config.read", {});
  first.value.focusMinutes = 99;
  assert.equal((await rpc("config.read", {})).value.focusMinutes, 40);
});

test("未知端点直接抛错", async () => {
  const { ctx, captured } = createContext();
  apply(ctx, {});
  await assert.rejects(() => rpcOf(captured)("settings.save", {}), /未知端点/);
});
