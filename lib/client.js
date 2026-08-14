// 番茄钟面板（常驻版）客户端 bundle。
// 手写构建产物，遵循官方客户端模块系统格式：
// window.__ModuleLoader__.load({ id, factory }) —— factory 只在物化时运行一次，
// 依赖经同步 require 解析（react 由外壳静态注册表提供）。
window.__ModuleLoader__.load({
  id: "dsh-pomodoro",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var react = require("react");
    var uiPrimitives = require("@deepseek-ai/dsh-client-ui-primitives");
    var Toast = uiPrimitives.Toast;

    const POMODORO_LOCALE_NS = "dsh-pomodoro";
    const POMODORO_MESSAGES = {
      zh: {
        "app.name": "番茄钟",
        "app.title": "🍅 番茄钟",
        "phase.focus": "专注",
        "phase.focusing": "专注中",
        "phase.break": "休息",
        "phase.breaking": "休息中",
        "action.start": "开始",
        "action.pause": "暂停",
        "action.reset": "重置",
        "action.skip": "跳过",
        "action.expand": "展开",
        "action.mini": "迷你",
        "action.close": "关闭",
        "action.retry": "重试",
        "action.retrying": "重试中…",
        "action.preview": "试听",
        "action.save": "保存",
        "action.saving": "保存中…",
        "action.clear": "清除自定义设置",
        "action.reload": "重新加载",
        "action.reloading": "加载中…",
        "panel.switchToMini": "切换到迷你模式",
        "panel.expandAria": "展开番茄钟面板",
        "panel.closeAria": "关闭番茄钟面板",
        "timer.remaining": "{phase}，剩余 {time}",
        "timer.completed": "已完成 🍅 × {count}",
        "duration.second.one": "{count} 秒",
        "duration.second.other": "{count} 秒",
        "duration.minute.one": "{count} 分钟",
        "duration.minute.other": "{count} 分钟",
        "completion.focus.auto": "专注完成 · {duration}休息已开始",
        "completion.focus.manual": "专注完成 · 点击开始休息",
        "completion.break.auto": "休息结束 · 下一轮专注已开始",
        "completion.break.manual": "休息结束 · 准备好后开始下一轮",
        "notification.focus.title": "番茄钟：专注完成",
        "notification.focus.auto": "{duration}休息已开始",
        "notification.focus.manual": "返回 DSH 后点击开始休息",
        "notification.break.title": "番茄钟：休息结束",
        "notification.break.auto": "下一轮专注已开始",
        "notification.break.manual": "返回 DSH 后开始下一轮专注",
        "settings.remoteUnavailable": "设置不可用：远程浏览器不提供持久化设置（仅 loopback 可用）。",
        "settings.loading": "加载设置中…",
        "settings.loadFailed": "设置加载失败：{message}",
        "settings.readOnly": "当前设置为只读；番茄钟仍使用宿主解析配置，但不能在这里持久化修改。",
        "settings.externalUpdate": "设置已在其他位置更新，草稿已保留。",
        "settings.notification.unsupportedHelp": "当前浏览器不支持系统通知；DSH 内提醒仍可用。",
        "settings.notification.insecureHelp": "当前地址不是安全上下文；请使用 localhost、127.0.0.1 或 HTTPS。",
        "settings.notification.deniedHelp": "浏览器已阻止通知；请在地址栏的网站设置中改为允许。",
        "settings.notification.grantedEnabledHelp": "已授权；仅在 DSH 页面处于后台时发送。",
        "settings.notification.grantedDisabledHelp": "浏览器已授权；开启并保存后在后台发送。",
        "settings.notification.promptHelp": "首次开启会请求浏览器授权；DSH 内提醒始终保留。",
        "settings.sound.unavailableHelp": "当前浏览器不支持音频提示；DSH 内提醒仍可用。",
        "settings.focusMinutes": "专注时长（分钟）",
        "settings.breakMinutes": "休息时长（分钟）",
        "settings.autoStartBreaks": "自动开始休息",
        "settings.autoStartFocus": "自动开始下一轮专注",
        "settings.completionSound": "阶段结束时播放提示音",
        "settings.systemNotifications": "后台时发送系统通知",
        "settings.permissionWaiting": "等待浏览器授权…",
        "settings.card.expandAria": "展开{name}设置",
        "settings.card.collapseAria": "收起{name}设置",
        "settings.card.description": "配置专注与休息循环。",
        "settings.conflict.save.noDraft": "设置已在其他位置更新，保存未执行。",
        "settings.conflict.save.withDraft": "设置已在其他位置更新，保存未执行，草稿已保留。",
        "settings.conflict.clear.noDraft": "设置已在其他位置更新，清除未执行。",
        "settings.conflict.clear.withDraft": "设置已在其他位置更新，清除未执行，草稿已保留。",
        "notice.sound.unsupported": "当前浏览器不支持音频提示；DSH 内提醒仍会显示。",
        "notice.sound.blocked": "浏览器暂未允许播放提示音；可点击“试听”后重试。",
        "notice.sound.previewStarted": "试听已开始",
        "notice.sound.previewFailed": "提示音试听失败：{message}",
        "notice.notification.unsupported": "当前浏览器不支持系统通知；DSH 内提醒仍会显示。",
        "notice.notification.insecure": "当前地址不允许系统通知；DSH 内提醒仍会显示。",
        "notice.notification.denied": "浏览器已阻止通知，请先在网站设置中重新允许。",
        "notice.notification.requestFailed": "通知授权请求失败；DSH 内提醒仍会显示。",
        "notice.notification.granted": "浏览器已授权；保存设置后启用系统通知。",
        "notice.notification.notGranted": "浏览器未允许通知；DSH 内提醒仍会显示。",
        "notice.reload.success": "已重新加载最新设置",
        "notice.reload.failed": "重新加载失败，当前草稿仍已保留：{message}",
        "notice.validation.duration": "请输入 {min}–{max} 的整数分钟数",
        "notice.save.success": "已保存",
        "notice.save.failed": "保存失败：{message}",
        "notice.clear.success": "已清除自定义设置",
        "notice.clear.failed": "清除失败：{message}",
        "rpc.settingsUnavailable": "当前组合没有可用的 settings 域。",
        "rpc.invalidRequest": "设置请求缺少有效的版本信息。",
        "rpc.invalidValue": "番茄钟设置值格式无效。",
        "rpc.conflict": "设置已在其他位置更新。",
        "audio.unsupported": "当前浏览器不支持音频提示。",
        "audio.blocked": "浏览器尚未允许播放提示音。",
      },
      en: {
        "app.name": "Pomodoro",
        "app.title": "🍅 Pomodoro",
        "phase.focus": "Focus",
        "phase.focusing": "Focusing",
        "phase.break": "Break",
        "phase.breaking": "On break",
        "action.start": "Start",
        "action.pause": "Pause",
        "action.reset": "Reset",
        "action.skip": "Skip",
        "action.expand": "Expand",
        "action.mini": "Mini",
        "action.close": "Close",
        "action.retry": "Retry",
        "action.retrying": "Retrying…",
        "action.preview": "Preview",
        "action.save": "Save",
        "action.saving": "Saving…",
        "action.clear": "Clear custom settings",
        "action.reload": "Reload",
        "action.reloading": "Loading…",
        "panel.switchToMini": "Switch to mini mode",
        "panel.expandAria": "Expand the Pomodoro panel",
        "panel.closeAria": "Close the Pomodoro panel",
        "timer.remaining": "{phase}, {time} remaining",
        "timer.completed": "Completed 🍅 × {count}",
        "duration.second.one": "{count} second",
        "duration.second.other": "{count} seconds",
        "duration.minute.one": "{count} minute",
        "duration.minute.other": "{count} minutes",
        "completion.focus.auto": "Focus complete · Your break has started ({duration})",
        "completion.focus.manual": "Focus complete · Click Start to begin your break",
        "completion.break.auto": "Break complete · The next focus session has started",
        "completion.break.manual": "Break complete · Start the next focus session when ready",
        "notification.focus.title": "Pomodoro: Focus complete",
        "notification.focus.auto": "Your break has started ({duration})",
        "notification.focus.manual": "Return to DSH and click Start to begin your break",
        "notification.break.title": "Pomodoro: Break complete",
        "notification.break.auto": "The next focus session has started",
        "notification.break.manual": "Return to DSH to start the next focus session",
        "settings.remoteUnavailable": "Settings are unavailable: persistent settings are only available over a loopback connection.",
        "settings.loading": "Loading settings…",
        "settings.loadFailed": "Failed to load settings: {message}",
        "settings.readOnly": "These settings are read-only. Pomodoro will continue using the host-resolved configuration, but changes cannot be saved here.",
        "settings.externalUpdate": "Settings changed elsewhere. Your draft has been preserved.",
        "settings.notification.unsupportedHelp": "This browser does not support system notifications. In-app reminders remain available.",
        "settings.notification.insecureHelp": "This page is not in a secure context. Use localhost, 127.0.0.1, or HTTPS.",
        "settings.notification.deniedHelp": "Notifications are blocked. Allow them in your browser's site settings.",
        "settings.notification.grantedEnabledHelp": "Permission granted. Notifications are sent only while DSH is in the background.",
        "settings.notification.grantedDisabledHelp": "Permission granted. Enable and save this setting to send notifications in the background.",
        "settings.notification.promptHelp": "Your browser will request permission the first time you enable this setting. In-app reminders always remain available.",
        "settings.sound.unavailableHelp": "This browser does not support audio alerts. In-app reminders remain available.",
        "settings.focusMinutes": "Focus duration (minutes)",
        "settings.breakMinutes": "Break duration (minutes)",
        "settings.autoStartBreaks": "Start breaks automatically",
        "settings.autoStartFocus": "Start the next focus session automatically",
        "settings.completionSound": "Play a sound when a phase ends",
        "settings.systemNotifications": "Send system notifications in the background",
        "settings.permissionWaiting": "Waiting for browser permission…",
        "settings.card.expandAria": "Expand {name} settings",
        "settings.card.collapseAria": "Collapse {name} settings",
        "settings.card.description": "Configure focus and break cycles.",
        "settings.conflict.save.noDraft": "Settings changed elsewhere, so the save was not applied.",
        "settings.conflict.save.withDraft": "Settings changed elsewhere, so the save was not applied. Your draft has been preserved.",
        "settings.conflict.clear.noDraft": "Settings changed elsewhere, so custom settings were not cleared.",
        "settings.conflict.clear.withDraft": "Settings changed elsewhere, so custom settings were not cleared. Your draft has been preserved.",
        "notice.sound.unsupported": "This browser does not support audio alerts. In-app reminders will still appear.",
        "notice.sound.blocked": "Audio playback is not allowed yet. Click Preview, then try again.",
        "notice.sound.previewStarted": "Sound preview started",
        "notice.sound.previewFailed": "Sound preview failed: {message}",
        "notice.notification.unsupported": "This browser does not support system notifications. In-app reminders will still appear.",
        "notice.notification.insecure": "This page cannot send system notifications. In-app reminders will still appear.",
        "notice.notification.denied": "Notifications are blocked. Allow them in your browser's site settings, then try again.",
        "notice.notification.requestFailed": "The notification permission request failed. In-app reminders will still appear.",
        "notice.notification.granted": "Permission granted. Save your settings to enable system notifications.",
        "notice.notification.notGranted": "Notification permission was not granted. In-app reminders will still appear.",
        "notice.reload.success": "Latest settings reloaded",
        "notice.reload.failed": "Failed to reload. Your current draft has been preserved: {message}",
        "notice.validation.duration": "Enter a whole number of minutes from {min} to {max}",
        "notice.save.success": "Saved",
        "notice.save.failed": "Failed to save: {message}",
        "notice.clear.success": "Custom settings cleared",
        "notice.clear.failed": "Failed to clear custom settings: {message}",
        "rpc.settingsUnavailable": "Settings are unavailable in the current host configuration.",
        "rpc.invalidRequest": "The settings request is missing valid revision information.",
        "rpc.invalidValue": "The Pomodoro settings value is invalid.",
        "rpc.conflict": "Settings changed elsewhere.",
        "audio.unsupported": "This browser does not support audio alerts.",
        "audio.blocked": "The browser has not allowed audio playback.",
      },
    };

    function assertLocaleMessages(messages) {
      const sourceKeys = Object.keys(messages.zh).sort();
      const sourceSet = new Set(sourceKeys);
      for (const localeId of ["zh", "en"]) {
        const dict = messages[localeId];
        const keys = Object.keys(dict).sort();
        const missing = sourceKeys.filter((key) => !(key in dict));
        const extra = keys.filter((key) => !sourceSet.has(key));
        const invalid = keys.filter((key) => typeof dict[key] !== "string" || dict[key].length === 0);
        if (missing.length > 0 || extra.length > 0 || invalid.length > 0) {
          throw new Error(`dsh-pomodoro: locale ${localeId} mismatch (missing: ${missing.join(", ") || "none"}; extra: ${extra.join(", ") || "none"}; invalid: ${invalid.join(", ") || "none"})`);
        }
      }
    }

    assertLocaleMessages(POMODORO_MESSAGES);

    // 包私有样式：主题色走 --dsw-alias-* 令牌，自动适配明暗主题。
    const pomoCss = `
.pomo-panel { position: fixed; right: 24px; bottom: 24px; width: 244px; background: var(--dsw-alias-bg-overlay); color: var(--dsw-alias-label-primary); border: 1px solid var(--dsw-alias-border-l1); border-radius: 14px; box-shadow: var(--dsw-shadow-lv3); font-family: var(--dsw-font-family); overflow: hidden; user-select: none; touch-action: none; }
.pomo-panel-compact { width: 184px; border-radius: 12px; }
.pomo-panel-moved { right: auto; bottom: auto; }
.pomo-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; cursor: grab; border-bottom: 1px solid var(--dsw-alias-border-l1); }
.pomo-header:active { cursor: grabbing; }
.pomo-title { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: var(--dsw-font-xs-strong-13); color: var(--dsw-alias-label-secondary); }
.pomo-header-actions { flex: none; display: flex; align-items: center; gap: 2px; }
.pomo-close { border: none; background: transparent; cursor: pointer; color: var(--dsw-alias-label-tertiary); font: var(--dsw-font-xxs-12); padding: 2px 7px; border-radius: 6px; }
.pomo-close:hover { background: var(--dsw-alias-interactive-bg-hover); }
.pomo-panel-compact .pomo-header { padding: 6px 8px 4px; border-bottom: none; }
.pomo-panel-compact .pomo-title { color: var(--dsw-alias-state-business-primary); }
.pomo-panel-compact .pomo-title-break { color: var(--dsw-alias-state-success-primary); }
.pomo-mini-body { display: flex; align-items: center; gap: 8px; padding: 2px 8px 8px; }
.pomo-mini-time { flex: 1; min-width: 0; font: 700 22px/28px var(--dsw-font-family); font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
.pomo-mini-action { flex: none; padding: 4px 9px; }
.pomo-body { padding: 14px 12px 12px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.pomo-ring-wrap { position: relative; width: 128px; height: 128px; }
.pomo-ring { transform: rotate(-90deg); }
.pomo-ring-bg { fill: none; stroke: var(--dsw-alias-border-l2); stroke-width: 8; }
.pomo-ring-fg { fill: none; stroke: var(--dsw-alias-state-business-primary); stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 0.25s linear; }
.pomo-ring-break { stroke: var(--dsw-alias-state-success-primary); }
.pomo-time { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font: 700 26px/32px var(--dsw-font-family); font-variant-numeric: tabular-nums; }
.pomo-phase { font: var(--dsw-font-xxs-strong-12); color: var(--dsw-alias-state-business-primary); }
.pomo-phase-break { color: var(--dsw-alias-state-success-primary); }
.pomo-actions { display: flex; gap: 6px; }
.pomo-btn { border: 1px solid var(--dsw-alias-border-l2); background: transparent; color: var(--dsw-alias-label-primary); padding: 5px 10px; border-radius: 8px; font: var(--dsw-font-xxs-12); cursor: pointer; }
.pomo-btn:hover { background: var(--dsw-alias-interactive-bg-hover); }
.pomo-btn-main { background: var(--dsw-alias-button-primary-fill); border-color: var(--dsw-alias-button-primary-fill); color: var(--dsw-alias-label-primary-foreground); font: var(--dsw-font-xxs-strong-12); }
.pomo-btn-main:hover { background: var(--dsw-alias-button-primary-hover); }
.pomo-btn:disabled { cursor: not-allowed; opacity: 0.55; }
.pomo-count { font: var(--dsw-font-xxs-12); color: var(--dsw-alias-label-tertiary); }
.pomo-toggle { display: flex; align-items: center; gap: 6px; border: none; background: transparent; color: var(--dsw-alias-label-primary); cursor: pointer; font: var(--dsw-font-xs-13); padding: 4px 8px; border-radius: 8px; }
.pomo-toggle:hover { background: var(--dsw-alias-interactive-bg-hover); }
.pomo-toggle-text { font: var(--dsw-font-xxs-12); font-variant-numeric: tabular-nums; }
.pomo-settings-card { list-style: none; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-primary); transition: border-color 0.16s, background 0.16s; }
.pomo-settings-card:hover { border-color: var(--dsw-alias-label-dimmed); }
.pomo-settings-card-open { background: var(--dsw-alias-bg-layer-2); border-color: var(--dsw-alias-label-dimmed); }
.pomo-card-header { width: 100%; display: flex; align-items: center; gap: 12px; appearance: none; border: none; background: transparent; color: inherit; text-align: left; cursor: pointer; padding: 14px 16px; border-radius: 12px; font-family: var(--dsw-font-family); }
.pomo-card-headtext { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.pomo-card-name { font-size: 15px; font-weight: 600; line-height: 1.4; color: var(--dsw-alias-label-primary); }
.pomo-card-description { font: var(--dsw-font-xs-13); color: var(--dsw-alias-label-tertiary); }
.pomo-card-chevron { flex: none; width: 8px; height: 8px; margin: 0 3px 4px 0; border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor; color: var(--dsw-alias-label-tertiary); transform: rotate(45deg); transition: transform 0.16s; }
.pomo-settings-card-open .pomo-card-chevron { margin-bottom: -4px; transform: rotate(225deg); }
.pomo-card-body { border-top: 1px solid var(--dsw-alias-border-l2); margin: 0 16px; }
.pomo-settings { display: flex; flex-direction: column; gap: 10px; max-width: 520px; padding: 12px 0 8px; }
.pomo-setrow { display: flex; align-items: center; gap: 8px; }
.pomo-setlabel { flex: 1; font: var(--dsw-font-xs-13); color: var(--dsw-alias-label-secondary); }
.pomo-setinput { width: 76px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); border-radius: 6px; padding: 4px 8px; font: var(--dsw-font-xs-13); }
.pomo-setinput:focus { border-color: var(--dsw-alias-state-business-primary); outline: none; }
.pomo-settoggle { cursor: pointer; }
.pomo-setcheck { width: 16px; height: 16px; margin: 0; accent-color: var(--dsw-alias-state-business-primary); cursor: pointer; }
.pomo-setcheck:disabled { cursor: not-allowed; opacity: 0.55; }
.pomo-setgroup { display: flex; flex-direction: column; gap: 4px; }
.pomo-setsound-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.pomo-setsound-label > span { flex: 1; }
.pomo-sound-preview { flex: none; padding-inline: 9px; }
.pomo-sethelp { font: var(--dsw-font-xxs-12); line-height: 1.5; color: var(--dsw-alias-label-tertiary); }
.pomo-setactions { display: flex; justify-content: flex-end; gap: 6px; border-top: 1px solid var(--dsw-alias-border-l2); padding-top: 12px; }
.pomo-setnotice { font: var(--dsw-font-xxs-12); color: var(--dsw-alias-state-business-primary); }
.pomo-setnotice-error { color: var(--dsw-alias-state-error-primary); }
.pomo-setconflict { display: flex; align-items: center; gap: 8px; font: var(--dsw-font-xxs-12); color: var(--dsw-alias-state-error-primary); }
.pomo-setconflict-text { flex: 1; }
.pomo-setmsg { font: var(--dsw-font-xs-13); color: var(--dsw-alias-label-secondary); padding: 4px 0; }
.pomo-seterror { display: flex; align-items: flex-start; gap: 8px; }
.pomo-seterror-text { flex: 1; min-width: 0; }
.pomo-close:focus-visible, .pomo-btn:focus-visible, .pomo-toggle:focus-visible, .pomo-setinput:focus-visible, .pomo-setcheck:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: 2px; }
.pomo-card-header:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: -2px; }
@media (prefers-reduced-motion: reduce) { .pomo-ring-fg, .pomo-settings-card, .pomo-card-chevron { transition: none; } }
`;

    const tagId = "dsh-pomodoro/pomodoro.css";
    if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "dsh-pomodoro";
      tag.dataset.pluginCss = tagId;
      tag.textContent = pomoCss;
      document.head.appendChild(tag);
    }

    // 启动兜底：宿主解析值到达前先显示 25 分钟专注 / 5 分钟休息。
    // 下方 25/5/true/false/false/false 必须与 lib/index.js 的 Config schema 默认值保持同步。
    // 分钟范围也必须与服务端 schema 保持同步；服务端仍是最终校验边界。
    // 调试接缝：仅当页面显式设置 window.__POMO_DEBUG_FOCUS_MS / __POMO_DEBUG_BREAK_MS
    // 时生效（调试台用它缩短阶段时长），生产环境不设置，行为与默认值完全一致。
    const MIN_DURATION_MINUTES = 1;
    const MAX_DURATION_MINUTES = 240;
    const DEBUG_FOCUS_MS = typeof window !== "undefined" ? window.__POMO_DEBUG_FOCUS_MS : undefined;
    const DEBUG_BREAK_MS = typeof window !== "undefined" ? window.__POMO_DEBUG_BREAK_MS : undefined;
    const DEFAULT_FOCUS_MS = typeof DEBUG_FOCUS_MS === "number" ? DEBUG_FOCUS_MS : 25 * 60 * 1000;
    const DEFAULT_BREAK_MS = typeof DEBUG_BREAK_MS === "number" ? DEBUG_BREAK_MS : 5 * 60 * 1000;
    // CC0 低沉提示音直接嵌入 bundle：DSH 客户端模块路由不承诺暴露包内任意静态文件。
    const COMPLETION_SOUND_BASE64 = "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IBknCABCoA6BJUAHgARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EMTcgcEICSkAvAAwEYEk1BSABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxNoBwMwJJKCgACAFgOSAEQAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xDE1gPAAAH+AAAAIAAAP8AAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EMTWA8AAAf4AAAAgAAA/wAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxNYDwAAB/gAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=";
    const COMPLETION_SOUND_CLIP_SECONDS = 1;
    const COMPLETION_SOUND_INTERVAL_SECONDS = 2;
    const COMPLETION_SOUND_REPEATS = 3;

    // 插件主体：提供计时引擎与 UI，注册进侧栏与全屏浮层。
    function apply(ctx) {
      const slots = ctx.get("slots");
      const locale = ctx.get("locale");
      ctx.effect(
        () => locale.register(POMODORO_LOCALE_NS, POMODORO_MESSAGES),
        "dsh-pomodoro: locale dictionaries",
      );
      const translate = locale.bind(POMODORO_LOCALE_NS);

      const codedError = (code, message) => {
        const error = new Error(message);
        error.code = code;
        return error;
      };

      // 运行期配置：以启动兜底显示，宿主解析值经 /pomodoro 通道到达后热更新。
      const cfg = {
        focusMs: DEFAULT_FOCUS_MS,
        breakMs: DEFAULT_BREAK_MS,
        autoStartBreaks: true,
        autoStartFocus: false,
        completionSound: false,
        systemNotifications: false,
      };
      const completionSoundPlayer = (() => {
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        let audioContext = null;
        let soundBufferPromise = null;
        let playbackVersion = 0;
        const activeSources = new Set();

        const getContext = () => {
          if (typeof AudioContextCtor !== "function") {
            throw codedError("AUDIO_UNSUPPORTED", "Web Audio API is unavailable");
          }
          if (audioContext === null || audioContext.state === "closed") {
            audioContext = new AudioContextCtor();
            soundBufferPromise = null;
          }
          return audioContext;
        };
        const decodeSound = () => {
          if (soundBufferPromise !== null) return soundBufferPromise;
          const context = getContext();
          const binary = window.atob(COMPLETION_SOUND_BASE64);
          const bytes = new Uint8Array(binary.length);
          for (let index = 0; index < binary.length; index += 1) {
            bytes[index] = binary.charCodeAt(index);
          }
          soundBufferPromise = Promise.resolve(context.decodeAudioData(bytes.buffer)).catch((error) => {
            soundBufferPromise = null;
            throw error;
          });
          return soundBufferPromise;
        };
        const releaseSource = (entry) => {
          if (!activeSources.delete(entry)) return;
          entry.source.onended = null;
          try { entry.source.disconnect(); } catch {}
          try { entry.gain.disconnect(); } catch {}
        };
        const stop = () => {
          playbackVersion += 1;
          for (const entry of Array.from(activeSources)) {
            try { entry.source.stop(); } catch {}
            releaseSource(entry);
          }
        };
        const prepare = async () => {
          const context = getContext();
          if (context.state !== "running") await context.resume();
          const buffer = await decodeSound();
          if (context.state !== "running") throw codedError("AUDIO_BLOCKED", "Audio playback is not allowed");
          return { context, buffer };
        };
        const play = async () => {
          stop();
          const version = playbackVersion;
          const { context, buffer } = await prepare();
          if (version !== playbackVersion) return false;
          const startAt = context.currentTime + 0.03;
          const clipSeconds = Math.min(COMPLETION_SOUND_CLIP_SECONDS, buffer.duration);
          for (let index = 0; index < COMPLETION_SOUND_REPEATS; index += 1) {
            const source = context.createBufferSource();
            const gain = context.createGain();
            source.buffer = buffer;
            gain.gain.value = 0.55;
            source.connect(gain);
            gain.connect(context.destination);
            const entry = { source, gain };
            activeSources.add(entry);
            source.onended = () => releaseSource(entry);
            source.start(startAt + index * COMPLETION_SOUND_INTERVAL_SECONDS, 0, clipSeconds);
          }
          return true;
        };
        const close = () => {
          stop();
          const context = audioContext;
          audioContext = null;
          soundBufferPromise = null;
          if (context !== null && context.state !== "closed") {
            Promise.resolve(context.close()).catch(() => {});
          }
        };

        return {
          supported: typeof AudioContextCtor === "function",
          unlock: prepare,
          play,
          stop,
          close,
        };
      })();
      let completionSoundWarningShown = false;
      const reportCompletionSoundError = (error) => {
        if (completionSoundWarningShown) return;
        completionSoundWarningShown = true;
        console.warn("dsh-pomodoro: 提示音播放失败，已保留 DSH 内提醒", error);
      };
      ctx.effect(() => () => completionSoundPlayer.close(), "dsh-pomodoro: completion sound cleanup");
      const totalFor = (phase) => (phase === "focus" ? cfg.focusMs : cfg.breakMs);

      let s = {
        open: false,
        phase: "focus",
        remainingMs: totalFor("focus"),
        totalMs: totalFor("focus"),
        running: false,
        pomos: 0,
        left: null,
        top: null,
        compact: false,
      };
      let endAt = 0;
      let endTimer = 0;
      const listeners = new Set();
      const emit = () => { listeners.forEach((fn) => fn(s)); };
      const set = (patch) => { s = Object.assign({}, s, patch); emit(); };
      const completionListeners = new Set();
      let completionSeq = 0;
      const publishCompletion = (event) => {
        const completion = Object.assign({ seq: ++completionSeq }, event);
        completionListeners.forEach((listener) => listener(completion));
      };
      const completionEvents = {
        subscribe: (listener) => {
          completionListeners.add(listener);
          return () => { completionListeners.delete(listener); };
        },
      };

      function clearEndTimer() {
        if (endTimer === 0) return;
        window.clearTimeout(endTimer);
        endTimer = 0;
      }

      function scheduleEnd() {
        clearEndTimer();
        if (!s.running) return;
        endTimer = window.setTimeout(() => {
          endTimer = 0;
          if (!settleExpired(Date.now()) && s.running) scheduleEnd();
        }, Math.min(Math.max(0, endAt - Date.now()), 2147000000));
      }

      function startPhase(phase, running = true) {
        const total = totalFor(phase);
        endAt = running ? Date.now() + total : 0;
        set({ phase, remainingMs: total, totalMs: total, running });
        scheduleEnd();
      }

      function settleExpired(now, pauseNext = false) {
        if (!s.running || endAt > now) return false;
        const completedPhase = s.phase;
        const gained = completedPhase === "focus" ? 1 : 0;
        const nextPhase = completedPhase === "focus" ? "break" : "focus";
        const autoStart = completedPhase === "focus" ? cfg.autoStartBreaks : cfg.autoStartFocus;
        const nextRunning = !pauseNext && autoStart;
        const total = totalFor(nextPhase);
        endAt = nextRunning ? now + total : 0;
        set({
          phase: nextPhase,
          remainingMs: total,
          totalMs: total,
          running: nextRunning,
          pomos: s.pomos + gained,
        });
        publishCompletion({
          completedPhase,
          nextPhase,
          nextRunning,
          nextDurationMs: total,
          occurredAt: now,
        });
        scheduleEnd();
        return true;
      }

      function tick() {
        if (!s.running) return;
        const now = Date.now();
        if (settleExpired(now)) return;
        set({ remainingMs: endAt - now });
      }

      const engine = {
        get: () => s,
        subscribe: (fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
        toggleOpen: () => set({ open: !s.open }),
        toggleRun: () => {
          const now = Date.now();
          if (s.running) {
            if (settleExpired(now, true)) return;
            clearEndTimer();
            set({ running: false, remainingMs: Math.max(0, endAt - now) });
          } else {
            endAt = now + s.remainingMs;
            set({ running: true });
            scheduleEnd();
          }
        },
        reset: () => {
          const total = totalFor(s.phase);
          endAt = 0;
          clearEndTimer();
          set({ remainingMs: total, totalMs: total, running: false });
        },
        skip: () => startPhase(s.phase === "focus" ? "break" : "focus", false),
        move: (left, top) => set({ left, top }),
        toggleCompact: () => set({ compact: !s.compact }),
      };
      const toggleRun = () => {
        if (!s.running && cfg.completionSound) {
          completionSoundPlayer.unlock().catch(reportCompletionSoundError);
        }
        engine.toggleRun();
      };

      ctx.interval(() => tick(), 250);
      ctx.effect(() => {
        const reconcileTimer = () => {
          if (!s.running) return;
          const now = Date.now();
          if (!settleExpired(now)) {
            set({ remainingMs: Math.max(0, endAt - now) });
            scheduleEnd();
          }
        };
        document.addEventListener("visibilitychange", reconcileTimer);
        window.addEventListener("focus", reconcileTimer);
        return () => {
          document.removeEventListener("visibilitychange", reconcileTimer);
          window.removeEventListener("focus", reconcileTimer);
          clearEndTimer();
        };
      }, "dsh-pomodoro: phase deadline reconciliation");

      // 宿主配置热更新：接收 settings 域的分层解析值并在校验后写入 cfg。
      // 调试台设置的毫秒值只用于缩短测试周期，不进入生产 RPC 契约。
      // 当前阶段尚未开始且未被改动（剩余 == 总长）时立即生效；否则下一阶段生效。
      function applyRemoteConfig(remote) {
        if (remote === null || typeof remote !== "object") return;
        const focusMs = typeof DEBUG_FOCUS_MS === "number"
          ? DEBUG_FOCUS_MS
          : typeof remote.focusMinutes === "number" && Number.isFinite(remote.focusMinutes)
            ? remote.focusMinutes * 60 * 1000
            : NaN;
        const breakMs = typeof DEBUG_BREAK_MS === "number"
          ? DEBUG_BREAK_MS
          : typeof remote.breakMinutes === "number" && Number.isFinite(remote.breakMinutes)
            ? remote.breakMinutes * 60 * 1000
            : NaN;
        if (!Number.isFinite(focusMs) || !Number.isFinite(breakMs) || focusMs <= 0 || breakMs <= 0) return;
        cfg.focusMs = Math.round(focusMs);
        cfg.breakMs = Math.round(breakMs);
        cfg.autoStartBreaks = typeof remote.autoStartBreaks === "boolean" ? remote.autoStartBreaks : true;
        cfg.autoStartFocus = typeof remote.autoStartFocus === "boolean" ? remote.autoStartFocus : false;
        cfg.completionSound = remote.completionSound === true;
        cfg.systemNotifications = remote.systemNotifications === true;
        if (!s.running && s.remainingMs === s.totalMs) {
          const total = totalFor(s.phase);
          set({ remainingMs: total, totalMs: total });
        }
      }

      // 配置主通道：插件私有 loopback RPC。DSH rc.6 的通用 settings.* API
      // 只暴露核心白名单，第三方命名空间即使已注册也不会出现在 settings.describe 中。
      const connection = ctx.get("connection");
      let snapshot = connection.isLoopback
        ? { status: "loading", value: undefined, user: null, revision: 0 }
        : { status: "unavailable", value: undefined, user: null, revision: 0 };
      const settingsListeners = new Set();
      let settingsTail = Promise.resolve();
      const publishSettings = (next) => {
        snapshot = next;
        settingsListeners.forEach((listener) => listener());
        if (next.status === "ready") applyRemoteConfig(next.value);
      };
      const errorMessageKeys = {
        "settings-unavailable": "rpc.settingsUnavailable",
        "invalid-request": "rpc.invalidRequest",
        "invalid-value": "rpc.invalidValue",
        SETTINGS_CONFLICT: "rpc.conflict",
        AUDIO_UNSUPPORTED: "audio.unsupported",
        AUDIO_BLOCKED: "audio.blocked",
      };
      const rawErrorMessage = (error) => error?.message ?? String(error);
      const translatedError = (t, error, fallbackKey) => {
        const messageKey = errorMessageKeys[error?.code];
        return messageKey === undefined
          ? t(fallbackKey, { message: rawErrorMessage(error) })
          : t(messageKey);
      };
      const errorNotice = (error, fallbackKey, kind = "error") => {
        const messageKey = errorMessageKeys[error?.code];
        return messageKey === undefined
          ? { kind, key: fallbackKey, params: { message: rawErrorMessage(error) } }
          : { kind, key: messageKey };
      };
      const callSettings = async (endpoint, payload) => {
        const result = await connection.rpc.call("/pomodoro", endpoint, payload);
        if (!result?.ok) {
          const detail = result?.error;
          const error = new Error(detail?.message ?? endpoint);
          error.code = typeof detail?.code === "string" ? detail.code : "POMODORO_RPC_FAILED";
          if (Number.isSafeInteger(detail?.expected)) error.expected = detail.expected;
          if (Number.isSafeInteger(detail?.actual)) error.actual = detail.actual;
          throw error;
        }
        return result.value;
      };
      const enqueue = (operation) => {
        const running = settingsTail.then(operation, operation);
        settingsTail = running.catch(() => {});
        return running;
      };
      const readySnapshot = (view) => ({
        status: "ready",
        value: view.value,
        user: view.user,
        revision: view.revision,
        writable: view.writable !== false,
      });
      const loadSettings = () => enqueue(async () => {
        try {
          const view = await callSettings("settings.read", {});
          publishSettings(readySnapshot(view));
          return view;
        } catch (error) {
          publishSettings({ status: "error", value: undefined, user: null, revision: snapshot.revision, error });
          throw error;
        }
      });
      const writeSettings = (endpoint, payload) => enqueue(async () => {
        try {
          const view = await callSettings(endpoint, payload);
          publishSettings(readySnapshot(view));
          return view;
        } catch (error) {
          if (error?.code === "SETTINGS_CONFLICT") {
            try {
              const view = await callSettings("settings.read", {});
              publishSettings(readySnapshot(view));
            } catch (reloadError) {
              console.error("dsh-pomodoro: 设置冲突后重新读取失败", reloadError);
            }
          }
          throw error;
        }
      });
      const pomoSettingsScope = {
        getSnapshot: () => snapshot,
        subscribe: (listener) => {
          settingsListeners.add(listener);
          return () => { settingsListeners.delete(listener); };
        },
        save: (value, expectedRevision) => writeSettings("settings.save", { value, expectedRevision }),
        reset: (expectedRevision) => writeSettings("settings.reset", { expectedRevision }),
        reload: loadSettings,
      };
      if (connection.isLoopback) {
        const remote = ctx.get("remote");
        ctx.effect(() => {
          const disposers = [
            remote.$on("settings/document-updated", (namespace) => {
              if (namespace === "dsh-pomodoro") loadSettings().catch(() => {});
            }),
            ctx.on("connection/reset", () => { loadSettings().catch(() => {}); }),
          ];
          loadSettings().catch((error) => {
            console.error("dsh-pomodoro: 读取宿主设置失败，使用默认时长", error);
          });
          return () => {
            for (const dispose of disposers) dispose();
            settingsListeners.clear();
          };
        }, "dsh-pomodoro: settings invalidations");
      }

      function useEngine() {
        const [snap, setSnap] = react.useState(engine.get());
        react.useEffect(() => engine.subscribe(() => setSnap(engine.get())), []);
        return snap;
      }

      function fmt(ms) {
        const secs = Math.ceil(ms / 1000);
        const m = Math.floor(secs / 60);
        const sec = secs % 60;
        return m + ":" + (sec < 10 ? "0" + sec : sec);
      }

      const dragState = { active: false, startX: 0, startY: 0, baseLeft: 0, baseTop: 0, width: 0, height: 0 };

      function PomodoroPanel(props) {
        const t = props.t;
        const st = useEngine();
        const hasPosition = st.left !== null && st.top !== null;
        react.useEffect(() => {
          if (!st.open || !hasPosition) return undefined;
          const clamp = () => {
            const panel = document.getElementById("dsh-pomodoro-panel");
            const current = engine.get();
            if (panel === null || current.left === null || current.top === null) return;
            const rect = panel.getBoundingClientRect();
            const maxLeft = Math.max(0, Math.floor(window.innerWidth - rect.width));
            const maxTop = Math.max(0, Math.floor(window.innerHeight - rect.height));
            const nextLeft = Math.min(Math.max(0, current.left), maxLeft);
            const nextTop = Math.min(Math.max(0, current.top), maxTop);
            if (nextLeft !== current.left || nextTop !== current.top) engine.move(nextLeft, nextTop);
          };
          const frame = window.requestAnimationFrame(clamp);
          window.addEventListener("resize", clamp);
          return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener("resize", clamp);
          };
        }, [st.open, st.compact, hasPosition]);
        if (!st.open) return null;
        const phaseText = st.phase === "focus"
          ? t(st.running ? "phase.focusing" : "phase.focus")
          : t(st.running ? "phase.breaking" : "phase.break");
        const miniTitle = (st.phase === "break" ? "☕ " : "🍅 ") + phaseText;
        const progress = 1 - st.remainingMs / st.totalMs;
        const ringLen = 2 * Math.PI * 54;
        const pos = st.left !== null ? { left: st.left + "px", top: st.top + "px" } : null;
        return react.createElement(
          "div",
          {
            id: "dsh-pomodoro-panel",
            className: "pomo-panel" + (st.compact ? " pomo-panel-compact" : "") + (pos !== null ? " pomo-panel-moved" : ""),
            style: pos,
            role: "region",
            "aria-label": t("app.name"),
          },
          react.createElement(
            "div",
            {
              className: "pomo-header",
              onPointerDown: (e) => {
                if (e.button !== 0) return;
                const panel = e.currentTarget.parentElement;
                if (panel === null) return;
                const rect = panel.getBoundingClientRect();
                dragState.active = true;
                dragState.startX = e.clientX;
                dragState.startY = e.clientY;
                dragState.baseLeft = rect.left;
                dragState.baseTop = rect.top;
                dragState.width = rect.width;
                dragState.height = rect.height;
                e.currentTarget.setPointerCapture(e.pointerId);
              },
              onPointerMove: (e) => {
                if (!dragState.active) return;
                const panel = e.currentTarget.parentElement;
                if (panel === null) return;
                const nextLeft = dragState.baseLeft + e.clientX - dragState.startX;
                const nextTop = dragState.baseTop + e.clientY - dragState.startY;
                const maxLeft = Math.max(0, window.innerWidth - dragState.width);
                const maxTop = Math.max(0, window.innerHeight - dragState.height);
                engine.move(
                  Math.min(Math.max(0, nextLeft), maxLeft),
                  Math.min(Math.max(0, nextTop), maxTop),
                );
              },
              onPointerUp: () => { dragState.active = false; },
              onPointerCancel: () => { dragState.active = false; },
            },
            react.createElement("span", {
              className: "pomo-title" + (st.compact && st.phase === "break" ? " pomo-title-break" : ""),
            }, st.compact ? miniTitle : t("app.title")),
            react.createElement(
              "div",
              { className: "pomo-header-actions" },
              react.createElement("button", {
                className: "pomo-close",
                type: "button",
                title: st.compact ? t("action.expand") : t("panel.switchToMini"),
                "aria-label": st.compact ? t("panel.expandAria") : t("panel.switchToMini"),
                onPointerDown: (e) => e.stopPropagation(),
                onClick: () => engine.toggleCompact(),
              }, st.compact ? t("action.expand") : t("action.mini")),
              react.createElement("button", {
                className: "pomo-close",
                type: "button",
                title: t("action.close"),
                "aria-label": t("panel.closeAria"),
                onPointerDown: (e) => e.stopPropagation(),
                onClick: () => engine.toggleOpen(),
              }, "✕")
            )
          ),
          st.compact
            ? react.createElement(
              "div",
              { className: "pomo-mini-body" },
              react.createElement("div", {
                className: "pomo-mini-time",
                role: "timer",
                "aria-label": t("timer.remaining", { phase: phaseText, time: fmt(st.remainingMs) }),
              }, fmt(st.remainingMs)),
              react.createElement("button", {
                className: "pomo-btn pomo-btn-main pomo-mini-action",
                type: "button",
                onClick: toggleRun,
              }, t(st.running ? "action.pause" : "action.start"))
            )
            : react.createElement(
              "div",
              { className: "pomo-body" },
              react.createElement(
                "div",
                { className: "pomo-ring-wrap" },
                react.createElement(
                  "svg",
                  { className: "pomo-ring", width: 128, height: 128, viewBox: "0 0 128 128", "aria-hidden": true, focusable: false },
                  react.createElement("circle", { className: "pomo-ring-bg", cx: 64, cy: 64, r: 54 }),
                  react.createElement("circle", {
                    className: "pomo-ring-fg" + (st.phase === "break" ? " pomo-ring-break" : ""),
                    cx: 64,
                    cy: 64,
                    r: 54,
                    strokeDasharray: String(ringLen),
                    strokeDashoffset: String(ringLen * (1 - progress)),
                  })
                ),
                react.createElement("div", { className: "pomo-time" }, fmt(st.remainingMs))
              ),
              react.createElement("div", { className: "pomo-phase" + (st.phase === "break" ? " pomo-phase-break" : "") }, phaseText),
              react.createElement(
                "div",
                { className: "pomo-actions" },
                react.createElement("button", { className: "pomo-btn pomo-btn-main", type: "button", onClick: toggleRun }, t(st.running ? "action.pause" : "action.start")),
                react.createElement("button", { className: "pomo-btn", type: "button", onClick: () => engine.reset() }, t("action.reset")),
                react.createElement("button", { className: "pomo-btn", type: "button", onClick: () => engine.skip() }, t("action.skip"))
              ),
              react.createElement("div", { className: "pomo-count" }, t("timer.completed", { count: st.pomos }))
            )
        );
      }

      function completionDuration(ms, t) {
        const seconds = Math.max(1, Math.round(ms / 1000));
        const unit = seconds < 60 ? "second" : "minute";
        const count = seconds < 60 ? seconds : Math.max(1, Math.round(seconds / 60));
        return t(`duration.${unit}.${count === 1 ? "one" : "other"}`, { count });
      }

      function completionText(event, t) {
        if (event.completedPhase === "focus") {
          return t(event.nextRunning ? "completion.focus.auto" : "completion.focus.manual", {
            duration: completionDuration(event.nextDurationMs, t),
          });
        }
        return t(event.nextRunning ? "completion.break.auto" : "completion.break.manual");
      }

      function notificationCapability() {
        if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
        if (window.isSecureContext === false) return "insecure";
        return window.Notification.permission;
      }

      function systemNotificationCopy(event) {
        const t = translate;
        if (event.completedPhase === "focus") {
          return {
            title: t("notification.focus.title"),
            body: t(event.nextRunning ? "notification.focus.auto" : "notification.focus.manual", {
              duration: completionDuration(event.nextDurationMs, t),
            }),
          };
        }
        return {
          title: t("notification.break.title"),
          body: t(event.nextRunning ? "notification.break.auto" : "notification.break.manual"),
        };
      }

      function showSystemNotification(event) {
        if (!cfg.systemNotifications || notificationCapability() !== "granted") return;
        const isActivePage = document.visibilityState === "visible"
          && (typeof document.hasFocus !== "function" || document.hasFocus());
        if (isActivePage) return;
        const copy = systemNotificationCopy(event);
        try {
          const notification = new window.Notification(copy.title, {
            body: copy.body,
            tag: "dsh-pomodoro-completion",
            silent: cfg.completionSound,
          });
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        } catch (error) {
          console.warn("dsh-pomodoro: 系统通知发送失败，已保留 DSH 内提醒", error);
        }
      }

      function CompletionFeedback(props) {
        const [completion, setCompletion] = react.useState(null);
        react.useEffect(() => completionEvents.subscribe((event) => {
          setCompletion(event);
          if (cfg.completionSound) completionSoundPlayer.play().catch(reportCompletionSoundError);
          showSystemNotification(event);
        }), []);
        if (completion === null) return null;
        return react.createElement(Toast, {
          key: completion.seq,
          text: completionText(completion, props.t),
          onDone: () => setCompletion((current) => current?.seq === completion.seq ? null : current),
        });
      }

      function ToggleButton(props) {
        const t = props.t;
        const st = useEngine();
        return react.createElement(
          "button",
          {
            className: "pomo-toggle",
            type: "button",
            title: t("app.name"),
            "aria-label": t("app.name"),
            "aria-controls": "dsh-pomodoro-panel",
            "aria-expanded": st.open,
            onClick: () => engine.toggleOpen(),
          },
          react.createElement("span", { className: "pomo-toggle-emoji", "aria-hidden": true }, "🍅"),
          props.wide ? react.createElement("span", { className: "pomo-toggle-text" }, st.running ? fmt(st.remainingMs) : t("app.name")) : null
        );
      }

      // —— 用户设置：运行期修改 + settings.yaml 持久化 ——
      function PomodoroSettings(props) {
        const t = props.t;
        const [snap, setSnap] = react.useState(pomoSettingsScope.getSnapshot());
        const [drafts, setDrafts] = react.useState(null);
        const [busy, setBusy] = react.useState(false);
        const [permissionBusy, setPermissionBusy] = react.useState(false);
        const [notificationState, setNotificationState] = react.useState(notificationCapability());
        const [notice, setNotice] = react.useState(null);
        react.useEffect(() => pomoSettingsScope.subscribe(() => {
          setSnap(pomoSettingsScope.getSnapshot());
        }), []);
        react.useEffect(() => {
          const refresh = () => setNotificationState(notificationCapability());
          document.addEventListener("visibilitychange", refresh);
          window.addEventListener("focus", refresh);
          return () => {
            document.removeEventListener("visibilitychange", refresh);
            window.removeEventListener("focus", refresh);
          };
        }, []);

        const retryLoad = () => {
          setBusy(true);
          setNotice(null);
          pomoSettingsScope.reload().then(
            () => setBusy(false),
            () => setBusy(false),
          );
        };

        if (snap.status === "unavailable") {
          return react.createElement("div", { className: "pomo-setmsg", role: "status" }, t("settings.remoteUnavailable"));
        }
        if (snap.status === "error") {
          return react.createElement(
            "div",
            { className: "pomo-setmsg pomo-seterror", "aria-busy": busy },
            react.createElement(
              "span",
              { className: "pomo-seterror-text", role: "alert" },
              translatedError(t, snap.error, "settings.loadFailed"),
            ),
            react.createElement("button", {
              className: "pomo-btn",
              type: "button",
              disabled: busy,
              onClick: retryLoad,
            }, t(busy ? "action.retrying" : "action.retry")),
          );
        }
        if (snap.status === "loading" || snap.value === undefined) {
          return react.createElement("div", { className: "pomo-setmsg", role: "status" }, t("settings.loading"));
        }
        if (snap.writable === false) {
          return react.createElement("div", { className: "pomo-setmsg", role: "status" }, t("settings.readOnly"));
        }
        const value = snap.value;
        const createDraft = (source, revision) => ({
          focus: String(source.focusMinutes),
          break: String(source.breakMinutes),
          autoStartBreaks: source.autoStartBreaks !== false,
          autoStartFocus: source.autoStartFocus === true,
          completionSound: source.completionSound === true,
          systemNotifications: source.systemNotifications === true,
          baseRevision: revision,
        });
        const draft = drafts ?? createDraft(value, snap.revision);
        const hasExternalUpdate = drafts !== null && drafts.baseRevision !== snap.revision;
        const hasConflict = hasExternalUpdate || notice?.kind === "conflict";
        const conflictText = notice?.kind === "conflict"
          ? t(notice.key, notice.params)
          : t("settings.externalUpdate");
        const updateDraft = (patch) => {
          setDrafts((current) => Object.assign(
            {},
            current ?? createDraft(snap.value, snap.revision),
            patch,
          ));
          setNotice((current) => current?.kind === "conflict" ? current : null);
        };
        const readNum = (field) => {
          const n = Number(draft[field]);
          return Number.isSafeInteger(n) && n >= MIN_DURATION_MINUTES && n <= MAX_DURATION_MINUTES ? n : null;
        };
        const notificationHelp = (() => {
          if (notificationState === "unsupported") return t("settings.notification.unsupportedHelp");
          if (notificationState === "insecure") return t("settings.notification.insecureHelp");
          if (notificationState === "denied") return t("settings.notification.deniedHelp");
          if (notificationState === "granted") {
            return draft.systemNotifications
              ? t("settings.notification.grantedEnabledHelp")
              : t("settings.notification.grantedDisabledHelp");
          }
          return t("settings.notification.promptHelp");
        })();
        const completionSoundUnavailable = completionSoundPlayer.supported
          ? null
          : t("settings.sound.unavailableHelp");
        const changeCompletionSound = (checked) => {
          if (!checked) {
            completionSoundPlayer.stop();
            updateDraft({ completionSound: false });
            return;
          }
          if (!completionSoundPlayer.supported) {
            setNotice({ kind: "error", key: "notice.sound.unsupported" });
            return;
          }
          updateDraft({ completionSound: true });
          completionSoundPlayer.unlock().catch((error) => {
            reportCompletionSoundError(error);
            setNotice(errorNotice(error, "notice.sound.blocked"));
          });
        };
        const previewCompletionSound = () => {
          setNotice(null);
          completionSoundPlayer.play().then((played) => {
            if (played) setNotice({ kind: "success", key: "notice.sound.previewStarted" });
          }, (error) => {
            reportCompletionSoundError(error);
            setNotice(errorNotice(error, "notice.sound.previewFailed"));
          });
        };
        const changeSystemNotifications = (checked) => {
          if (!checked) {
            updateDraft({ systemNotifications: false });
            return;
          }
          const capability = notificationCapability();
          setNotificationState(capability);
          if (capability === "granted") {
            updateDraft({ systemNotifications: true });
            return;
          }
          if (capability === "unsupported") {
            setNotice({ kind: "error", key: "notice.notification.unsupported" });
            return;
          }
          if (capability === "insecure") {
            setNotice({ kind: "error", key: "notice.notification.insecure" });
            return;
          }
          if (capability === "denied") {
            setNotice({ kind: "error", key: "notice.notification.denied" });
            return;
          }
          setPermissionBusy(true);
          let permissionRequest;
          try {
            permissionRequest = window.Notification.requestPermission();
          } catch (error) {
            setPermissionBusy(false);
            setNotice({ kind: "error", key: "notice.notification.requestFailed" });
            return;
          }
          Promise.resolve(permissionRequest).then((permission) => {
            setPermissionBusy(false);
            setNotificationState(notificationCapability());
            if (permission === "granted") {
              updateDraft({ systemNotifications: true });
              setNotice({ kind: "success", key: "notice.notification.granted" });
            } else {
              updateDraft({ systemNotifications: false });
              setNotice({ kind: "error", key: "notice.notification.notGranted" });
            }
          }, () => {
            setPermissionBusy(false);
            setNotificationState(notificationCapability());
            setNotice({ kind: "error", key: "notice.notification.requestFailed" });
          });
        };
        const conflictNotice = (operation) => ({
          kind: "conflict",
          key: `settings.conflict.${operation}.${drafts === null ? "noDraft" : "withDraft"}`,
        });
        const reloadLatest = () => {
          setBusy(true);
          setNotice(null);
          pomoSettingsScope.reload().then(() => {
            setBusy(false);
            setDrafts(null);
            setNotice({ kind: "success", key: "notice.reload.success" });
          }, (error) => {
            setBusy(false);
            setNotice({
              kind: "conflict",
              key: "notice.reload.failed",
              params: { message: rawErrorMessage(error) },
            });
          });
        };
        const save = () => {
          const f = readNum("focus");
          const b = readNum("break");
          if (f === null || b === null) {
            setNotice({
              kind: "error",
              key: "notice.validation.duration",
              params: { min: MIN_DURATION_MINUTES, max: MAX_DURATION_MINUTES },
            });
            return;
          }
          setBusy(true);
          setNotice(null);
          pomoSettingsScope.save({
            focusMinutes: f,
            breakMinutes: b,
            autoStartBreaks: draft.autoStartBreaks,
            autoStartFocus: draft.autoStartFocus,
            completionSound: draft.completionSound,
            systemNotifications: draft.systemNotifications,
          }, draft.baseRevision).then(() => {
            setBusy(false);
            setDrafts(null);
            setNotice({ kind: "success", key: "notice.save.success" });
          }, (error) => {
            setBusy(false);
            setNotice(error?.code === "SETTINGS_CONFLICT"
              ? conflictNotice("save")
              : errorNotice(error, "notice.save.failed"));
          });
        };
        const clearOverrides = () => {
          setBusy(true);
          setNotice(null);
          pomoSettingsScope.reset(draft.baseRevision).then(() => {
            setBusy(false);
            setDrafts(null);
            setNotice({ kind: "success", key: "notice.clear.success" });
          }, (error) => {
            setBusy(false);
            setNotice(error?.code === "SETTINGS_CONFLICT"
              ? conflictNotice("clear")
              : errorNotice(error, "notice.clear.failed"));
          });
        };
        return react.createElement(
          "div",
          { className: "pomo-settings" },
          react.createElement(
            "div",
            { className: "pomo-setrow" },
            react.createElement("label", { className: "pomo-setlabel", htmlFor: "dsh-pomodoro-focus-minutes" }, t("settings.focusMinutes")),
            react.createElement("input", {
              id: "dsh-pomodoro-focus-minutes",
              className: "pomo-setinput",
              type: "number",
              min: MIN_DURATION_MINUTES,
              max: MAX_DURATION_MINUTES,
              step: 1,
              value: draft.focus,
              disabled: busy,
              onChange: (e) => updateDraft({ focus: e.target.value }),
            })
          ),
          react.createElement(
            "div",
            { className: "pomo-setrow" },
            react.createElement("label", { className: "pomo-setlabel", htmlFor: "dsh-pomodoro-break-minutes" }, t("settings.breakMinutes")),
            react.createElement("input", {
              id: "dsh-pomodoro-break-minutes",
              className: "pomo-setinput",
              type: "number",
              min: MIN_DURATION_MINUTES,
              max: MAX_DURATION_MINUTES,
              step: 1,
              value: draft.break,
              disabled: busy,
              onChange: (e) => updateDraft({ break: e.target.value }),
            })
          ),
          react.createElement(
            "label",
            { className: "pomo-setrow pomo-settoggle" },
            react.createElement("span", { className: "pomo-setlabel" }, t("settings.autoStartBreaks")),
            react.createElement("input", {
              className: "pomo-setcheck",
              type: "checkbox",
              checked: draft.autoStartBreaks,
              disabled: busy,
              onChange: (e) => updateDraft({ autoStartBreaks: e.target.checked }),
            })
          ),
          react.createElement(
            "label",
            { className: "pomo-setrow pomo-settoggle" },
            react.createElement("span", { className: "pomo-setlabel" }, t("settings.autoStartFocus")),
            react.createElement("input", {
              className: "pomo-setcheck",
              type: "checkbox",
              checked: draft.autoStartFocus,
              disabled: busy,
              onChange: (e) => updateDraft({ autoStartFocus: e.target.checked }),
            })
          ),
          react.createElement(
            "div",
            { className: "pomo-setgroup" },
            react.createElement(
              "div",
              { className: "pomo-setrow" },
              react.createElement(
                "label",
                { className: "pomo-setlabel pomo-setsound-label" },
                react.createElement("span", null, t("settings.completionSound")),
                react.createElement("input", {
                  className: "pomo-setcheck",
                  type: "checkbox",
                  checked: draft.completionSound,
                  disabled: busy || !completionSoundPlayer.supported,
                  "aria-describedby": completionSoundUnavailable === null
                    ? undefined
                    : "dsh-pomodoro-sound-help",
                  onChange: (e) => changeCompletionSound(e.target.checked),
                })
              ),
              react.createElement("button", {
                className: "pomo-btn pomo-sound-preview",
                type: "button",
                disabled: busy || !completionSoundPlayer.supported,
                onClick: previewCompletionSound,
              }, t("action.preview"))
            ),
            completionSoundUnavailable === null ? null : react.createElement("div", {
              id: "dsh-pomodoro-sound-help",
              className: "pomo-sethelp",
            }, completionSoundUnavailable)
          ),
          react.createElement(
            "div",
            { className: "pomo-setgroup" },
            react.createElement(
              "label",
              { className: "pomo-setrow pomo-settoggle" },
              react.createElement("span", { className: "pomo-setlabel" }, t("settings.systemNotifications")),
              react.createElement("input", {
                className: "pomo-setcheck",
                type: "checkbox",
                checked: draft.systemNotifications,
                disabled: busy || permissionBusy,
                "aria-describedby": "dsh-pomodoro-notification-help",
                onChange: (e) => changeSystemNotifications(e.target.checked),
              })
            ),
            react.createElement("div", {
              id: "dsh-pomodoro-notification-help",
              className: "pomo-sethelp",
              "aria-live": "polite",
            }, permissionBusy ? t("settings.permissionWaiting") : notificationHelp)
          ),
          react.createElement(
            "div",
            { className: "pomo-setactions" },
            react.createElement("button", { className: "pomo-btn pomo-btn-main", type: "button", disabled: busy || permissionBusy || hasConflict, onClick: save }, t(busy ? "action.saving" : "action.save")),
            react.createElement("button", { className: "pomo-btn", type: "button", disabled: busy || permissionBusy || hasConflict, onClick: clearOverrides }, t("action.clear"))
          ),
          hasConflict ? react.createElement(
            "div",
            { className: "pomo-setconflict", role: "alert" },
            react.createElement("span", { className: "pomo-setconflict-text" }, conflictText),
            react.createElement("button", { className: "pomo-btn", type: "button", disabled: busy, onClick: reloadLatest }, t(busy ? "action.reloading" : "action.reload"))
          ) : null,
          notice !== null && notice.kind !== "conflict" ? react.createElement("div", {
            className: "pomo-setnotice" + (notice.kind === "error" ? " pomo-setnotice-error" : ""),
            role: notice.kind === "error" ? "alert" : "status",
            "aria-live": "polite",
          }, t(notice.key, notice.params)) : null
        );
      }

      function PomodoroSettingsCard(props) {
        const t = props.t;
        const [open, setOpen] = react.useState(false);
        return react.createElement(
          "li",
          { className: "pomo-settings-card" + (open ? " pomo-settings-card-open" : "") },
          react.createElement(
            "button",
            {
              className: "pomo-card-header",
              type: "button",
              "aria-label": t(open ? "settings.card.collapseAria" : "settings.card.expandAria", {
                name: t("app.name"),
              }),
              "aria-expanded": open,
              "aria-controls": "dsh-pomodoro-settings-body",
              onClick: () => setOpen((value) => !value),
            },
            react.createElement(
              "span",
              { className: "pomo-card-headtext" },
              react.createElement("span", { className: "pomo-card-name" }, t("app.name")),
              react.createElement("span", { className: "pomo-card-description" }, t("settings.card.description"))
            ),
            react.createElement("span", { className: "pomo-card-chevron", "aria-hidden": true })
          ),
          react.createElement(
            "div",
            {
              id: "dsh-pomodoro-settings-body",
              className: "pomo-card-body",
              hidden: !open,
            },
            react.createElement(PomodoroSettings, { t })
          )
        );
      }

      slots.inject("settings.plugin.item", () => slots.register(
        { name: "settings.plugin.item", id: "pomodoro", order: 30, locale: POMODORO_LOCALE_NS },
        (props) => react.createElement(PomodoroSettingsCard, { t: props.t })
      ));

      slots.inject("sidebar.footer.action", () => slots.register(
        { name: "sidebar.footer.action", id: "pomodoro.toggle", order: 10, label: () => translate("app.name"), locale: POMODORO_LOCALE_NS },
        (props) => react.createElement(ToggleButton, { t: props.t, wide: props.wide })
      ));

      slots.inject("shell.overlay", () => slots.register(
        { name: "shell.overlay", id: "pomodoro.panel", order: 10, locale: POMODORO_LOCALE_NS },
        (props) => react.createElement(PomodoroPanel, { t: props.t })
      ));

      slots.inject("shell.overlay", () => slots.register(
        { name: "shell.overlay", id: "pomodoro.completion", order: 20, locale: POMODORO_LOCALE_NS },
        (props) => react.createElement(CompletionFeedback, { t: props.t })
      ));
    }

    exports.apply = apply;
    // 五项均为生命周期硬依赖：确保一次性 ctx.get() 不会漏掉晚于插件激活的宿主服务。
    exports.inject = ["timer", "slots", "locale", "connection", "remote"];
    return module.exports;
  },
});
