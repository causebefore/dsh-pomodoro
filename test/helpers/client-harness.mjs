import { readFile } from "node:fs/promises";
import vm from "node:vm";

const CLIENT_SOURCE = await readFile(new URL("../../lib/client.js", import.meta.url), "utf8");
const RUNTIME_STORAGE_KEY = "dsh-pomodoro.runtime.v1";

const DEFAULT_SETTINGS = {
  focusMinutes: 25,
  breakMinutes: 5,
  autoStartBreaks: true,
  autoStartFocus: false,
  completionSound: false,
  systemNotifications: false,
};

export class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export function runtimeSnapshot(overrides = {}) {
  const totalMs = overrides.totalMs ?? 25 * 60 * 1000;
  const running = overrides.running ?? false;
  const updatedAt = overrides.updatedAt ?? 100000;
  return {
    version: 1,
    revision: 1,
    transitionSeq: 0,
    phase: "focus",
    running,
    totalMs,
    deadlineAt: running ? updatedAt + totalMs : null,
    remainingMs: running ? null : totalMs,
    pomos: 0,
    updatedAt,
    lastCompletionId: null,
    completionClaimedBy: null,
    ...overrides,
  };
}

export function createSharedEnvironment(initialNow = 100000) {
  let now = initialNow;
  let tabSequence = 0;
  let timerSequence = 0;
  let writeCount = 0;
  let writesOutsideLock = 0;
  let activeLockCount = 0;
  const lockRequests = [];
  const storageData = new Map();
  const tabs = new Set();
  const slotRegistrations = [];
  const lockTails = new Map();
  const channelMembers = new Map();

  const queueStorageEvent = (source, key, oldValue, newValue) => {
    for (const tab of tabs) {
      if (tab === source || tab.disposed) continue;
      queueMicrotask(() => tab.emitWindow("storage", { key, oldValue, newValue }));
    }
  };

  const lockManager = {
    request(name, options, callback) {
      const operation = typeof options === "function" ? options : callback;
      lockRequests.push({ name, mode: typeof options === "object" ? options.mode : undefined });
      const previous = lockTails.get(name) ?? Promise.resolve();
      const invoke = async () => {
        activeLockCount += 1;
        try {
          return await operation();
        } finally {
          activeLockCount -= 1;
        }
      };
      const current = previous.then(invoke, invoke);
      lockTails.set(name, current.catch(() => {}));
      return current;
    },
  };

  class FakeDate extends Date {
    constructor(...args) {
      super(...(args.length === 0 ? [now] : args));
    }

    static now() {
      return now;
    }
  }

  function createTab(options = {}) {
    const tabId = `tab-${++tabSequence}`;
    const windowListeners = new Map();
    const documentListeners = new Map();
    const effectDisposers = [];
    const intervals = [];
    const timers = new Map();
    const completions = [];
    const warnings = [];
    const errors = [];
    let hook = null;
    let tab = null;
    let uuidSequence = 0;
    let loadedModule = null;

    const addListener = (map, name, listener) => {
      if (!map.has(name)) map.set(name, new Set());
      map.get(name).add(listener);
    };
    const removeListener = (map, name, listener) => map.get(name)?.delete(listener);
    const emit = (map, name, event = {}) => {
      for (const listener of Array.from(map.get(name) ?? [])) listener(event);
    };

    const localStorage = {
      getItem(key) {
        return storageData.has(key) ? storageData.get(key) : null;
      },
      setItem(key, value) {
        if (options.storageSetError) throw new Error("setItem unavailable");
        const oldValue = storageData.has(key) ? storageData.get(key) : null;
        const newValue = String(value);
        storageData.set(key, newValue);
        writeCount += 1;
        if (key === RUNTIME_STORAGE_KEY && activeLockCount === 0) writesOutsideLock += 1;
        queueStorageEvent(tab, key, oldValue, newValue);
      },
      removeItem(key) {
        const oldValue = storageData.has(key) ? storageData.get(key) : null;
        storageData.delete(key);
        queueStorageEvent(tab, key, oldValue, null);
      },
    };

    class FakeBroadcastChannel {
      constructor(name) {
        this.name = name;
        this.onmessage = null;
        this.closed = false;
        if (!channelMembers.has(name)) channelMembers.set(name, new Set());
        channelMembers.get(name).add(this);
      }

      postMessage(data) {
        for (const channel of Array.from(channelMembers.get(this.name) ?? [])) {
          if (channel === this || channel.closed) continue;
          queueMicrotask(() => channel.onmessage?.({ data }));
        }
      }

      close() {
        this.closed = true;
        channelMembers.get(this.name)?.delete(this);
      }
    }

    const document = {
      visibilityState: "visible",
      head: { appendChild() {} },
      querySelector() { return null; },
      createElement() { return { dataset: {}, textContent: "" }; },
      getElementById() { return null; },
      hasFocus() { return true; },
      addEventListener(name, listener) { addListener(documentListeners, name, listener); },
      removeEventListener(name, listener) { removeListener(documentListeners, name, listener); },
    };

    const window = {
      localStorage,
      navigator: { locks: options.withLocks === false ? undefined : lockManager },
      crypto: { randomUUID: () => `${tabId}-uuid-${++uuidSequence}` },
      BroadcastChannel: options.withBroadcast === false ? undefined : FakeBroadcastChannel,
      AudioContext: undefined,
      webkitAudioContext: undefined,
      isSecureContext: true,
      atob: (value) => Buffer.from(value, "base64").toString("binary"),
      addEventListener(name, listener) { addListener(windowListeners, name, listener); },
      removeEventListener(name, listener) { removeListener(windowListeners, name, listener); },
      setTimeout(callback, delay = 0) {
        const id = ++timerSequence;
        timers.set(id, { callback, dueAt: now + Math.max(0, Number(delay) || 0) });
        return id;
      },
      clearTimeout(id) { timers.delete(id); },
      __POMO_DEBUG_FOCUS_MS: options.debugFocusMs,
      __POMO_DEBUG_BREAK_MS: options.debugBreakMs,
      __POMO_TEST_HOOK__(value) { hook = value; },
      __ModuleLoader__: {
        load(value) { loadedModule = value; },
      },
    };
    window.window = window;

    const settingsRead = options.settingsRead ?? DEFAULT_SETTINGS;
    const connection = {
      isLoopback: options.isLoopback !== false,
      rpc: {
        async call(_scope, endpoint) {
          if (endpoint !== "settings.read") throw new Error(`Unexpected endpoint: ${endpoint}`);
          const source = typeof settingsRead === "function" ? settingsRead() : settingsRead;
          const value = await source;
          return {
            ok: true,
            value: {
              value: { ...DEFAULT_SETTINGS, ...value },
              user: null,
              revision: 1,
              writable: true,
            },
          };
        },
      },
    };
    const slots = {
      inject(_name, register) { return register(); },
      register(options) {
        slotRegistrations.push(options);
        return () => {};
      },
    };
    const locale = {
      register() { return () => {}; },
      bind() { return (key) => key; },
    };
    const remote = { $on() { return () => {}; } };
    const ctx = {
      get(name) {
        return { slots, locale, connection, remote }[name];
      },
      effect(setup) {
        const dispose = setup();
        if (typeof dispose === "function") effectDisposers.push(dispose);
        return dispose;
      },
      interval(callback) {
        intervals.push(callback);
        return () => {};
      },
      on() { return () => {}; },
    };

    const tabConsole = {
      log() {},
      info() {},
      warn(...args) { warnings.push(args); },
      error(...args) { errors.push(args); },
    };
    const context = vm.createContext({
      window,
      document,
      console: tabConsole,
      Date: FakeDate,
      Buffer,
      setTimeout: window.setTimeout,
      clearTimeout: window.clearTimeout,
    });
    new vm.Script(CLIENT_SOURCE, { filename: "lib/client.js" }).runInContext(context);
    const clientModule = loadedModule.factory((name) => {
      if (name === "react") return {};
      if (name === "@deepseek-ai/dsh-client-ui-primitives") return { Toast() {} };
      throw new Error(`Unexpected client dependency: ${name}`);
    });
    clientModule.apply(ctx);
    if (hook === null) throw new Error("Pomodoro test hook was not installed");

    tab = {
      id: tabId,
      api: hook,
      completions,
      warnings,
      errors,
      disposed: false,
      emitWindow(name, event) { emit(windowListeners, name, event); },
      emitDocument(name, event) { emit(documentListeners, name, event); },
      runIntervals() {
        for (const interval of intervals) interval();
      },
      runDueTimers() {
        const due = Array.from(timers.entries())
          .filter(([, timer]) => timer.dueAt <= now)
          .sort((left, right) => left[1].dueAt - right[1].dueAt);
        for (const [id, timer] of due) {
          if (!timers.delete(id)) continue;
          timer.callback();
        }
      },
      dispose() {
        if (tab.disposed) return;
        tab.disposed = true;
        for (const dispose of effectDisposers.reverse()) dispose();
        tabs.delete(tab);
      },
    };
    tabs.add(tab);
    if (options.captureCompletions !== false) {
      hook.completionEvents.subscribe((event) => completions.push(event));
    }
    return tab;
  }

  async function flush(rounds = 12) {
    for (let index = 0; index < rounds; index += 1) await Promise.resolve();
  }

  return {
    createTab,
    flush,
    get now() { return now; },
    setNow(value) { now = value; },
    advance(ms) { now += ms; },
    seed(snapshot) { storageData.set(RUNTIME_STORAGE_KEY, JSON.stringify(snapshot)); },
    seedRaw(raw) { storageData.set(RUNTIME_STORAGE_KEY, raw); },
    seedKey(key, raw) { storageData.set(key, raw); },
    readKey(key) {
      const raw = storageData.get(key);
      return raw === undefined ? null : raw;
    },
    read() {
      const raw = storageData.get(RUNTIME_STORAGE_KEY);
      return raw === undefined ? null : JSON.parse(raw);
    },
    get writeCount() { return writeCount; },
    get writesOutsideLock() { return writesOutsideLock; },
    get lockRequests() { return lockRequests.slice(); },
    get slotRegistrations() { return slotRegistrations.slice(); },
  };
}
