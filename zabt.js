/**
 * zabt.js — ZeppOS Adaptive Button Library
 * ZeppOS 自适应按键融合库
 *
 * @version 1.0.0
 * @date    2026/06/11
 * @author  ZHAO
 * @license MIT
 *
 * ============================================================================
 * Overview / 概述
 * ============================================================================
 *
 * ZeppOS watches have two independent input systems: physical keys (SELECT/
 * HOME/UP/DOWN) and touchscreen. This library fuses them so that key presses
 * produce the same visual feedback as touch, while adding focus navigation,
 * hold-to-cancel, and touch-focus sync.
 *
 * ZeppOS 手表的物理按键和触摸屏是两套独立的输入系统。本库将二者融合，
 * 使按键操作产生与触屏相同的视觉效果，同时支持焦点导航、超时撤销、
 * 触屏焦点同步。
 *
 * ============================================================================
 * Quick Start / 快速开始
 * ============================================================================
 *
 *   1. Copy this file to your miniapp's `utils/zabt.js`
 *      将本文件复制到小程序 `utils/zabt.js`
 *
 *   2. Import in your page:
 *      在页面中导入：
 *      import { zabtBtn, zabtHandleKey } from '../utils/zabt'
 *
 *   3. Replace createWidget(widget.BUTTON, ...) with zabtBtn(...).
 *      The config is identical except for the optional `order` field.
 *      用 zabtBtn 替代 createWidget(widget.BUTTON, ...)，配置完全相同，仅多一个可选的 `order`：
 *
 *      const btn = zabtBtn({
 *        x: pw(100), y: pl(310), w: pl(280), h: pl(56),
 *        radius: pl(28), text_size: pl(28),
 *        normal_color: 0x374151, press_color: 0x232C36,
 *        text: 'Button', click_func: action,
 *        order: 0,   // optional / 可选
 *      })
 *
 *   4. Bind key events:
 *      绑定按键事件：
 *      onKey({ callback: (key, event) => zabtHandleKey(key, event) })
 *
 * ============================================================================
 * Optional Fields / 可选参数
 * ============================================================================
 *
 *   order       — Navigation order. Auto-assigned by creation order if omitted;
 *                 conflicts resolved by shifting later-created buttons.
 *                 导航顺序。不传按创建顺序自动补入，冲突按创建顺序后延。
 *
 *   focusColor  — Highlight color. Auto-calculated from normal_color by
 *                 brightening R/G/B by 0x28 each if omitted.
 *                 高亮背景色。不传则基于 normal_color 自动调亮（每通道 +0x28）。
 *
 *   focusSrc    — Highlight image for image buttons only. Falls back to
 *                 showing "未定义高亮" text if omitted.
 *                 高亮图片，仅图片按钮使用。不传则聚焦时显示 "未定义高亮"。
 *
 *   antiBounce  — See dedicated section below.
 *                 详见下方专节说明。
 *
 * ============================================================================
 * antiBounce — When & Why / 防回弹 — 何时使用、为什么
 * ============================================================================
 *
 * [EN] The problem: when a key-triggered action creates a modal/popup, the
 * same physical key press that opened it also generates a trailing CLICK event.
 * After the modal closes (via key or touch), this residual CLICK can re-trigger
 * the same action — causing an immediate second modal.
 *
 * [CN] 问题场景：按键触发的动作创建了一个弹窗/模态框，同一次物理按键还会产
 * 生一个尾随的 CLICK 事件。弹窗关闭后，这个残留 CLICK 会让按钮再次触发——
 * 弹窗刚关又弹出来。
 *
 * [EN] antiBounce solves this: after the action executes, the library blocks
 * key input. When you call zabtUnblock() in the modal's onClose, it unblocks
 * and discards exactly one residual confirm event (RELEASE or CLICK).
 *
 * [CN] antiBounce 的机制：动作执行后库自动阻断按键。在弹窗的 onClose 中调用
 * zabtUnblock() 释放阻断，同时丢弃恰好一次残留确认事件。
 *
 * --- WHEN to use antiBounce: true / 什么时候用 ---
 *
 *   ✓ createModal / 创建弹窗
 *   ✓ Any action that opens a UI layer which itself consumes key events
 *     任何会打开一个需要消费按键事件的 UI 层的动作
 *
 * --- When NOT to use antiBounce / 什么时候不要用 ---
 *
 *   ✗ showToast          — fires once, dismisses automatically, no key interaction
 *                           一次性提示，自动消失，无按键交互
 *   ✗ launchApp          — navigates away, page is gone
 *                           跳转到其他页面，当前页已离开
 *   ✗ setProperty / state toggle — pure data change, no overlay
 *                           纯数据变更，无叠加层
 *   ✗ console.log        — no UI side effects
 *                           无 UI 副作用
 *
 * [EN] Rule of thumb: if the action creates something that needs key events
 * to dismiss AND you want those same keys to work inside it — use antiBounce.
 * For everything else, leave it off. antiBounce adds a blocking + event-discard
 * cycle that is unnecessary overhead for simple actions.
 *
 * [CN] 简单判断：动作创建的 UI 是否需要用按键来关闭，同时你希望按键在弹窗
 * 内部正常工作——是则加 antiBounce。其他情况一律不加。antiBounce 增加了阻断
 * + 丢弃事件的额外流程，对简单动作是无谓的开销。
 *
 * --- Example / 示例 ---
 *
 *   // ✓ 弹窗按钮 — 需要 antiBounce
 *   zabtBtn({
 *     text: 'About', click_func: () => {
 *       let m = createModal({
 *         autoHide: true,
 *         onClick: () => { m.show(false); zabtUnblock() },
 *       })
 *     },
 *     antiBounce: true,
 *   })
 *
 *   // ✗ 普通按钮 — 不需要 antiBounce
 *   zabtBtn({
 *     text: 'Click me', click_func: () => showToast({ content: 'ok' }),
 *     // no antiBounce
 *   })
 *
 * ============================================================================
 * API Reference / API 参考
 * ============================================================================
 *
 *   zabtBtn(opts)              — Create a fused button / 创建融合按钮
 *   zabtHandleKey(key, event)  — Key handler, pass to onKey / 按键回调
 *   zabtSetLabel(w, text)      — Change button text / 修改按钮文字
 *   zabtSetNormalColor(w, c)   — Change normal color (auto-recalc focusColor)
 *                                修改 normal 态颜色（自动重算 focusColor）
 *   zabtBlock()                — Manually block key input / 手动阻断按键
 *   zabtUnblock()              — Unblock + discard one residual confirm event
 *                                释放阻断 + 丢弃一次残留确认事件
 *
 * ============================================================================
 * Behavior Rules / 行为规则
 * ============================================================================
 *
 *   - no focus + SELECT → triggers smallest-order button / 触发 order 最小按钮
 *   - no focus + UP     → selects smallest-order button / 选中 order 最小按钮
 *   - no focus + DOWN   → selects second-smallest-order button / 选中 order 次小按钮
 *   - navigation wraps at boundaries / 导航边界环绕
 *   - SELECT held > 1s  → cancelled, logs button text / 超时撤销
 *   - touch-click a button → execute + move internal focus (no highlight)
 *     subsequent UP/DOWN/SELECT restores highlight
 *     触屏点击 → 执行动作 + 内部移动焦点（不显示高亮），之后按键恢复高亮
 *
 * @example
 * // Normal button — no antiBounce needed
 * // 普通按钮 — 无需 antiBounce
 * const btn = zabtBtn({
 *   x: pw(100), y: pl(310), w: pl(280), h: pl(56),
 *   radius: pl(28), text_size: pl(28),
 *   normal_color: DARK, press_color: PRESS,
 *   text: 'Confirm', click_func: () => showToast({ content: 'ok' }),
 *   order: 0,
 * })
 *
 * // Modal button — needs antiBounce
 * // 弹窗按钮 — 需要 antiBounce
 * const infoBtn = zabtBtn({
 *   x: pw(220), y: pl(420), w: pl(40), h: pl(40),
 *   radius: pl(20), text_size: pl(22),
 *   normal_color: DARK, press_color: PRESS,
 *   text: 'i', click_func: () => {
 *     let m = createModal({
 *       autoHide: true,
 *       onClick: () => { m.show(false); zabtUnblock() },
 *     })
 *   },
 *   order: 1, antiBounce: true,
 * })
 *
 * onKey({ callback: (key, event) => zabtHandleKey(key, event) })
 */

