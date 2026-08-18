<div align="center">

<h1>🍅 dsh-pomodoro</h1>

<p>A Pomodoro plugin that adds focus and break cycles to the DeepSeek Harness Web UI.</p>

<p>
  <strong>English</strong> ·
  <a href="./README.zh.md">简体中文</a>
</p>

<p>
  <a href="https://www.npmjs.com/package/dsh-pomodoro"><img alt="npm version" src="https://img.shields.io/npm/v/dsh-pomodoro.svg?logo=npm"></a>
  <a href="https://www.npmjs.com/package/dsh-pomodoro"><img alt="npm monthly downloads" src="https://img.shields.io/npm/d18m/dsh-pomodoro.svg"></a>
  <a href="https://www.npmjs.com/package/dsh-pomodoro"><img alt="Node.js version" src="https://img.shields.io/node/v/dsh-pomodoro.svg?logo=node.js"></a>
  <a href="https://github.com/deepseek-ai/deepseek-harness"><img alt="DSH 0.1.0-rc.7" src="https://img.shields.io/badge/DSH-0.1.0--rc.7-4B8BF5"></a>
  <a href="https://github.com/causebefore/dsh-pomodoro/blob/main/LICENSE"><img alt="MIT license" src="https://img.shields.io/npm/l/dsh-pomodoro.svg"></a>
</p>

<p>
  <a href="#interface-preview">Interface Preview</a> ·
  <a href="#highlights">Highlights</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#usage">Usage</a> ·
  <a href="#settings-and-notifications">Settings and Notifications</a> ·
  <a href="#troubleshooting">Troubleshooting</a>
</p>

</div>

> **Compatibility:** The current compatibility baseline is DeepSeek Harness `0.1.0-rc.7` (`0.1.0-rc.6` is also supported). Harness is still in developer preview, so recheck plugin compatibility after upgrading DSH.

## Interface Preview

Supports light and dark themes, a compact mini mode, and configuration through DSH plugin settings.

<table>
  <tr>
    <th align="center">Light theme</th>
    <th align="center">Dark theme</th>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/causebefore/dsh-pomodoro/main/docs/images/pomodoro-light-en.png" alt="Pomodoro floating panel in the light theme" width="250"></td>
    <td align="center"><img src="https://raw.githubusercontent.com/causebefore/dsh-pomodoro/main/docs/images/pomodoro-dark-en.png" alt="Pomodoro floating panel in the dark theme" width="250"></td>
  </tr>
</table>

### Mini mode

<p align="center">
  <img src="https://raw.githubusercontent.com/causebefore/dsh-pomodoro/main/docs/images/pomodoro-mini-en.png" alt="Mini Pomodoro panel showing only the phase, countdown, and primary control" width="186">
</p>

### Settings

<p align="center">
  <img src="https://raw.githubusercontent.com/causebefore/dsh-pomodoro/main/docs/images/pomodoro-settings-en.png" alt="Pomodoro settings card in DSH plugin settings" width="580">
</p>

## Highlights

- **Native DSH integration:** Open Pomodoro from the sidebar and manage its options from the DSH plugin settings page.
- **Complete timer controls:** Start, pause, reset, or skip a phase, with a circular progress indicator, phase status, and completed-focus count.
- **Cross-session recovery:** Reloading DSH—or reopening it after closing a tab or restarting the browser—resumes from the original deadline. If the active phase expired while DSH was closed, it is settled once.
- **Low-distraction mini mode:** Collapse the panel to the phase, countdown, and primary control while retaining drag, expand, and close actions.
- **Configurable cycles:** Set focus and break durations independently, and choose whether breaks or the next focus session start automatically.
- **Completion feedback:** Always receive an in-app DSH reminder when a phase ends, with optional sound and background system notifications.
- **DSH language support:** Follows the DSH global locale for Chinese and English. Switching languages updates the mounted plugin UI without resetting the timer or unsaved settings draft.
- **Interface-aware:** Adapts to DSH light and dark themes, keyboard operation, and the reduced-motion preference.

## Requirements

| Component | Requirement |
|---|---|
| DeepSeek Harness | Compatibility baseline `0.1.0-rc.7`; `0.1.0-rc.6` also supported |
| Node.js | `^22.19.0` or `>=24.0.0` |
| DSH profile | `web`; headless profiles do not provide the UI |
| pnpm | Available from the command line |

## Quick Start

Install the plugin into the `web` profile:

```powershell
dsh plugin --profile web add dsh-pomodoro
```

Then start or restart DSH Web:

```powershell
dsh web
```

The plugin is loaded when the 🍅 button appears at the bottom of the sidebar.

## Usage

Click the sidebar 🍅 button to open or close the panel. Drag the title bar to reposition it. Use **Mini** in the title bar to hide secondary information, and **Expand** to restore the full panel.

