import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrateLegacySettings, readLegacySettings, MIGRATION_FIELD } from "../lib/migrate-settings.js";

async function fixture(t, original, current = {}, inherited = {}) {
  const home = await mkdtemp(join(tmpdir(), "dsh-pomodoro-migration-"));
  t.after(() => rm(home, { recursive: true, force: true }));
  if (original !== undefined) await writeFile(join(home, "settings.yaml"), original);
  const entry = { options: { config: { ...current } } };
  const warnings = [];
  let writes = 0;
  const editor = { async edit(row, edit) {
    const next = edit(row.options.config, inherited);
    row.options.config = next;
    writes += 1;
  } };
  const run = (extra = {}) => migrateLegacySettings({ home, editor, entry, warn: (value) => warnings.push(value), ...extra });
  return { home, entry, warnings, editor, run, get writes() { return writes; } };
}

test("旧设置原文件优先，六字段白名单，已有配置优先且原文件保持不变", async (t) => {
  const text = "dsh-pomodoro:\n  focusMinutes: 45\n  breakMinutes: 8\n  autoStartFocus: true\n  unknown: ignore\nother-plugin:\n  token: private\n";
  const f = await fixture(t, text, { focusMinutes: 60 }, { breakMinutes: 12 });
  await writeFile(join(f.home, "settings.yaml.imported"), "dsh-pomodoro:\n  autoStartFocus: false\n");
  await f.run();
  assert.deepEqual(f.entry.options.config, { focusMinutes: 60, autoStartFocus: true, [MIGRATION_FIELD]: 1 });
  assert.equal(await readFile(join(f.home, "settings.yaml"), "utf8"), text);
  assert.equal(f.writes, 1);
});

test("宿主已改名的 .imported 文件仍可迁移", async (t) => {
  const f = await fixture(t);
  await writeFile(join(f.home, "settings.yaml.imported"), "dsh-pomodoro:\n  focusMinutes: 40\n");
  await f.run();
  assert.equal(f.entry.options.config.focusMinutes, 40);
});

test("损坏 YAML 与不支持标签不写配置、不标记成功、不泄漏原文", async (t) => {
  for (const text of ["dsh-pomodoro: [", "dsh-pomodoro: !custom secret"]) {
    const f = await fixture(t, text);
    await assert.rejects(() => f.run(), (error) => !error.message.includes("secret"));
    assert.equal(f.writes, 0);
    assert.equal(f.entry.options.config[MIGRATION_FIELD], undefined);
  }
});

test("无效字段跳过，合法布尔值 false 保留", async (t) => {
  const f = await fixture(t, "dsh-pomodoro:\n  focusMinutes: 0\n  breakMinutes: 241\n  autoStartBreaks: false\n  completionSound: secret\n");
  await f.run();
  assert.deepEqual(f.entry.options.config, { autoStartBreaks: false, [MIGRATION_FIELD]: 1 });
  assert.equal(f.warnings.length, 3);
  assert.ok(f.warnings.every((message) => !message.includes("secret")));
});

test("写入失败保持配置且不标记成功，重试可恢复", async (t) => {
  const f = await fixture(t, "dsh-pomodoro:\n  focusMinutes: 45\n");
  await assert.rejects(() => f.run({ editor: { async edit() { throw new Error("write failed"); } } }), /write failed/);
  assert.deepEqual(f.entry.options.config, {});
  await f.run();
  assert.equal(f.entry.options.config[MIGRATION_FIELD], 1);
});

test("重复启动不重新迁移，用户清除设置后不复活旧值", async (t) => {
  const f = await fixture(t, "dsh-pomodoro:\n  focusMinutes: 45\n");
  await f.run();
  delete f.entry.options.config.focusMinutes;
  await f.run();
  assert.deepEqual(f.entry.options.config, { [MIGRATION_FIELD]: 1 });
  assert.equal(f.writes, 1);
});

test("锁内重新检查并发配置，保留其他字段", async (t) => {
  const f = await fixture(t, "dsh-pomodoro:\n  focusMinutes: 45\n  breakMinutes: 8\n");
  const editor = { async edit(row, edit) { row.options.config = edit({ focusMinutes: 90, other: "retained" }, {}); } };
  await f.run({ editor });
  assert.deepEqual(f.entry.options.config, { focusMinutes: 90, breakMinutes: 8, other: "retained", [MIGRATION_FIELD]: 1 });
});

test("读取失败不回退到较旧文件、不写配置", async (t) => {
  const f = await fixture(t);
  const { mkdir } = await import("node:fs/promises");
  await mkdir(join(f.home, "settings.yaml"));
  await writeFile(join(f.home, "settings.yaml.imported"), "dsh-pomodoro:\n  focusMinutes: 40\n");
  await assert.rejects(() => f.run());
  assert.equal(f.writes, 0);
});

test("无旧文件只标记一次，卸载中的插件不继续写入", async (t) => {
  const f = await fixture(t);
  await f.run({ active: () => false });
  assert.equal(f.writes, 0);
  assert.deepEqual(await readLegacySettings(f.home), {});
  await f.run();
  assert.deepEqual(f.entry.options.config, { [MIGRATION_FIELD]: 1 });
});