import { createWidget, widget, prop } from '@zos/ui'
import { KEY_SELECT, KEY_HOME, KEY_UP, KEY_DOWN, KEY_EVENT_CLICK, KEY_EVENT_PRESS, KEY_EVENT_RELEASE } from '@zos/interaction'

const DEFAULT_FOCUS = 0x5B6B80
const NO_FOCUS_IMG = '未定义高亮'
const HOLD_MS = 1000
let _entries = []      // [{ w, opts, state, _origText, _origAction }], 按 order 排序
let _focusIdx = null
let _focusVisible = false
let _pressing = false
let _blocked = false
let _skipConfirm = false  // unblock 后丢弃下一次确认
let _skipTimer = null
let _finalized = false
let _pressTimer = null
let _cancelled = false
let _clickFallback = true  // PRESS 来了置 false, CLICK 兜底用

function _autoFocusColor(c) {
  const r = Math.min(255, ((c >> 16) & 0xFF) + 0x28)
  const g = Math.min(255, ((c >> 8) & 0xFF) + 0x28)
  const b = Math.min(255, (c & 0xFF) + 0x28)
  return (r << 16) | (g << 8) | b
}

function _resolveFocusColor(opts) {
  if (opts.focusColor !== undefined) return opts.focusColor
  if (opts.normal_color !== undefined) return _autoFocusColor(opts.normal_color)
  return DEFAULT_FOCUS
}

