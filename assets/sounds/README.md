# 番茄钟完成提示音

这些文件来自 Robin Lamb 发布在 OpenGameArt 的
[UI Sound Effects (Button Clicks, User Feedback, Notifications)](https://opengameart.org/content/ui-sound-effects-button-clicks-user-feedback-notifications)，
原作品以 [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) 贡献给公共领域。

| 文件 | 原始文件 | 时长 | 定位 |
|---|---|---:|---|
| `deep-ding.mp3` | `ding_deep.wav` | 约 1.9 秒 | 低沉、稳重 |

转换参数为单声道、44.1 kHz、LAME VBR quality 5，并移除了源文件元数据。
客户端将这个源文件嵌入 `lib/client.js`，每次只播放前 1 秒，停 1 秒，共播放 3 次。
源 MP3 用于追溯素材与授权，不单独进入 npm 发布清单。
