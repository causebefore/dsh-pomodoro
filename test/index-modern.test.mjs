import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";
const hooks = registerHooks({ resolve(specifier, context, next) {
  if (specifier === "@deepseek-ai/dsh-settings") return { url: "data:text/javascript,export class SettingsForms {}", shortCircuit: true };
  return next(specifier, context);
} });
const { Config, apply } = await import("../lib/index.js?settings-api=modern");
hooks.deregister();

test("新版 Config 只暴露六个实时字段，迁移标记隐藏且不随清除修改", () => {
  const config = Config({ focusMinutes: 40 });
  assert.equal(config.focusMinutes.get(), 40);
  assert.equal(config.breakMinutes.get(), 5);
  assert.equal(config.legacySettingsMigrationVersion, 0);
  const schema = Config;
  assert.equal(schema.dict.focusMinutes.meta.volatile, true);
  assert.equal(schema.dict.legacySettingsMigrationVersion.meta.hidden, true);
  assert.notEqual(schema.dict.legacySettingsMigrationVersion.meta.volatile, true);
  assert.throws(() => Config({ focusMinutes: 241 }));
});

test("新版只读接口读取实时配置且不暴露内部迁移标记", async () => {
  const config = Config({ focusMinutes: 40, legacySettingsMigrationVersion: 1 });
  let route;
  let policy;
  const ctx = {
    fiber: {},
    effect: (setup) => setup(),
    connection: { fetch: { register(value) { route = value; return () => {}; } } },
    inject(names, callback) {
      if (names[0] === "settings") callback({ effect: (setup) => setup(), settings: {
        configure(value, owner) { policy = { value, owner }; return () => {}; },
      } });
    },
  };
  apply(ctx, config);
  assert.deepEqual(policy, { value: { auto: false }, owner: ctx.fiber });
  assert.equal(route.path, "/api/pomodoro/config");
  const first = await route.fetch();
  assert.equal(first.headers.get("cache-control"), "private, no-store");
  assert.equal((await first.json()).value.focusMinutes, 40);
  config.focusMinutes[Symbol.for("cosmokit.volatile.write")](55);
  const next = (await (await route.fetch()).json()).value;
  assert.equal(next.focusMinutes, 55);
  assert.equal(Object.keys(next).length, 6);
  assert.equal("legacySettingsMigrationVersion" in next, false);
});
