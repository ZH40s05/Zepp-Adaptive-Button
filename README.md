# zabt — ZeppOS 自适应按键融合库

[中文](#中文) | [English](#english)

## 中文

**zabt** 将 ZeppOS 手表的物理按键（SELECT/HOME/UP/DOWN）与触摸屏按钮融合，使按键操作产生与触屏相同的视觉效果——焦点高亮、按下动画、超时撤销、触屏焦点同步。

### 安装

```bash
# 复制库文件到小程序
cp zabt.js your-app/utils/zabt.js
```

### 快速开始

相比普通 `createWidget(widget.BUTTON, ...)` **仅两处改动**：

1. 把 `createWidget(widget.BUTTON, ...)` 换成 `zabtBtn(...)`
2. 加上可选的 `order` 字段

```js
import { zabtBtn, zabtHandleKey } from '../utils/zabt'

// 普通按钮 — 无需 antiBounce
const btn = zabtBtn({
  x: 100, y: 310, w: 280, h: 56,
  radius: 28, text_size: 28,
  normal_color: 0x374151, press_color: 0x232C36,
  text: '确认', click_func: () => showToast({ content: 'ok' }),
  order: 0,
})

// 弹窗按钮 — 需要 antiBounce
const infoBtn = zabtBtn({
  x: 220, y: 420, w: 40, h: 40,
  radius: 20, text_size: 22,
  normal_color: 0x374151, press_color: 0x232C36,
  text: 'i', click_func: () => {
    let m = createModal({
      autoHide: true,
      onClick: () => { m.show(false); zabtUnblock() },
    })
  },
  order: 1, antiBounce: true,
})

// 绑定按键
onKey({ callback: (key, event) => zabtHandleKey(key, event) })
```

### antiBounce — 何时使用、为什么

**问题场景：** 按键触发的动作创建了一个弹窗，同一次物理按键还会产生一个尾随的 CLICK 事件。弹窗关闭后，这个残留 CLICK 会让按钮再次触发——弹窗刚关又弹出来。

**解决方案：** `antiBounce: true` 在动作执行后自动阻断按键。在弹窗的 onClose 中调用 `zabtUnblock()` 释放阻断，同时丢弃恰好一次残留确认事件。

| ✅ 使用 antiBounce | ❌ 不用 antiBounce |
|---|---|
| `createModal` 弹窗 | `showToast` 一次性提示 |
| 需要消耗按键的 UI 层 | `launchApp` 跳转页面 |
| | `setProperty` / 状态切换 |
| | `console.log` |

### API

| 导出 | 说明 |
|---|---|
| `zabtBtn(opts)` | 创建融合按钮。接受所有 `createWidget(widget.BUTTON, ...)` 字段，外加 `order`、`focusColor`、`focusSrc`、`antiBounce`。返回原生 widget。 |
| `zabtHandleKey(key, event)` | 按键回调，直接传给 `onKey`。 |
| `zabtSetLabel(w, text)` | 修改按钮文字。 |
| `zabtSetNormalColor(w, color)` | 修改 normal 态颜色（自动重算 focusColor）。 |
| `zabtBlock()` | 手动阻断所有按键输入。 |
| `zabtUnblock()` | 释放阻断 + 丢弃一次残留确认事件。 |

### 可选参数

| 参数 | 说明 |
|---|---|
| `order` | 导航顺序。不传按创建顺序自动补入，冲突按创建顺序后延。 |
| `focusColor` | 高亮背景色。不传基于 `normal_color` 自动调亮（每通道 +0x28）。 |
| `focusSrc` | 高亮图片。仅图片按钮使用，不传显示 "未定义高亮"。 |
| `antiBounce` | `true` 用于弹窗/模态框按钮。默认 `false`。 |

### 行为规则

- 无焦点 + SELECT → 触发 order 最小按钮
- 无焦点 + UP → 选中 order 最小按钮
- 无焦点 + DOWN → 选中 order 次小按钮
- 导航边界环绕
- SELECT 按住超过 1s → 超时撤销（日志输出按钮文字）
- 触屏点击 → 执行动作 + 内部移动焦点（不显示高亮），之后按键恢复高亮

## Example

## Example / 示例

The [example/](example/) directory is a **self-contained** test app — just copy it and run `zeus build`.

It demonstrates:
- `order` assignment (explicit, auto-fill, conflict resolution)
- `focusColor` (explicit override vs auto-calculated)
- `zabtSetLabel` / `zabtSetNormalColor` dynamic updates
- `antiBounce: true` with `zabtUnblock()` for modal buttons

All coordinates are raw px for 480×480 round screens. No external UI library needed.

[example/](example/) 目录是一个**自包含**的测试程序 — 直接复制并运行 `zeus build` 即可。

演示：`order` 分配（显式/自动/冲突）、`focusColor`（显式/自动）、`zabtSetLabel` / `zabtSetNormalColor` 动态修改、弹窗按钮的 `antiBounce` + `zabtUnblock`。所有坐标均为 480×480 圆屏原始 px，无需外部 UI 库。

## License

MIT © 2026 ZHAO

## English

**zabt** fuses physical key input (SELECT/HOME/UP/DOWN) with touchscreen buttons on ZeppOS watches, so that key presses produce the same visual feedback as touch — focus highlighting, press animation, hold-to-cancel, and touch-focus sync.

### Installation

```bash
# Copy the library into your miniapp
cp zabt.js your-app/utils/zabt.js
```

### Quick Start

**Only 2 changes** from a normal `createWidget(widget.BUTTON, ...)`:

1. Replace `createWidget(widget.BUTTON, ...)` with `zabtBtn(...)`
2. Add the optional `order` field

```js
import { zabtBtn, zabtHandleKey } from '../utils/zabt'

// Normal button — no antiBounce needed
const btn = zabtBtn({
  x: 100, y: 310, w: 280, h: 56,
  radius: 28, text_size: 28,
  normal_color: 0x374151, press_color: 0x232C36,
  text: 'Confirm', click_func: () => showToast({ content: 'ok' }),
  order: 0,
})

// Modal button — needs antiBounce
const infoBtn = zabtBtn({
  x: 220, y: 420, w: 40, h: 40,
  radius: 20, text_size: 22,
  normal_color: 0x374151, press_color: 0x232C36,
  text: 'i', click_func: () => {
    let m = createModal({
      autoHide: true,
      onClick: () => { m.show(false); zabtUnblock() },
    })
  },
  order: 1, antiBounce: true,
})

// Bind keys
onKey({ callback: (key, event) => zabtHandleKey(key, event) })
```

### antiBounce — When & Why

**The problem:** when a key-triggered action creates a modal, the same physical key press generates a trailing CLICK event. After the modal closes, this residual CLICK re-triggers the action.

**The solution:** `antiBounce: true` blocks key input after the action executes. Call `zabtUnblock()` in the modal's onClose — it unblocks and discards one residual confirm event.

| ✅ Use antiBounce | ❌ Don't use antiBounce |
|---|---|
| `createModal` | `showToast` (auto-dismiss, no key interaction) |
| Any UI layer that consumes keys | `launchApp` (page navigates away) |
| | `setProperty` / state toggle (pure data) |
| | `console.log` (no UI side effects) |

### API

| Export | Description |
|---|---|
| `zabtBtn(opts)` | Create a fused button. Accepts all `createWidget(widget.BUTTON, ...)` fields plus `order`, `focusColor`, `focusSrc`, `antiBounce`. Returns the native widget. |
| `zabtHandleKey(key, event)` | Key handler callback. Pass directly to `onKey`. |
| `zabtSetLabel(w, text)` | Change button text. |
| `zabtSetNormalColor(w, color)` | Change normal-state color (auto-recalculates focusColor). |
| `zabtBlock()` | Manually block all key input. |
| `zabtUnblock()` | Unblock + discard one residual confirm event. |

### Optional Fields

| Field | Description |
|---|---|
| `order` | Navigation sequence. Auto-assigned by creation order if omitted; conflicts shift later-created buttons. |
| `focusColor` | Highlight background color. Auto-calculated from `normal_color` (+0x28 per channel) if omitted. |
| `focusSrc` | Highlight image (image buttons only). Falls back to "未定义高亮" text. |
| `antiBounce` | `true` for buttons that create modals/popups. Default `false`. |

### Behavior

- No focus + SELECT → triggers smallest-order button
- No focus + UP → selects smallest-order button
- No focus + DOWN → selects second-smallest-order button
- Navigation wraps at boundaries
- SELECT held > 1s → cancelled (logs button text)
- Touch-click → execute + move internal focus (no highlight); subsequent keys restore highlight

---