| Control | Behavior |
|---|---|
| Start / Pause | Start or pause the current phase |
| Reset | Restore the current phase to its full duration and pause it |
| Skip | Move to the next phase and keep it paused |
| Mini / Expand | Switch between the low-obstruction layout and full controls |

## Settings and Notifications

Open **Settings → Plugins → Plugin configuration → Pomodoro** in DSH to configure:

| Setting | Default | Behavior |
|---|---:|---|
| Focus duration | 25 minutes | Full duration of each focus phase; accepts an integer from 1 to 240 minutes |
| Break duration | 5 minutes | Full duration of each break phase; accepts an integer from 1 to 240 minutes |
| Start breaks automatically | On | Start the break when a focus phase ends naturally |
| Start the next focus session automatically | Off | Start the next focus session when a break ends naturally |
| Play a sound when a phase ends | Off | Play the completion sound three times; a preview is available |
| Send system notifications in the background | Off | Send a browser notification while the DSH page is in the background |

If the current phase has not started, a new duration takes effect immediately. Once timing has started, the new duration applies from the next phase.

### Completion feedback

- **In-app DSH reminder:** Always enabled. It appears when a focus or break phase ends naturally, even if the Pomodoro panel is closed, and indicates whether the next phase started automatically.
- **Sound:** Off by default. After enabling and saving it, each naturally completed phase plays the sound three times. **Preview** works without saving first.
- **System notification:** Off by default. When enabling it for the first time, allow notifications in the browser prompt and then select **Save**. Notifications are sent only while the DSH page is in the background or does not have focus.

When every DSH page is closed, the browser cannot play the sound or send a notification at the exact deadline. The next DSH launch restores the timer and settles and reports the expired active phase once.

System notifications require DSH to be served from `localhost`, `127.0.0.1`, or HTTPS, and the DSH page must remain open. The in-app reminder continues to work if sound or system notifications are unavailable.

## Updating and Removing

```powershell
# Update the plugin
dsh plugin --profile web update dsh-pomodoro

# Remove the plugin
dsh plugin --profile web remove dsh-pomodoro
```

Restart `dsh web` after either command.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `'pnpm' is not recognized` during install or update | `dsh plugin` forwards to pnpm on PATH: run `npm install -g pnpm` and retry |
| `dsh web` fails to start because port 3080 is in use | A previous instance is still running: find the PID with `netstat -ano \| findstr :3080`, end it with `taskkill /PID <pid> /F`, then restart |
| No 🍅 button in the sidebar | Confirm you are on the `web` profile and ran `dsh plugin --profile web add dsh-pomodoro`, then restart `dsh web` |
| System notifications never arrive | Check browser notification permission and keep the DSH page open; see [Completion feedback](#completion-feedback) |

## Links

- [npm package](https://www.npmjs.com/package/dsh-pomodoro)
- [Releases](https://github.com/causebefore/dsh-pomodoro/releases)
- [Issue tracker](https://github.com/causebefore/dsh-pomodoro/issues)
- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)

## License

[MIT](LICENSE). See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the licenses covering React/ReactDOM and third-party assets such as the CC0 completion sound.

## Development and Maintenance

<details>
<summary><strong>Show local development, project structure, and release workflow</strong></summary>

### Local development

```powershell
git clone https://github.com/causebefore/dsh-pomodoro.git
Set-Location dsh-pomodoro
dsh plugin --profile web add .
npm run check
npm pack --dry-run
```

The project has no build step: `lib/client.js` is the browser bundle that is published directly. Daily development happens on `dev`; `main` only receives versions that have completed release checks.

### Project structure

| Path | Responsibility |
|---|---|
| `lib/index.js` | Node/Cordis entry point, configuration schema, and loopback RPC |
| `lib/client.js` | Browser timer engine, React UI, slot registration, locale messages, and settings synchronization |
| `assets/sounds/deep-ding.mp3` | Source for the CC0 completion sound; its runtime bytes are embedded in the client bundle |
| `docs/images/` | Chinese and English README screenshots plus the GitHub Social Preview image |
| `cordis.patch.yml` | Inserts the plugin service into the DSH Web composition |
| `package.json` | Exports, peer ranges, bundle declaration, and npm publication allowlist |
| `.github/workflows/publish.yml` | Trusted Publishing workflow from a GitHub Release to npm |

### Release workflow

1. Complete development and validation on `dev`, then update the version in `package.json`.
2. Merge `dev` into `main` through a release pull request.
3. Create a stable GitHub Release from the corresponding `main` commit with a name matching `vX.Y.Z`.
4. The publish workflow validates the version, tag, and `main` ancestry, runs syntax and package checks, and publishes through npm Trusted Publishing.

</details>