function _isImgBtn(opts) {
  return opts.normal_src !== undefined || opts.press_src !== undefined
}

function _find(w) {
  for (let i = 0; i < _entries.length; i++) {
    if (_entries[i].w === w) return _entries[i]
  }
  return null
}

function _syncOne(e) {
  const o = e.opts

  let normalColor, text
  if (e.state === 'press') {
    normalColor = o.press_color
    text = e._origText
  } else if (e.state === 'focus') {
    normalColor = e._focusColor
    text = (_isImgBtn(o) && !o.focusSrc) ? NO_FOCUS_IMG : e._origText
  } else {
    normalColor = o.normal_color
    text = e._origText
  }

  const cfg = {
    x: o.x, y: o.y, w: o.w, h: o.h,
    radius: o.radius, text_size: o.text_size,
    normal_color: normalColor, press_color: o.press_color,
    text,
  }
  if (e.state === 'focus' && o.focusSrc) cfg.normal_src = o.focusSrc
  else if (o.normal_src !== undefined) cfg.normal_src = o.normal_src
  if (o.press_src !== undefined) cfg.press_src = o.press_src

  e.w.setProperty(prop.MORE, cfg)
}

function _syncAll() {
  for (let i = 0; i < _entries.length; i++) {
    _entries[i].state = _pressing && _focusIdx === i       ? 'press'
                      : _focusVisible && _focusIdx === i   ? 'focus'
                      : 'normal'
    _syncOne(_entries[i])
  }
}

function _navigate(dir) {
  const n = _entries.length; if (n === 0) return
  if (_focusIdx === null) {
    _focusIdx = dir < 0 ? 0 : (n > 1 ? 1 : 0)
  } else {
    _focusIdx = (_focusIdx + dir + n) % n
  }
  _focusVisible = true
  _syncAll()
}

