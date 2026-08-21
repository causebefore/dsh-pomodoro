import z from "@deepseek-ai/schemastery";
import { installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";

/** 稳定插件名（DSH 组合行按 id 引用，name 供运行时标识）。 */
export const name = "dsh-pomodoro";

/** 硬依赖 connection；settings 由 installSettingsSection 作为可选能力接入。 */
export const inject = ["connection"];

/** 设置域名空间：与 npm 包名一致，对应 $DSH_HOME/settings.yaml 中的分节名。 */
export const SETTINGS_NAMESPACE = settingsNamespace("dsh-pomodoro");

const MIN_DURATION_MINUTES = 1;
const MAX_DURATION_MINUTES = 240;

/**
 * 番茄钟配置 schema，也是唯一的生产默认值来源。宿主 Loader 用它校验配置并套默认值；
 * 同一 schema 也用于 settings 域名空间的分层解析与用户分节校验。
 */
export const Config = z.object({
  /** 专注时长（分钟，1–240 的整数，默认 25）。 */
  focusMinutes: z.natural().min(MIN_DURATION_MINUTES).max(MAX_DURATION_MINUTES).default(25),
  /** 休息时长（分钟，1–240 的整数，默认 5）。 */
  breakMinutes: z.natural().min(MIN_DURATION_MINUTES).max(MAX_DURATION_MINUTES).default(5),
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
 * 1. 用 installSettingsSection 接入官方三层解析（schema 默认值 → 组合配置 → 用户分节）；
 * 2. settings 服务缺席或卸载时自动退回组合配置，番茄钟主体不进入 PENDING；
 * 3. 包私有 loopback RPC 只暴露当前有效配置，供浏览器在 settingsScope 不可用时降级。
 * @param {import('@deepseek-ai/cordis').Context} ctx - 插件上下文。
 * @param {object} config - 行配置（已由 Config schema 套默认值）。
 */
export function apply(ctx, config) {
  // 正常由 Cordis 先按 Config 校验；再次解析让直接调用也共享同一份默认值来源。
  const entry = Config(config);
  let source = () => entry;
  installSettingsSection(ctx, SETTINGS_NAMESPACE, Config, entry, {
    setSource(current) {
      source = current;
    },
    // Host 半边没有派生资源；浏览器 settingsScope 会观察共享镜像并热更新计时配置。
    onChange() {},
  });

  ctx.connection.rpc.handle("/pomodoro", async (endpoint) => {
    if (endpoint === "config.read") {
      return { ok: true, value: { ...source() } };
    }
    throw new Error(`dsh-pomodoro: 未知端点 ${JSON.stringify(endpoint)}`);
  }, { authority: "loopback" });
}
