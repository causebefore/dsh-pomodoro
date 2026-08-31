import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

test("客户端声明同时覆盖 rc.2 runtime 与 alpha.2 renderer", () => {
  const inject = manifest.dsh?.client?.inject;
  assert.ok(Array.isArray(inject));
  assert.ok(inject.includes("@deepseek-ai/dsh-client-runtime"));
  assert.ok(inject.includes("@deepseek-ai/dsh-client-ui-renderer"));
});

test("peer 只保留直接使用的 Host 公共契约，并覆盖两版 settings", () => {
  assert.deepEqual(manifest.peerDependencies, {
    "@deepseek-ai/cordis": "^4.0.1",
    "@deepseek-ai/dsh-settings": "^0.1.0-rc.7 || ^0.1.1-rc.1 || ^0.1.2-alpha.2",
  });
  assert.equal(manifest.dependencies["@deepseek-ai/schemastery"], "^3.18.1");
});

test("兼容修复使用 patch 版本发布", () => {
  assert.equal(manifest.version, "0.5.1");
});
