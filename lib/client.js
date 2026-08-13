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

    // 包私有样式：主题色走 --dsw-alias-* 令牌，自动适配明暗主题。
    const pomoCss = `
.pomo-panel { position: fixed; right: 24px; bottom: 24px; width: 244px; z-index: 1000; pointer-events: auto; background: var(--dsw-alias-bg-base, #ffffff); color: var(--dsw-alias-label-primary, #1f2328); border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,0.28)); border-radius: 14px; box-shadow: 0 12px 32px rgba(0,0,0,0.18); font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; overflow: hidden; user-select: none; touch-action: none; }
.pomo-panel-moved { right: auto; bottom: auto; }
.pomo-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; cursor: grab; border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,0.16)); }
.pomo-header:active { cursor: grabbing; }
.pomo-title { font-weight: 600; font-size: 13px; color: var(--dsw-alias-label-secondary, inherit); }
.pomo-close { border: none; background: transparent; cursor: pointer; color: var(--dsw-alias-label-tertiary, inherit); font-size: 12px; padding: 2px 7px; border-radius: 6px; }
.pomo-close:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,0.16)); }
.pomo-flash { margin: 10px 12px 0; padding: 8px 10px; border-radius: 8px; background: rgba(232,122,78,0.16); color: #e07a3f; font-size: 12px; text-align: center; animation: pomo-pop 0.3s ease-out; }
.pomo-body { padding: 14px 12px 12px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.pomo-ring-wrap { position: relative; width: 128px; height: 128px; }
.pomo-ring { transform: rotate(-90deg); }
.pomo-ring-bg { fill: none; stroke: var(--dsw-alias-border-l2, rgba(128,128,128,0.18)); stroke-width: 8; }
.pomo-ring-fg { fill: none; stroke: #e05b4d; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 0.25s linear; }
.pomo-ring-break { stroke: #4da3d9; }
.pomo-time { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; font-variant-numeric: tabular-nums; }
.pomo-phase { font-size: 12px; font-weight: 600; color: #e05b4d; }
.pomo-phase-break { color: #4da3d9; }
.pomo-actions { display: flex; gap: 6px; }
.pomo-btn { border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.32)); background: transparent; color: var(--dsw-alias-label-primary, inherit); padding: 5px 10px; border-radius: 8px; font-size: 12px; cursor: pointer; }
.pomo-btn:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,0.1)); }
.pomo-btn-main { background: #e05b4d; border-color: #e05b4d; color: #ffffff; font-weight: 600; }
.pomo-btn-main:hover { background: #c94a3e; }
.pomo-count { font-size: 12px; color: var(--dsw-alias-label-tertiary, inherit); }
.pomo-toggle { display: flex; align-items: center; gap: 6px; border: none; background: transparent; color: var(--dsw-alias-label-primary, inherit); cursor: pointer; font-size: 13px; padding: 4px 8px; border-radius: 8px; }
.pomo-toggle:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,0.16)); }
.pomo-toggle-text { font-size: 12px; font-variant-numeric: tabular-nums; }
.pomo-settings { display: flex; flex-direction: column; gap: 10px; max-width: 360px; padding: 4px 0; }
.pomo-setrow { display: flex; align-items: center; gap: 8px; }
.pomo-setlabel { flex: 1; font-size: 13px; color: var(--dsw-alias-label-secondary, inherit); }
.pomo-setinput { width: 76px; border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.32)); background: var(--dsw-alias-bg-base, transparent); color: var(--dsw-alias-label-primary, inherit); border-radius: 6px; padding: 4px 8px; font-size: 13px; }
.pomo-setinput:focus { border-color: var(--dsw-alias-state-business-primary, #4da3d9); outline: none; }
.pomo-settoggle { cursor: pointer; }
.pomo-setcheck { width: 16px; height: 16px; margin: 0; accent-color: var(--dsw-alias-state-business-primary, #4da3d9); cursor: pointer; }
.pomo-setcheck:disabled { cursor: not-allowed; opacity: 0.55; }
.pomo-setactions { display: flex; gap: 6px; }
.pomo-setnotice { font-size: 12px; color: var(--dsw-alias-state-business-primary, #4da3d9); }
.pomo-setmsg { font-size: 13px; color: var(--dsw-alias-label-secondary, inherit); padding: 4px 0; }
@keyframes pomo-pop { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
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
    // 调试接缝：仅当页面显式设置 window.__POMO_DEBUG_FOCUS_MS / __POMO_DEBUG_BREAK_MS
    // 时生效（调试台用它缩短阶段时长），生产环境不设置，行为与默认值完全一致。
    const DEBUG_FOCUS_MS = typeof window !== "undefined" ? window.__POMO_DEBUG_FOCUS_MS : undefined;
    const DEBUG_BREAK_MS = typeof window !== "undefined" ? window.__POMO_DEBUG_BREAK_MS : undefined;
    const DEFAULT_FOCUS_MS = typeof DEBUG_FOCUS_MS === "number" ? DEBUG_FOCUS_MS : 25 * 60 * 1000;
    const DEFAULT_BREAK_MS = typeof DEBUG_BREAK_MS === "number" ? DEBUG_BREAK_MS : 5 * 60 * 1000;

    // 插件主体：与动态版相同的引擎与 UI，注册进侧栏与全屏浮层。
    function apply(ctx) {
      const slots = ctx.get("slots");
      if (slots === undefined) return;

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
        flashAt: 0,
        left: null,
        top: null,
      };
      let endAt = 0;
      const listeners = new Set();
      const emit = () => { listeners.forEach((fn) => fn(s)); };
      const set = (patch) => { s = Object.assign({}, s, patch); emit(); };

      function startPhase(phase, running = true) {
        const total = totalFor(phase);
        endAt = running ? Date.now() + total : 0;
        set({ phase, remainingMs: total, totalMs: total, running });
      }

      function tick() {
        if (!s.running) return;
        const rem = endAt - Date.now();
        if (rem <= 0) {
          const completedPhase = s.phase;
          const gained = completedPhase === "focus" ? 1 : 0;
          const nextPhase = completedPhase === "focus" ? "break" : "focus";
          const autoStart = completedPhase === "focus" ? cfg.autoStartBreaks : cfg.autoStartFocus;
          set({ pomos: s.pomos + gained, flashAt: Date.now() });
          startPhase(nextPhase, autoStart);
        } else {
          set({ remainingMs: rem });
        }
      }

      const engine = {
        get: () => s,
        subscribe: (fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
        toggleOpen: () => set({ open: !s.open }),
        toggleRun: () => {
          if (s.running) {
            set({ running: false, remainingMs: endAt - Date.now() });
          } else {
            endAt = Date.now() + s.remainingMs;
            set({ running: true });
          }
        },
        reset: () => {
          const total = totalFor(s.phase);
          endAt = Date.now() + total;
          set({ remainingMs: total, totalMs: total, running: false });
        },
        skip: () => startPhase(s.phase === "focus" ? "break" : "focus", false),
        move: (left, top) => set({ left, top }),
      };

      ctx.interval(() => tick(), 250);

      // 宿主配置热更新：校验后写入 cfg。
      // 接受两种形态：settings 域的分层解析值 { focusMinutes, breakMinutes }，
      // 或 /pomodoro RPC 返回的毫秒值 { focusMs, breakMs }。
      // 当前阶段尚未开始且未被改动（剩余 == 总长）时立即生效；否则下一阶段生效。
      function applyRemoteConfig(remote) {
        if (remote === null || typeof remote !== "object") return;
        const focusMs = typeof remote.focusMs === "number" && Number.isFinite(remote.focusMs)
          ? remote.focusMs
          : typeof remote.focusMinutes === "number" && Number.isFinite(remote.focusMinutes)
            ? remote.focusMinutes * 60 * 1000
            : NaN;
        const breakMs = typeof remote.breakMs === "number" && Number.isFinite(remote.breakMs)
          ? remote.breakMs
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
          endAt = Date.now() + total;
          set({ remainingMs: total, totalMs: total });
        }
      }

      // 配置主通道：插件私有 loopback RPC。DSH rc.6 的通用 settings.* API
      // 只暴露核心白名单，第三方命名空间即使已注册也不会出现在 settings.describe 中。
      const connection = ctx.get("connection");
      let pomoSettingsScope = null;
      if (connection !== undefined && typeof connection.rpc?.call === "function") {
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
          if (!result?.ok) throw new Error(result?.error?.message ?? `番茄钟设置请求失败：${endpoint}`);
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
        pomoSettingsScope = {
          getSnapshot: () => snapshot,
          subscribe: (listener) => {
            settingsListeners.add(listener);
            return () => { settingsListeners.delete(listener); };
          },
          save: (value) => enqueue(async () => {
            const view = await callSettings("settings.save", value);
            publishSettings(readySnapshot(view));
            return view;
          }),
          reset: () => enqueue(async () => {
            const view = await callSettings("settings.reset", {});
            publishSettings(readySnapshot(view));
            return view;
          }),
        };
        if (connection.isLoopback) {
          const remote = ctx.get("remote");
          ctx.effect(() => {
            const disposers = [];
            if (remote !== undefined && typeof remote.$on === "function") {
              disposers.push(remote.$on("settings/document-updated", (namespace) => {
                if (namespace === "dsh-pomodoro") loadSettings().catch(() => {});
              }));
            }
            disposers.push(ctx.on("connection/reset", () => { loadSettings().catch(() => {}); }));
            loadSettings().catch((error) => {
              console.error("dsh-pomodoro: 读取宿主设置失败，使用默认时长", error);
            });
            return () => {
              for (const dispose of disposers) dispose();
              settingsListeners.clear();
            };
          }, "dsh-pomodoro: settings invalidations");
        }
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

      const dragState = { active: false, startX: 0, startY: 0, baseLeft: 0, baseTop: 0 };

      function PomodoroPanel() {
        const st = useEngine();
        if (!st.open) return null;
        const hasStarted = st.running || st.remainingMs < st.totalMs;
        const flashOn = Date.now() - st.flashAt < 2600;
        const flashText = st.phase === "break" ? "专注完成，休息一下 ☕" : "休息结束，开始专注 🍅";
        const progress = 1 - st.remainingMs / st.totalMs;
        const ringLen = 2 * Math.PI * 54;
        const pos = st.left !== null ? { left: st.left + "px", top: st.top + "px" } : null;
        return react.createElement(
          "div",
          { className: "pomo-panel" + (pos !== null ? " pomo-panel-moved" : ""), style: pos },
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
                e.currentTarget.setPointerCapture(e.pointerId);
              },
              onPointerMove: (e) => {
                if (!dragState.active) return;
                engine.move(dragState.baseLeft + e.clientX - dragState.startX, dragState.baseTop + e.clientY - dragState.startY);
              },
              onPointerUp: () => { dragState.active = false; },
              onPointerCancel: () => { dragState.active = false; },
            },
            react.createElement("span", { className: "pomo-title" }, "🍅 番茄钟"),
            react.createElement("button", {
              className: "pomo-close",
              title: "关闭",
              onPointerDown: (e) => e.stopPropagation(),
              onClick: () => engine.toggleOpen(),
            }, "✕")
          ),
          flashOn ? react.createElement("div", { className: "pomo-flash" }, flashText) : null,
          react.createElement(
            "div",
            { className: "pomo-body" },
            react.createElement(
              "div",
              { className: "pomo-ring-wrap" },
              react.createElement(
                "svg",
                { className: "pomo-ring", width: 128, height: 128, viewBox: "0 0 128 128" },
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
            hasStarted
              ? react.createElement("div", { className: "pomo-phase" + (st.phase === "break" ? " pomo-phase-break" : "") }, st.phase === "focus" ? "专注中" : "休息中")
              : null,
            react.createElement(
              "div",
              { className: "pomo-actions" },
              react.createElement("button", { className: "pomo-btn pomo-btn-main", onClick: () => engine.toggleRun() }, st.running ? "暂停" : "开始"),
              react.createElement("button", { className: "pomo-btn", onClick: () => engine.reset() }, "重置"),
              react.createElement("button", { className: "pomo-btn", onClick: () => engine.skip() }, "跳过")
            ),
            react.createElement("div", { className: "pomo-count" }, "已完成 🍅 × " + st.pomos)
          )
        );
      }

      function ToggleButton(props) {
        const st = useEngine();
        return react.createElement(
          "button",
          { className: "pomo-toggle", title: "番茄钟", onClick: () => engine.toggleOpen() },
          react.createElement("span", { className: "pomo-toggle-emoji" }, "🍅"),
          props.wide ? react.createElement("span", { className: "pomo-toggle-text" }, st.running ? fmt(st.remainingMs) : "番茄钟") : null
        );
      }

      // —— 用户设置：运行期修改 + settings.yaml 持久化 ——
      function PomodoroSettings() {
        const [snap, setSnap] = react.useState(pomoSettingsScope !== null ? pomoSettingsScope.getSnapshot() : null);
        const [drafts, setDrafts] = react.useState(null);
        const [busy, setBusy] = react.useState(false);
        const [notice, setNotice] = react.useState(null);
        react.useEffect(() => {
          if (pomoSettingsScope === null) return;
          return pomoSettingsScope.subscribe(() => {
            setSnap(pomoSettingsScope.getSnapshot());
            setDrafts(null);
          });
        }, []);

        if (pomoSettingsScope === null) {
          return react.createElement("div", { className: "pomo-setmsg" }, "当前部署没有可用的 settings 域；番茄钟仍使用宿主解析配置，但不能持久化修改。");
        }
        if (snap.status === "unavailable") {
          return react.createElement("div", { className: "pomo-setmsg" }, "设置不可用：远程浏览器不提供持久化设置（仅 loopback 可用）。");
        }
        if (snap.status === "error") {
          return react.createElement("div", { className: "pomo-setmsg" }, "设置加载失败：" + (snap.error?.message ?? String(snap.error)));
        }
        if (snap.status === "loading" || snap.value === undefined) {
          return react.createElement("div", { className: "pomo-setmsg" }, "加载设置中…");
        }
        if (snap.writable === false) {
          return react.createElement("div", { className: "pomo-setmsg" }, "当前组合没有可用的 settings 域；番茄钟仍使用宿主解析配置，但不能在这里持久化修改。");
        }
        const value = snap.value;
        const draft = drafts ?? {
          focus: String(value.focusMinutes),
          break: String(value.breakMinutes),
          autoStartBreaks: value.autoStartBreaks !== false,
          autoStartFocus: value.autoStartFocus === true,
        };
        const updateDraft = (patch) => setDrafts(Object.assign({}, draft, patch));
        const readNum = (field) => {
          const n = parseInt(draft[field], 10);
          return Number.isFinite(n) && n >= 1 ? n : null;
        };
        const save = () => {
          const f = readNum("focus");
          const b = readNum("break");
          if (f === null || b === null) {
            setNotice("请输入 ≥1 的整数分钟数");
            return;
          }
          setBusy(true);
          setNotice(null);
          pomoSettingsScope.save({
            focusMinutes: f,
            breakMinutes: b,
            autoStartBreaks: draft.autoStartBreaks,
            autoStartFocus: draft.autoStartFocus,
          }).then(() => {
            setBusy(false);
            setNotice("已保存，将在下一次阶段切换时生效");
          }, (error) => {
            setBusy(false);
            setNotice("保存失败：" + (error?.message ?? String(error)));
          });
        };
        const clearOverrides = () => {
          setBusy(true);
          setNotice(null);
          pomoSettingsScope.reset().then(() => {
            setBusy(false);
            setNotice("已清除自定义设置");
          }, (error) => {
            setBusy(false);
            setNotice("清除失败：" + (error?.message ?? String(error)));
          });
        };
        return react.createElement(
          "div",
          { className: "pomo-settings" },
          react.createElement(
            "div",
            { className: "pomo-setrow" },
            react.createElement("label", { className: "pomo-setlabel" }, "专注时长（分钟）"),
            react.createElement("input", {
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
            react.createElement("label", { className: "pomo-setlabel" }, "休息时长（分钟）"),
            react.createElement("input", {
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
            react.createElement("button", { className: "pomo-btn pomo-btn-main", disabled: busy, onClick: save }, busy ? "保存中…" : "保存"),
            react.createElement("button", { className: "pomo-btn", disabled: busy, onClick: clearOverrides }, "清除自定义设置")
          ),
          notice !== null ? react.createElement("div", { className: "pomo-setnotice" }, notice) : null
        );
      }

      slots.inject("settings.section", () => slots.register(
        { name: "settings.section", id: "pomodoro", order: 10, label: "番茄钟" },
        () => react.createElement(PomodoroSettings)
      ));

      slots.inject("sidebar.footer.action", () => slots.register(
        { name: "sidebar.footer.action", id: "pomodoro.toggle", order: 10, label: "番茄钟" },
        (props) => react.createElement(ToggleButton, { wide: props.wide })
      ));

      slots.inject("shell.overlay", () => slots.register(
        { name: "shell.overlay", id: "pomodoro.panel", order: 10 },
        () => react.createElement(PomodoroPanel)
      ));
    }

    exports.apply = apply;
    exports.inject = ["timer", "slots", "connection", "remote"];
    return module.exports;
  },
});