function _finalize() {
  if (_finalized || _entries.length === 0) return
  _finalized = true

  const used = {}
  for (let i = 0; i < _entries.length; i++) {
    const order = _entries[i].opts.order
    if (order === undefined) continue
    let v = order
    while (used[v] !== undefined) v++
    used[v] = true
    _entries[i]._order = v
  }

  let next = 0
  for (let i = 0; i < _entries.length; i++) {
    if (_entries[i]._order !== undefined) continue
    while (used[next] !== undefined) next++
    used[next] = true
    _entries[i]._order = next
    next++
  }

  _entries.sort((a, b) => a._order - b._order)
}

function _autoBlock() {
  _blocked = true
}

// ---- public ----

export function zabtBtn(opts) {
  const origAction = opts.click_func
  const w = createWidget(widget.BUTTON, {
    x: opts.x, y: opts.y, w: opts.w, h: opts.h,
    radius: opts.radius, text_size: opts.text_size,
    normal_color: opts.normal_color, press_color: opts.press_color,
    normal_src: opts.normal_src, press_src: opts.press_src,
    text: opts.text,
    click_func: () => {
      _finalize()
      const e = _find(w)
      if (e) {
        _focusIdx = _entries.indexOf(e)
        _focusVisible = false
        _syncAll()
      }
      origAction()
    },
  })
  _entries.push({
    w, opts,
    state: 'normal',
    _origText: opts.text || '',
    _origAction: origAction,
    _focusColor: _resolveFocusColor(opts),
    _antiBounce: opts.antiBounce || false,
  })
  _finalized = false
  return w
}

export function zabtSetLabel(w, text) {
  const e = _find(w); if (!e) return
  e._origText = text
  e.opts.text = text
  _syncOne(e)
}

export function zabtSetNormalColor(w, color) {
  const e = _find(w); if (!e) return
  e.opts.normal_color = color
  if (e.opts.focusColor === undefined) e._focusColor = _autoFocusColor(color)
  _syncOne(e)
}

export function zabtHandleKey(key, event) {
  if (_blocked) return false
  _finalize()

  if (event === KEY_EVENT_CLICK) {
    if (key === KEY_UP)   { _navigate(-1); return true }
    if (key === KEY_DOWN) { _navigate(1); return true }
  }

  if (key === KEY_SELECT || key === KEY_HOME) {
    if (event === KEY_EVENT_PRESS) {
      _clickFallback = false
      if (_focusIdx === null) _focusIdx = 0
      _focusVisible = true
      _pressing = true; _cancelled = false
      _syncAll()
      const idx = _focusIdx
      _pressTimer = setTimeout(() => {
        _cancelled = true
        console.log('[zabt] hold cancel:', _entries[idx].opts.text)
      }, HOLD_MS)
      return true
    }
    if (event === KEY_EVENT_RELEASE) {
      if (_pressTimer) { clearTimeout(_pressTimer); _pressTimer = null }
      if (_focusIdx === null) _focusIdx = 0
      _pressing = false; _syncAll()
      if (_skipConfirm) { _skipConfirm = false; if (_skipTimer) { clearTimeout(_skipTimer); _skipTimer = null }; return true }
      if (!_cancelled) { const idx = _focusIdx; setTimeout(() => { _entries[idx]._origAction(); if (_entries[idx]._antiBounce) _autoBlock() }, 0) }
      return true
    }
    if (event === KEY_EVENT_CLICK) {
      if (_clickFallback) {
        if (_focusIdx === null) _focusIdx = 0
        _focusVisible = true
        _syncAll()
        if (_skipConfirm) { _skipConfirm = false; if (_skipTimer) { clearTimeout(_skipTimer); _skipTimer = null }; _clickFallback = true; return true }
        const idx = _focusIdx; setTimeout(() => { _entries[idx]._origAction(); if (_entries[idx]._antiBounce) _autoBlock() }, 0)
      }
      _clickFallback = true
      return true
    }
  }

  return false
}

export function zabtBlock()   { _blocked = true }
export function zabtUnblock() {
  _blocked = false
  _skipConfirm = true
  if (_skipTimer) clearTimeout(_skipTimer)
  _skipTimer = setTimeout(() => { _skipConfirm = false; _skipTimer = null }, 300)
  _syncAll()
}
