import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { registerHooks } from "node:module";
const hooks = registerHooks({ resolve(specifier, context, next) {
  if (specifier === "@deepseek-ai/dsh-settings") return { url: "data:text/javascript,export class SettingsForms {}", shortCircuit: true };
  return next(specifier, context);
} });
const { Config, apply } = await import("../lib/index.js?settings-api=modern");
hooks.deregister();

for (const wrapped of [false, true]) {
  test(`旧设置迁移定位${wrapped ? "新版 Loader 包装" : "旧版直接"} Fiber，并保留显式配置`, async (t) => {
    const home = await mkdtemp(join(tmpdir(), "dsh-pomodoro-loader-"));
    t.after(() => rm(home, { recursive: true, force: true }));
    const original = "dsh-pomodoro:\n  focusMinutes: 42\n  breakMinutes: 8\n";
    await writeFile(join(home, "settings.yaml"), original);
    const ctx = {
      effect: (setup) => setup(),
      connection: { fetch: { register() { return () => {}; } } },
    };
    const fiber = { ctx };
    ctx.fiber = fiber;
    const entry = { fiber: wrapped ? Object.create(fiber) : fiber, options: { config: { breakMinutes: 11 } } };
    const warnings = [];
    let finish;
    const settled = new Promise((resolve) => { finish = resolve; });
    ctx.inject = (names, callback) => {
      if (names[0] !== "configEditor") return;
      callback({
        effect: ctx.effect,
        profileContext: { home },
        loader: { await: async () => {} },
        logger: { warn(...args) { warnings.push(args); finish(); } },
        configEditor: {
          entries: () => [{ fiber: { ctx: { fiber: {} } } }, entry],
          async edit(row, change) {
            assert.equal(row, entry);
            row.options.config = change(row.options.config, {});
            finish();
          },
        },
      });
    };
    apply(ctx, Config({ breakMinutes: 11 }));
    await settled;
    assert.deepEqual(warnings, []);
    assert.deepEqual(entry.options.config, { breakMinutes: 11, focusMinutes: 42, legacySettingsMigrationVersion: 1 });
    assert.equal(await readFile(join(home, "settings.yaml"), "utf8"), original);
  });
}

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
