#!/usr/bin/env node
/**
 * dsh-pomodoro 发布面安全审查（静态规则层）。
 *
 * 规则维度取自 DSH 社区讨论沉淀的插件威胁模型与扫描器启发式：
 * - deepseek-harness#454（插件模型安全审计：进程内全权限、安装链无校验）
 * - deepseek-harness#587 / #3421（cordis.patch.yml 可越权禁用核心行）
 * - deepseek-harness#1770（dsh.so 1309 插件扫描：硬编码密钥/外传/混淆/破坏性命令）
 * - deepseek-harness#1663（dsh-plugin-vetting 15 条启发式）
 * - deepseek-harness#2215（plugin_vet 供应链门禁）
 *
 * 零依赖、纯静态，从不执行被审代码。只审 npm 发布面（files 白名单 + package.json +
 * cordis.patch.yml），避免 vendor/ 缓存/日志等本地文件淹没真实信号。
 * 退出码：0 = 干净；1 = 存在 FAIL（可作 CI 门禁）。
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const findings = [];

const fail = (rule, where, detail) => findings.push({ level: "FAIL", rule, where, detail });
const warn = (rule, where, detail) => findings.push({ level: "WARN", rule, where, detail });
const note = (rule, where, detail) => findings.push({ level: "INFO", rule, where, detail });

/** 发布面文件清单（与 package.json files + npm 自动项对齐）。 */
const PUBLISHED = [
  "lib/index.js",
  "lib/client.js",
  "cordis.patch.yml",
  "README.md",
  "README.zh.md",
  "THIRD_PARTY_NOTICES.md",
];

const sources = Object.fromEntries(
  PUBLISHED.filter((f) => f.endsWith(".js")).map((f) => [f, readFileSync(join(root, f), "utf8")]),
);

