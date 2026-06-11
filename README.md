# zabt — ZeppOS 自适应按键融合库 / ZeppOS Adaptive Button Library

[中文](#中文) | [English](#english)

---

## 中文

### 是什么

**zabt** 将 ZeppOS 手表的物理按键与触摸屏按钮融合——焦点高亮、按下动画、超时撤销、触屏焦点同步。首个 `zabtBtn()` 调用自动注册按键，无需手动 `onKey`。

### 安装

```bash
# pnpm（推荐）
pnpm add @zh40s05/zepp-adaptive-button
# npm
npm install @zh40s05/zepp-adaptive-button
# 手动
cp zabt.js your-app/utils/zabt.js
```

### 快速开始

相比普通按钮**仅两处改动**：换函数名、加可选 `order`。

```js
import { zabtBtn } from '../utils/zabt'

// 普通按钮
const btn = zabtBtn({
  x: 100, y: 310, w: 280, h: 56,
  radius: 28, text_size: 28,
  normal_color: 0x374151, press_color: 0x232C36,
  text: '确认', click_func: () => showToast({ content: 'ok' }),
  order: 0,
})

// 弹窗按钮 — antiBounce: true
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
```

### API

| 导出 | 说明 |
|---|---|
| `zabtBtn(opts)` | 创建融合按钮。所有 `createWidget(widget.BUTTON, ...)` 字段 + `order`/`focusColor`/`focusSrc`/`antiBounce` |
| `zabtSetScrollConfig(cfg)` | 焦点跟随滚动 + 自动系统滚动模式配置 |
| `zabtSetLabel(w, text)` | 修改按钮文字 |
| `zabtSetNormalColor(w, c)` | 修改 normal 态颜色（自动重算 focusColor） |
| `zabtBlock()` | 手动阻断按键 |
| `zabtUnblock()` | 释放阻断 + 丢弃一次残留确认事件 |

### 按钮可选参数

| 参数 | 说明 |
|---|---|
| `order` | 导航顺序。不传按创建顺序自动补入，冲突后延 |
| `focusColor` | 高亮色。不传基于 `normal_color` 自动调亮（每通道 +0x28） |
| `focusSrc` | 高亮图片（图片按钮）。不传显示"未定义高亮" |
| `antiBounce` | `true` 用于弹窗/模态框按钮。默认 `false` |

### antiBounce — 何时用

**问题**：按键打开弹窗，同一次按键的尾随 CLICK 在弹窗关闭后重新触发按钮。

**方案**：`antiBounce: true` 动作后自动阻断。弹窗关闭时调 `zabtUnblock()` 释放 + 丢弃一次残留事件。

| ✅ 用 | ❌ 不用 |
|---|---|
| `createModal` | `showToast` |
| 消耗按键的 UI 层 | `launchApp` |
| | `setProperty` / 状态切换 |

### 焦点跟随滚动 — `zabtSetScrollConfig`

替代手动 `setScrollMode`，一次调用同时配置系统滚动模式 + 按钮焦点追踪。

需 app.json 权限：`"data:os.device.info"`

| 模式 | 调用 | 官方对应 |
|---|---|---|
| 锁定（默认） | 不调用 | — |
| 自由滚动 | `{ mode: 'free' }` | `SCROLL_MODE_FREE` |
| 纵向翻页 | `{ mode: 'swiper', pageCount: 3 }` | `SCROLL_MODE_SWIPER` + options.height/count |
| 横向翻页 | `{ mode: 'swiper-h', pageCount: 3 }` | `SCROLL_MODE_SWIPER_HORIZONTAL` + options.width/count |

**自动获取**（可传入覆盖）：`screenHeight`（设备屏幕高度）, `pageSize`（默认等于屏幕高度）

```js
// 自由滚动
zabtSetScrollConfig({ mode: 'free' })

// 横向翻页
zabtSetScrollConfig({ mode: 'swiper-h', pageCount: 3 })
```

### 行为规则

- 无焦点 + SELECT → 触发 order 最小按钮
- 无焦点 + UP → 选中 order 最小 / DOWN → 选中 order 次小
- 导航边界环绕
- SELECT 按住 > 1s → 超时撤销（日志输出按钮文字）
- 触屏点击 → 执行动作 + 移动内部焦点（不显示高亮），之后按键恢复

### Example / 示例

[example/](example/) 自包含测试程序，直接复制运行 `zeus build`。

演示：order 分配、focusColor 自动/手动、动态修改文字颜色、antiBounce 弹窗、自由滚动、横向/纵向翻页。

---

## English

### What

**zabt** fuses physical keys (SELECT/HOME/UP/DOWN) with touchscreen buttons — focus highlight, press animation, hold-to-cancel, touch-focus sync. Keys are auto-registered on the first `zabtBtn()` call.

### Install

```bash
pnpm add @zh40s05/zepp-adaptive-button
npm install @zh40s05/zepp-adaptive-button
cp zabt.js your-app/utils/zabt.js
```

### Quick Start

**Only 2 changes** from a normal button: swap the function, add optional `order`.

```js
import { zabtBtn } from '../utils/zabt'

// Normal button
const btn = zabtBtn({
  x: 100, y: 310, w: 280, h: 56,
  radius: 28, text_size: 28,
  normal_color: 0x374151, press_color: 0x232C36,
  text: 'Confirm', click_func: () => showToast({ content: 'ok' }),
  order: 0,
})

// Modal button — antiBounce: true
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
```

### API

| Export | Description |
|---|---|
| `zabtBtn(opts)` | Create fused button. All `createWidget(widget.BUTTON, ...)` fields + `order`/`focusColor`/`focusSrc`/`antiBounce` |
| `zabtSetScrollConfig(cfg)` | Scroll-aware focus + auto system scroll mode setup |
| `zabtSetLabel(w, text)` | Change button text |
| `zabtSetNormalColor(w, c)` | Change normal color (auto-recalc focusColor) |
| `zabtBlock()` | Manually block key input |
| `zabtUnblock()` | Unblock + discard one residual confirm event |

### Button Options

| Field | Description |
|---|---|
| `order` | Navigation order. Auto-assigned if omitted, conflicts shift later |
| `focusColor` | Highlight color. Auto-calc from `normal_color` (+0x28/channel) |
| `focusSrc` | Highlight image (image buttons). Falls back to "未定义高亮" |
| `antiBounce` | `true` for modal/popup buttons. Default `false` |

### antiBounce — When & Why

**Problem**: key-triggered modal → trailing CLICK re-triggers after close.

**Solution**: `antiBounce: true` auto-blocks after action. Call `zabtUnblock()` on modal close.

| ✅ Use | ❌ Don't |
|---|---|
| `createModal` | `showToast` |
| Any key-consuming UI | `launchApp` |
| | `setProperty` / state toggle |

### Scroll-Aware Focus — `zabtSetScrollConfig`

Replaces manual `setScrollMode`. One call = system scroll mode + focus tracking.

Requires `"data:os.device.info"` in app.json.

| Mode | Config | Official API |
|---|---|---|
| Locked (default) | (no call) | — |
| Free scroll | `{ mode: 'free' }` | `SCROLL_MODE_FREE` |
| Swiper V | `{ mode: 'swiper', pageCount: 3 }` | `SCROLL_MODE_SWIPER` + height/count |
| Swiper H | `{ mode: 'swiper-h', pageCount: 3 }` | `SCROLL_MODE_SWIPER_HORIZONTAL` + width/count |

**Auto-detected** (override by passing): `screenHeight`, `pageSize` (defaults to screenHeight)

```js
zabtSetScrollConfig({ mode: 'free' })
zabtSetScrollConfig({ mode: 'swiper-h', pageCount: 3 })
```

### Behavior

- No focus + SELECT → smallest-order button
- No focus + UP → smallest / DOWN → second-smallest
- Navigation wraps
- SELECT held > 1s → cancelled (logs button text)
- Touch-click → execute + move focus (no highlight), keys restore highlight

### Example

[example/](example/) — self-contained test app with 4 page modes.

Demos: order, focusColor, dynamic updates, antiBounce modal, free scroll, swiper-h, swiper-v.

## License

MIT © 2026 ZHAO
