import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseDocument } from "yaml";

export const MIGRATION_FIELD = "legacySettingsMigrationVersion";
export const MIGRATION_VERSION = 1;
export const SETTINGS_FIELDS = [
  "focusMinutes", "breakMinutes", "autoStartBreaks", "autoStartFocus",
  "completionSound", "systemNotifications",
];

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

/** 仅读取宿主旧配置文件；不修改原文件，不解析自定义 YAML 标签。 */
export async function readLegacySettings(home) {
  for (const filename of ["settings.yaml", "settings.yaml.imported"]) {
    let text;
    try {
      text = await readFile(join(home, filename), "utf8");
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    if (Buffer.byteLength(text) > 1024 * 1024) throw new Error("旧设置文件超过 1 MiB，未自动迁移");
    const document = parseDocument(text, { schema: "core", customTags: [] });
    if (document.errors.length || document.warnings.length) {
      // YAML 诊断可能包含其他插件的配置值，日志只输出固定说明。
      throw new Error("旧设置文件包含无效 YAML 或不支持的标签，未自动迁移");
    }
    let data;
    try {
      data = document.toJS({ maxAliasCount: 100 });
    } catch (_error) {
      throw new Error("旧设置文件无法转换为普通数据，未自动迁移");
    }
    if (data == null) return {};
    if (!isRecord(data)) throw new Error("旧设置文件根节点必须是对象");
    const section = Object.hasOwn(data, "dsh-pomodoro") ? data["dsh-pomodoro"] : undefined;
    if (section === undefined) return {};
    if (!isRecord(section)) throw new Error("旧番茄钟设置必须是对象");
    return section;
  }
  return {};
}

/** 字段白名单与既有配置校验一致；错误只记录字段名，不泄漏原始值。 */
export function validateLegacySettings(section, warn) {
  const result = {};
  for (const field of SETTINGS_FIELDS) {
    if (!Object.hasOwn(section, field)) continue;
    const value = section[field];
    const valid = field === "focusMinutes" || field === "breakMinutes"
      ? Number.isInteger(value) && value >= 1 && value <= 240
      : typeof value === "boolean";
    if (valid) result[field] = value;
    else warn(`dsh-pomodoro: 旧设置字段 ${field} 无效，已跳过`);
  }
  return result;
}

/** 配置与完成标记同次写入；由宿主锁内回调再次检查并保留所有显式配置。 */
export async function migrateLegacySettings({ home, editor, entry, warn, active = () => true }) {
  if (entry.options.config?.[MIGRATION_FIELD] >= MIGRATION_VERSION) return;
  const values = validateLegacySettings(await readLegacySettings(home), warn);
  if (!active()) return;
  await editor.edit(entry, (current, inherited) => {
    if (!active() || current[MIGRATION_FIELD] >= MIGRATION_VERSION) return current;
    const missing = Object.fromEntries(Object.entries(values).filter(([field]) =>
      !Object.hasOwn(current, field) && !Object.hasOwn(inherited, field)));
    return { ...current, ...missing, [MIGRATION_FIELD]: MIGRATION_VERSION };
  });
}
