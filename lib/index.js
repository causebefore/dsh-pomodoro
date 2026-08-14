import z from "@deepseek-ai/schemastery";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";

/** 稳定插件名（DSH 组合行按 id 引用，name 供运行时标识）。 */
export const name = "dsh-pomodoro";

/** 硬依赖 connection；settings 仅增强持久化能力，缺席时仍使用 schema 配置。 */
export const inject = ["connection"];

/** 设置域名空间：与 npm 包名一致，对应 $DSH_HOME/settings.yaml 中的分节名。 */
export const SETTINGS_NAMESPACE = settingsNamespace("dsh-pomodoro");

/**
 * 番茄钟配置 schema，也是唯一的生产默认值来源。宿主 Loader 用它校验配置并套默认值；
 * 同一 schema 也用于 settings 域名空间的分层解析与用户分节校验。
 */
export const Config = z.object({
  /** 专注时长（分钟，正整数，默认 25）。 */
  focusMinutes: z.natural().min(1).default(25),
  /** 休息时长（分钟，正整数，默认 5）。 */
  breakMinutes: z.natural().min(1).default(5),
  /** 专注结束后自动开始休息（默认开启）。 */
  autoStartBreaks: z.boolean().default(true),
  /** 休息结束后自动开始下一轮专注（默认关闭）。 */
  autoStartFocus: z.boolean().default(false),
  /** 阶段结束时播放内置低沉提示音（默认关闭）。 */
  completionSound: z.boolean().default(false),
  /** 页面在后台时发送浏览器系统通知（默认关闭，仍需当前浏览器授权）。 */
  systemNotifications: z.boolean().default(false),
});

/**
 * 番茄钟 Node 半边：
 * 1. 始终经包私有 unary RPC 通道（/pomodoro）把有效配置暴露给浏览器半边；
 * 2. settings 服务存在时，由独立子 fiber 注册域名空间 `dsh-pomodoro`（官方三层解析：
 *    schema 默认值 → 可选组合配置 → settings.yaml 用户分节）；
 * 3. settings 缺席时，RPC 退回 Config 解析值，番茄钟主体不进入 PENDING。
 * 通道与可选域名空间注册都归属各自 fiber，插件停用 / 更新时自动撤销。
 * @param {import('@deepseek-ai/cordis').Context} ctx - 插件上下文。
 * @param {object} config - 行配置（已由 Config schema 套默认值）。
 */
export function apply(ctx, config) {
  // 正常由 Cordis 先按 Config 校验；再次解析让直接调用也共享同一份默认值来源。
  const entry = Config(config);
  // 可选 settings 能力单独挂在依赖子 fiber 上：缺席时只让该子项 PENDING，
  // 服务在组合/HMR 中出现、消失时，命名空间也随子 fiber 自动注册、回卷。
  let settingsBinding = null;
  ctx.inject(["settings"], function installPomodoroSettings(settingsCtx) {
    const scope = settingsCtx.settings.register(SETTINGS_NAMESPACE, Config, { base: entry });
    const binding = { provider: settingsCtx.settings, scope };
    settingsBinding = binding;
    settingsCtx.effect(() => () => {
      if (settingsBinding === binding) settingsBinding = null;
    }, "dsh-pomodoro: clear optional settings binding");
  });

  const activeSettings = () => {
    const binding = settingsBinding;
    if (binding === null) return null;
    const descriptor = binding.provider.describe({ redactSecrets: true }).find((item) => item.ns === SETTINGS_NAMESPACE);
    return descriptor === undefined ? null : { binding, descriptor };
  };
  const fallbackSettingsView = () => ({
    value: { ...entry },
    user: null,
    revision: 0,
    writable: false,
  });
  const settingsView = () => {
    const current = activeSettings();
    if (current === null) return fallbackSettingsView();
    const { descriptor } = current;
    return {
      value: descriptor.value,
      user: descriptor.user ?? null,
      revision: descriptor.revision,
      writable: true,
    };
  };
  const settingsUnavailable = () => ({
    ok: false,
    error: {
      code: "settings-unavailable",
      message: "当前组合没有可用的 settings 域",
    },
  });
  const invalidSettingsRequest = () => ({
    ok: false,
    error: {
      code: "invalid-request",
      message: "设置写入缺少有效的 expectedRevision",
    },
  });
  const settingsConflict = (error) => ({
    ok: false,
    error: {
      code: "SETTINGS_CONFLICT",
      message: "设置已在其他位置更新",
      expected: error.expected,
      actual: error.actual,
    },
  });
  const expectedRevisionOf = (payload) => {
    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) return null;
    const revision = payload.expectedRevision;
    return Number.isSafeInteger(revision) && revision >= 0 ? revision : null;
  };

  ctx.connection.rpc.handle("/pomodoro", async (endpoint, payload) => {
    if (endpoint === "settings.read") {
      return { ok: true, value: settingsView() };
    }
    if (endpoint === "settings.save") {
      const current = activeSettings();
      if (current === null) return settingsUnavailable();
      const expectedRevision = expectedRevisionOf(payload);
      if (expectedRevision === null) return invalidSettingsRequest();
      const next = Config(payload.value);
      try {
        await current.binding.provider.update(SETTINGS_NAMESPACE, {
          focusMinutes: next.focusMinutes,
          breakMinutes: next.breakMinutes,
          autoStartBreaks: next.autoStartBreaks,
          autoStartFocus: next.autoStartFocus,
          completionSound: next.completionSound,
          systemNotifications: next.systemNotifications,
        }, expectedRevision);
      } catch (error) {
        if (error?.code === "SETTINGS_CONFLICT") return settingsConflict(error);
        throw error;
      }
      return { ok: true, value: settingsView() };
    }
    if (endpoint === "settings.reset") {
      const current = activeSettings();
      if (current === null) return settingsUnavailable();
      const expectedRevision = expectedRevisionOf(payload);
      if (expectedRevision === null) return invalidSettingsRequest();
      try {
        await current.binding.provider.replace(SETTINGS_NAMESPACE, {}, expectedRevision);
      } catch (error) {
        if (error?.code === "SETTINGS_CONFLICT") return settingsConflict(error);
        throw error;
      }
      return { ok: true, value: settingsView() };
    }
    throw new Error(`dsh-pomodoro: 未知端点 ${JSON.stringify(endpoint)}`);
  }, { authority: "loopback" });
}
