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
.pomo-setactions { display: flex; justify-content: flex-end; gap: 6px; border-top: 1px solid var(--dsw-alias-border-l2); padding-top: 12px; }
.pomo-setnotice { font: var(--dsw-font-xxs-12); color: var(--dsw-alias-state-business-primary); }
.pomo-setnotice-error { color: var(--dsw-alias-state-error-primary); }
.pomo-setconflict { display: flex; align-items: center; gap: 8px; font: var(--dsw-font-xxs-12); color: var(--dsw-alias-state-error-primary); }
.pomo-setconflict-text { flex: 1; }
.pomo-setmsg { font: var(--dsw-font-xs-13); color: var(--dsw-alias-label-secondary); padding: 4px 0; }
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
    // 下方 25/5/true/false 必须与 lib/index.js 的 Config schema 默认值保持同步。
    // 调试接缝：仅当页面显式设置 window.__POMO_DEBUG_FOCUS_MS / __POMO_DEBUG_BREAK_MS
    // 时生效（调试台用它缩短阶段时长），生产环境不设置，行为与默认值完全一致。
    const DEBUG_FOCUS_MS = typeof window !== "undefined" ? window.__POMO_DEBUG_FOCUS_MS : undefined;
    const DEBUG_BREAK_MS = typeof window !== "undefined" ? window.__POMO_DEBUG_BREAK_MS : undefined;
    const DEFAULT_FOCUS_MS = typeof DEBUG_FOCUS_MS === "number" ? DEBUG_FOCUS_MS : 25 * 60 * 1000;
    const DEFAULT_BREAK_MS = typeof DEBUG_BREAK_MS === "number" ? DEBUG_BREAK_MS : 5 * 60 * 1000;

    // 插件主体：提供计时引擎与 UI，注册进侧栏与全屏浮层。
    function apply(ctx) {
      const slots = ctx.get("slots");

      // 运行期配置：以启动兜底显示，宿主解析值经 /pomodoro 通道到达后热更新。
      const cfg = {
        focusMs: DEFAULT_FOCUS_MS,
        breakMs: DEFAULT_BREAK_MS,
        autoStartBreaks: true,
        autoStartFocus: false,
      };
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

      function startPhase(phase, running = true) {
        const total = totalFor(phase);
        endAt = running ? Date.now() + total : 0;
        set({ phase, remainingMs: total, totalMs: total, running });
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
            set({ running: false, remainingMs: Math.max(0, endAt - now) });
          } else {
            endAt = now + s.remainingMs;
            set({ running: true });
          }
        },
        reset: () => {
          const total = totalFor(s.phase);
          set({ remainingMs: total, totalMs: total, running: false });
        },
        skip: () => startPhase(s.phase === "focus" ? "break" : "focus", false),
        move: (left, top) => set({ left, top }),
        toggleCompact: () => set({ compact: !s.compact }),
      };

      ctx.interval(() => tick(), 250);

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
      const callSettings = async (endpoint, payload) => {
        const result = await connection.rpc.call("/pomodoro", endpoint, payload);
        if (!result?.ok) {
          const detail = result?.error;
          const error = new Error(detail?.message ?? `番茄钟设置请求失败：${endpoint}`);
          if (typeof detail?.code === "string") error.code = detail.code;
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

      function PomodoroPanel() {
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
          ? (st.running ? "专注中" : "专注")
          : (st.running ? "休息中" : "休息");
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
            "aria-label": "番茄钟",
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
            }, st.compact ? miniTitle : "🍅 番茄钟"),
            react.createElement(
              "div",
              { className: "pomo-header-actions" },
              react.createElement("button", {
                className: "pomo-close",
                type: "button",
                title: st.compact ? "展开" : "切换到迷你模式",
                "aria-label": st.compact ? "展开番茄钟面板" : "切换到迷你模式",
                onPointerDown: (e) => e.stopPropagation(),
                onClick: () => engine.toggleCompact(),
              }, st.compact ? "展开" : "迷你"),
              react.createElement("button", {
                className: "pomo-close",
                type: "button",
                title: "关闭",
                "aria-label": "关闭番茄钟面板",
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
                "aria-label": phaseText + "，剩余 " + fmt(st.remainingMs),
              }, fmt(st.remainingMs)),
              react.createElement("button", {
                className: "pomo-btn pomo-btn-main pomo-mini-action",
                type: "button",
                onClick: () => engine.toggleRun(),
              }, st.running ? "暂停" : "开始")
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
                react.createElement("button", { className: "pomo-btn pomo-btn-main", type: "button", onClick: () => engine.toggleRun() }, st.running ? "暂停" : "开始"),
                react.createElement("button", { className: "pomo-btn", type: "button", onClick: () => engine.reset() }, "重置"),
                react.createElement("button", { className: "pomo-btn", type: "button", onClick: () => engine.skip() }, "跳过")
              ),
              react.createElement("div", { className: "pomo-count" }, "已完成 🍅 × " + st.pomos)
            )
        );
      }

      function completionDuration(ms) {
        const seconds = Math.max(1, Math.round(ms / 1000));
        return seconds < 60 ? seconds + " 秒" : Math.max(1, Math.round(seconds / 60)) + " 分钟";
      }

      function completionText(event) {
        if (event.completedPhase === "focus") {
          return event.nextRunning
            ? "专注完成 · " + completionDuration(event.nextDurationMs) + "休息已开始"
            : "专注完成 · 点击开始休息";
        }
        return event.nextRunning
          ? "休息结束 · 下一轮专注已开始"
          : "休息结束 · 准备好后开始下一轮";
      }

      function CompletionToast() {
        const [completion, setCompletion] = react.useState(null);
        react.useEffect(() => completionEvents.subscribe(setCompletion), []);
        if (completion === null) return null;
        return react.createElement(Toast, {
          key: completion.seq,
          text: completionText(completion),
          onDone: () => setCompletion((current) => current?.seq === completion.seq ? null : current),
        });
      }

      function ToggleButton(props) {
        const st = useEngine();
        return react.createElement(
          "button",
          {
            className: "pomo-toggle",
            type: "button",
            title: "番茄钟",
            "aria-label": "番茄钟",
            "aria-controls": "dsh-pomodoro-panel",
            "aria-expanded": st.open,
            onClick: () => engine.toggleOpen(),
          },
          react.createElement("span", { className: "pomo-toggle-emoji", "aria-hidden": true }, "🍅"),
          props.wide ? react.createElement("span", { className: "pomo-toggle-text" }, st.running ? fmt(st.remainingMs) : "番茄钟") : null
        );
      }

      // —— 用户设置：运行期修改 + settings.yaml 持久化 ——
      function PomodoroSettings() {
        const [snap, setSnap] = react.useState(pomoSettingsScope.getSnapshot());
        const [drafts, setDrafts] = react.useState(null);
        const [busy, setBusy] = react.useState(false);
        const [notice, setNotice] = react.useState(null);
        react.useEffect(() => pomoSettingsScope.subscribe(() => {
          setSnap(pomoSettingsScope.getSnapshot());
        }), []);

        if (snap.status === "unavailable") {
          return react.createElement("div", { className: "pomo-setmsg", role: "status" }, "设置不可用：远程浏览器不提供持久化设置（仅 loopback 可用）。");
        }
        if (snap.status === "error") {
          return react.createElement("div", { className: "pomo-setmsg", role: "alert" }, "设置加载失败：" + (snap.error?.message ?? String(snap.error)));
        }
        if (snap.status === "loading" || snap.value === undefined) {
          return react.createElement("div", { className: "pomo-setmsg", role: "status" }, "加载设置中…");
        }
        if (snap.writable === false) {
          return react.createElement("div", { className: "pomo-setmsg", role: "status" }, "当前组合没有可用的 settings 域；番茄钟仍使用宿主解析配置，但不能在这里持久化修改。");
        }
        const value = snap.value;
        const createDraft = (source, revision) => ({
          focus: String(source.focusMinutes),
          break: String(source.breakMinutes),
          autoStartBreaks: source.autoStartBreaks !== false,
          autoStartFocus: source.autoStartFocus === true,
          baseRevision: revision,
        });
        const draft = drafts ?? createDraft(value, snap.revision);
        const hasExternalUpdate = drafts !== null && drafts.baseRevision !== snap.revision;
        const hasConflict = hasExternalUpdate || notice?.kind === "conflict";
        const conflictText = notice?.kind === "conflict"
          ? notice.text
          : "设置已在其他位置更新，草稿已保留。";
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
          return Number.isSafeInteger(n) && n >= 1 ? n : null;
        };
        const conflictNotice = (operation) => ({
          kind: "conflict",
          text: drafts === null
            ? `设置已在其他位置更新，${operation}未执行。`
            : `设置已在其他位置更新，${operation}未执行，草稿已保留。`,
        });
        const reloadLatest = () => {
          setBusy(true);
          setNotice(null);
          pomoSettingsScope.reload().then(() => {
            setBusy(false);
            setDrafts(null);
            setNotice({ kind: "success", text: "已重新加载最新设置" });
          }, (error) => {
            setBusy(false);
            setNotice({
              kind: "conflict",
              text: "重新加载失败，当前草稿仍已保留：" + (error?.message ?? String(error)),
            });
          });
        };
        const save = () => {
          const f = readNum("focus");
          const b = readNum("break");
          if (f === null || b === null) {
            setNotice({ kind: "error", text: "请输入 ≥1 的整数分钟数" });
            return;
          }
          setBusy(true);
          setNotice(null);
          pomoSettingsScope.save({
            focusMinutes: f,
            breakMinutes: b,
            autoStartBreaks: draft.autoStartBreaks,
            autoStartFocus: draft.autoStartFocus,
          }, draft.baseRevision).then(() => {
            setBusy(false);
            setDrafts(null);
            setNotice({ kind: "success", text: "已保存" });
          }, (error) => {
            setBusy(false);
            setNotice(error?.code === "SETTINGS_CONFLICT"
              ? conflictNotice("保存")
              : { kind: "error", text: "保存失败：" + (error?.message ?? String(error)) });
          });
        };
        const clearOverrides = () => {
          setBusy(true);
          setNotice(null);
          pomoSettingsScope.reset(draft.baseRevision).then(() => {
            setBusy(false);
            setDrafts(null);
            setNotice({ kind: "success", text: "已清除自定义设置" });
          }, (error) => {
            setBusy(false);
            setNotice(error?.code === "SETTINGS_CONFLICT"
              ? conflictNotice("清除")
              : { kind: "error", text: "清除失败：" + (error?.message ?? String(error)) });
          });
        };
        return react.createElement(
          "div",
          { className: "pomo-settings" },
          react.createElement(
            "div",
            { className: "pomo-setrow" },
            react.createElement("label", { className: "pomo-setlabel", htmlFor: "dsh-pomodoro-focus-minutes" }, "专注时长（分钟）"),
            react.createElement("input", {
              id: "dsh-pomodoro-focus-minutes",
              className: "pomo-setinput",
              type: "number",
              min: 1,
              step: 1,
              value: draft.focus,
              disabled: busy,
              onChange: (e) => updateDraft({ focus: e.target.value }),
            })
          ),
          react.createElement(
            "div",
            { className: "pomo-setrow" },
            react.createElement("label", { className: "pomo-setlabel", htmlFor: "dsh-pomodoro-break-minutes" }, "休息时长（分钟）"),
            react.createElement("input", {
              id: "dsh-pomodoro-break-minutes",
              className: "pomo-setinput",
              type: "number",
              min: 1,
              step: 1,
              value: draft.break,
              disabled: busy,
              onChange: (e) => updateDraft({ break: e.target.value }),
            })
          ),
          react.createElement(
            "label",
            { className: "pomo-setrow pomo-settoggle" },
            react.createElement("span", { className: "pomo-setlabel" }, "自动开始休息"),
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
            react.createElement("span", { className: "pomo-setlabel" }, "自动开始下一轮专注"),
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
            { className: "pomo-setactions" },
            react.createElement("button", { className: "pomo-btn pomo-btn-main", type: "button", disabled: busy || hasConflict, onClick: save }, busy ? "保存中…" : "保存"),
            react.createElement("button", { className: "pomo-btn", type: "button", disabled: busy || hasConflict, onClick: clearOverrides }, "清除自定义设置")
          ),
          hasConflict ? react.createElement(
            "div",
            { className: "pomo-setconflict", role: "alert" },
            react.createElement("span", { className: "pomo-setconflict-text" }, conflictText),
            react.createElement("button", { className: "pomo-btn", type: "button", disabled: busy, onClick: reloadLatest }, busy ? "加载中…" : "重新加载")
          ) : null,
          notice !== null && notice.kind !== "conflict" ? react.createElement("div", {
            className: "pomo-setnotice" + (notice.kind === "error" ? " pomo-setnotice-error" : ""),
            role: notice.kind === "error" ? "alert" : "status",
            "aria-live": "polite",
          }, notice.text) : null
        );
      }

      function PomodoroSettingsCard() {
        const [open, setOpen] = react.useState(false);
        return react.createElement(
          "li",
          { className: "pomo-settings-card" + (open ? " pomo-settings-card-open" : "") },
          react.createElement(
            "button",
            {
              className: "pomo-card-header",
              type: "button",
              "aria-label": (open ? "收起设置：" : "展开设置：") + "番茄钟",
              "aria-expanded": open,
              "aria-controls": "dsh-pomodoro-settings-body",
              onClick: () => setOpen((value) => !value),
            },
            react.createElement(
              "span",
              { className: "pomo-card-headtext" },
              react.createElement("span", { className: "pomo-card-name" }, "番茄钟"),
              react.createElement("span", { className: "pomo-card-description" }, "配置专注与休息循环。")
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
            react.createElement(PomodoroSettings)
          )
        );
      }

      slots.inject("settings.plugin.item", () => slots.register(
        { name: "settings.plugin.item", id: "pomodoro", order: 30 },
        () => react.createElement(PomodoroSettingsCard)
      ));

      slots.inject("sidebar.footer.action", () => slots.register(
        { name: "sidebar.footer.action", id: "pomodoro.toggle", order: 10, label: "番茄钟" },
        (props) => react.createElement(ToggleButton, { wide: props.wide })
      ));

      slots.inject("shell.overlay", () => slots.register(
        { name: "shell.overlay", id: "pomodoro.panel", order: 10 },
        () => react.createElement(PomodoroPanel)
      ));

      slots.inject("shell.overlay", () => slots.register(
        { name: "shell.overlay", id: "pomodoro.completion", order: 20 },
        () => react.createElement(CompletionToast)
      ));
    }

    exports.apply = apply;
    // 四项均为生命周期硬依赖：确保一次性 ctx.get() 不会漏掉晚于插件激活的宿主服务。
    exports.inject = ["timer", "slots", "connection", "remote"];
    return module.exports;
  },
});