// ---------------------------------------------------------------------------
// 1. 逐行启发式规则（对齐 dsh.so 扫描 / dsh-plugin-vetting / plugin_vet 的维度）
// ---------------------------------------------------------------------------
const LINE_RULES = [
  {
    rule: "secret/hardcoded-key",
    pattern: /(sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{12,}|api[_-]?key\s*[=:]\s*["'][^"']{8,}["']|Bearer\s+[A-Za-z0-9\-_.]{20,})/i,
    level: "FAIL",
    detail: "疑似硬编码密钥",
  },
  {
    rule: "net/browser-egress",
    pattern: /\bfetch\s*\(|new\s+XMLHttpRequest|new\s+WebSocket\s*\(|sendBeacon\s*\(/,
    level: "FAIL",
    detail: "浏览器网络出口（fetch/XHR/WebSocket/sendBeacon）",
  },
  {
    rule: "net/node-module",
    pattern: /require\s*\(\s*["'](node:)?(http|https|net|dgram|dns|tls)["']\]|from\s+["'](node:)?(http|https|net|dgram|dns|tls)["']/,
    level: "FAIL",
    detail: "Node 网络模块引入",
  },
  {
    rule: "net/relay-domain",
    pattern: /(ngrok\.io|webhook\.site|requestbin|pastebin\.com)/i,
    level: "FAIL",
    detail: "外传中继域名",
  },
  {
    rule: "exec/dynamic-code",
    pattern: /\beval\s*\(|new\s+Function\s*\(/,
    level: "FAIL",
    detail: "动态代码执行（eval / new Function）",
  },
  {
    rule: "obfuscation/from-char-code",
    pattern: /fromCharCode|unescape\s*\(/,
    level: "FAIL",
    detail: "混淆手法（fromCharCode / unescape）",
  },
  {
    rule: "exec/child-process",
    pattern: /child_process|spawnSync|execSync|spawn\s*\(/,
    level: "FAIL",
    detail: "子进程调用",
  },
  {
    rule: "fs/node-module",
    pattern: /require\s*\(\s*["'](node:)?fs["']\]|from\s+["'](node:)?fs["']/,
    level: "FAIL",
    detail: "Node 文件系统模块引入",
  },
  {
    rule: "cred/access",
    pattern: /process\.env|\.credentials|credentials\.ya?ml|\/proc\/\d+\/environ/i,
    level: "FAIL",
    detail: "凭据 / 环境变量访问",
  },
  {
    rule: "persist/mechanism",
    pattern: /(schtasks|crontab|authorized_keys|CurrentVersion\\\\Run|launchd|systemd)/i,
    level: "FAIL",
    detail: "系统持久化机制",
  },
  {
    rule: "destructive/command",
    pattern: /(rm\s+-rf\s+\/|chmod\s+777|mkfs|format\s+[cC]:|del\s+\/[fqs])/,
    level: "FAIL",
    detail: "破坏性命令",
  },
  {
    rule: "dom/injection-sink",
    pattern: /\.innerHTML|\.outerHTML|document\.write|dangerouslySetInnerHTML|insertAdjacentHTML/,
    level: "FAIL",
    detail: "DOM 注入 sink",
  },
  {
    rule: "dom/long-base64",
    pattern: /[A-Za-z0-9+/]{300,}={0,2}/,
    level: "WARN",
    detail: "超长 base64 段（≥300 字符）",
    // 已知豁免：完成提示音为内嵌 MP3（ID3 头），见 docs/security-review.zh.md 误报台账。
    exempt: (file, line) => file === "lib/client.js" && line.includes("COMPLETION_SOUND_BASE64"),
  },
];

for (const [file, content] of Object.entries(sources)) {
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    for (const { rule, pattern, level, detail, exempt } of LINE_RULES) {
      if (!pattern.test(line)) continue;
      if (exempt?.(file, line)) {
        note(rule, `${file}:${idx + 1}`, `${detail}（已知豁免项）`);
        return;
      }
      const push = level === "FAIL" ? fail : warn;
      push(rule, `${file}:${idx + 1}`, `${detail} :: ${line.trim().slice(0, 120)}`);
    }
  });
}

// ---------------------------------------------------------------------------
// 2. 结构性契约检查
// ---------------------------------------------------------------------------
// 2a. 跨窗口通信只允许宿主 runtimeChannel（#1663：window.open / 任意 postMessage 属外传面）。
{
  const content = sources["lib/client.js"];
  const offenders = content
    .split(/\r?\n/)
    .map((line, idx) => ({ line, idx: idx + 1 }))
    .filter(({ line }) => /postMessage\s*\(|window\.open\s*\(/.test(line))
    .filter(({ line }) => !/runtimeChannel\??\.postMessage/.test(line));
  if (offenders.length === 0) {
    note("dom/cross-window", "lib/client.js", "跨窗口通信仅经宿主 runtimeChannel（回环通道）");
  } else {
    for (const { line, idx } of offenders) {
      fail("dom/cross-window", `lib/client.js:${idx}`, `非 runtimeChannel 的跨窗口调用 :: ${line.trim().slice(0, 120)}`);
    }
  }
}

// 2b. localStorage 键必须带插件命名空间前缀。
{
  const content = sources["lib/client.js"];
  const keyLiterals = [...content.matchAll(/STORAGE_KEY\s*=\s*"([^"]+)"/g)].map((m) => m[1]);
  // 直接调用（绕过常量声明）也检查：内联字面量键同样必须带前缀。
  const inlineKeys = [...content.matchAll(/\.(?:setItem|getItem|removeItem)\(\s*"([^"]+)"/g)].map((m) => m[1]);
  const bad = [...keyLiterals, ...inlineKeys].filter((key) => !key.startsWith("dsh-pomodoro."));
  if (bad.length > 0) {
    fail("storage/namespace", "lib/client.js", `localStorage 键缺少 dsh-pomodoro. 前缀 :: ${bad.join(", ")}`);
  } else if (keyLiterals.length > 0) {
    note("storage/namespace", "lib/client.js", `localStorage 键均已命名空间化 :: ${keyLiterals.join(", ")}`);
  }
}

// 2c. RPC 通道必须逐个声明 loopback authority（#454：loopback RPC 是插件唯一对外服务面）。
// ≤0.1.1 宿主靠它钉死通道；0.1.2 起宿主对所有通道统一围栏（受信来源 + 浏览器会话认证），该选项被忽略但声明保留。
{
  const content = sources["lib/index.js"];
  const registrations = content.split("rpc.handle(").slice(1);
  if (registrations.length === 0) {
    note("rpc/loopback", "lib/index.js", "未注册任何 RPC 通道");
  }
  // 从 "(" 之后做括号配平截取完整调用（跳过字符串与注释），避免被 handler 体内的 ");" 截断。
  const sliceCall = (chunk) => {
    let depth = 1;
    let quote = null;
    let comment = null;
    for (let i = 0; i < chunk.length && depth > 0; i++) {
      const ch = chunk[i];
      const next = chunk[i + 1];
      if (comment === "line") {
        if (ch === "\n") comment = null;
      } else if (comment === "block") {
        if (ch === "*" && next === "/") { comment = null; i++; }
      } else if (quote) {
        if (ch === "\\") i++;
        else if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'" || ch === "`") {
        quote = ch;
      } else if (ch === "/" && next === "/") {
        comment = "line"; i++;
      } else if (ch === "/" && next === "*") {
        comment = "block"; i++;
      } else if (ch === "(") {
        depth++;
      } else if (ch === ")") {
        depth--;
      }
    }
    return chunk.slice(0, depth === 0 ? chunk.lastIndexOf(")") : chunk.length);
  };
  registrations.forEach((chunk, i) => {
    const body = sliceCall(chunk);
    const route = chunk.slice(chunk.indexOf('"') + 1, chunk.indexOf('"', chunk.indexOf('"') + 1));
    if (!/authority:\s*"loopback"/.test(body)) {
      fail("rpc/loopback", "lib/index.js", `RPC 通道 ${route || `#${i + 1}`} 未声明 authority: "loopback"`);
    } else {
      note("rpc/loopback", "lib/index.js", `RPC 通道 ${route || `#${i + 1}`} 已声明 authority: "loopback"（≤0.1.1 生效；0.1.2 宿主统一围栏）`);
    }
  });
}

// 2d. cordis.patch.yml 只允许纯 insert（#587/#3421：replace/delete/disabled 可越权改核心行）。
{
  const patch = readFileSync(join(root, "cordis.patch.yml"), "utf8");
  const coreIds = /(fs-sandbox|bash-sandbox|pwsh-sandbox|tool-pwsh|tool-fs-search|approval|credentials|sandbox)/;
  const lines = patch.split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (/^\s*-\s*(replace|delete):/.test(line)) {
      fail("patch/only-insert", `cordis.patch.yml:${idx + 1}`, `出现 ${line.trim()}：组合层只允许 insert`);
    }
    if (/disabled:\s*true/.test(line)) {
      fail("patch/only-insert", `cordis.patch.yml:${idx + 1}`, "禁止通过组合补丁禁用任意行");
    }
    if (coreIds.test(line)) {
      fail("patch/only-insert", `cordis.patch.yml:${idx + 1}`, `组合补丁引用核心行标识 :: ${line.trim()}`);
    }
  });
  if (/^\s*-\s*insert:/.test(patch) && !/^\s*-\s*(replace|delete):/m.test(patch)) {
    note("patch/only-insert", "cordis.patch.yml", "组合补丁为纯 insert，未触碰核心行");
  }
}

// 2e. package.json 供应链检查（#2215 plugin_vet / #1770 typosquat 维度）。
{
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const trusted = (name) => name.startsWith("@deepseek-ai/") || name === "react" || name === "react-dom";
  const deps = { ...pkg.dependencies, ...pkg.peerDependencies };
  const untrusted = Object.keys(deps).filter((name) => !trusted(name));
  if (untrusted.length > 0) {
    fail("supplychain/dependency-allowlist", "package.json", `依赖超出官方域允许列表 :: ${untrusted.join(", ")}`);
  } else {
    note("supplychain/dependency-allowlist", "package.json", `全部依赖属官方域（@deepseek-ai/* / react）：${Object.keys(deps).length} 个`);
  }

  const installScripts = ["preinstall", "install", "postinstall"];
  const lifecycle = [...installScripts, "prepare"].filter((s) => pkg.scripts?.[s]);
  const risky = lifecycle.filter((s) => installScripts.includes(s));
  if (risky.length > 0) {
    fail("supplychain/lifecycle-scripts", "package.json", `存在安装期生命周期脚本 :: ${risky.join(", ")}`);
  } else if (lifecycle.length > 0) {
    warn("supplychain/lifecycle-scripts", "package.json", `存在 ${lifecycle.join(", ")} 脚本（构建型，可接受但需人工确认内容）`);
  } else {
    note("supplychain/lifecycle-scripts", "package.json", "无安装期生命周期脚本");
  }

  const requiredFiles = ["lib/index.js", "lib/client.js", "cordis.patch.yml"];
  const missingFromFiles = requiredFiles.filter((f) => !pkg.files?.includes(f));
  const missingOnDisk = (pkg.files ?? []).filter((f) => !existsSync(join(root, f)));
  if (missingFromFiles.length > 0) {
    fail("supplychain/files-allowlist", "package.json", `files 白名单缺少必需产物 :: ${missingFromFiles.join(", ")}`);
  } else if (missingOnDisk.length > 0) {
    fail("supplychain/files-allowlist", "package.json", `files 白名单包含不存在的文件 :: ${missingOnDisk.join(", ")}`);
  } else {
    note("supplychain/files-allowlist", "package.json", `发布白名单 ${pkg.files.length} 项与产物一致`);
  }
}

// ---------------------------------------------------------------------------
// 输出
// ---------------------------------------------------------------------------
const order = { FAIL: 0, WARN: 1, INFO: 2 };
findings.sort((a, b) => order[a.level] - order[b.level]);
for (const { level, rule, where, detail } of findings) {
  const icon = level === "FAIL" ? "✗" : level === "WARN" ? "⚠" : "✓";
  console.log(`${icon} [${level}] ${rule}  ${where}`);
  console.log(`    ${detail}`);
}
const counts = { FAIL: 0, WARN: 0, INFO: 0 };
for (const f of findings) counts[f.level] += 1;
console.log(`\n合计：${counts.FAIL} FAIL / ${counts.WARN} WARN / ${counts.INFO} INFO`);
if (counts.FAIL > 0) {
  console.error("security-scan: 存在 FAIL 项，禁止发布。");
  process.exit(1);
}
console.log("security-scan: 发布面干净。");
