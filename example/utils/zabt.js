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
 *      import { zabtBtn } from '../utils/zabt'
 *
 *   3. Replace createWidget(widget.BUTTON, ...) with zabtBtn(...).
 *      The config is identical except for the optional `order` field.
 *      Key bindings (UP/DOWN/SELECT/HOME) are auto-registered on first use.
 *      用 zabtBtn 替代 createWidget(widget.BUTTON, ...)，配置完全相同，仅多一个可选的 `order`。
 *      按键绑定（UP/DOWN/SELECT/HOME）在首次使用时自动注册，无需手动调用 onKey。
 *
 *      const btn = zabtBtn({
 *        x: (100), y: 310, w: 280, h: 56,
 *        radius: 28, text_size: 28,
 *        normal_color: 0x374151, press_color: 0x232C36,
 *        text: 'Button', click_func: action,
 *        order: 0,   // optional / 可选
 *      })
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
 *   zabtSetLabel(w, text)      — Change button text / 修改按钮文字
 *   zabtSetNormalColor(w, c)   — Change normal color (auto-recalc focusColor)
 *                                修改 normal 态颜色（自动重算 focusColor）
 *   zabtSetScrollConfig(cfg)   — Enable scroll-aware focus + auto system setup
 *                                启用焦点跟随滚动 + 自动系统配置
 *   zabtBlock()                — Manually block key input / 手动阻断按键
 *   zabtUnblock()              — Unblock + discard one residual confirm event
 *                                释放阻断 + 丢弃一次残留确认事件
 *
 * ============================================================================
 * Scroll-Aware Focus / 焦点跟随滚动
 * ============================================================================
 *
 * [EN] Requires "data:os.device.info" permission in app.json for auto-detect.
 *     需要 app.json 中声明 "data:os.device.info" 权限以自动获取屏幕尺寸。
 *
 * [EN] zabtSetScrollConfig replaces manual setScrollMode calls. It configures
 * both the system scroll mode AND the button focus tracking in one call.
 * screenHeight and pageSize are auto-detected from device info.
 *
 * [CN] zabtSetScrollConfig 替代手动 setScrollMode 调用。一次调用同时配置系统
 * 滚动模式和按钮焦点追踪。screenHeight 和 pageSize 自动从设备信息获取。
 *
 * Four page modes / 四种页面模式:
 *
 *   1. LOCKED (default) — no config, all content on one screen
 *      锁定不滚动（默认）— 不调用，内容在一屏内
 *
 *   2. FREE SCROLL — page scrolls freely, focus stays in safe zone
 *      zabtSetScrollConfig({ mode: 'free' })
 *      自由滚动 — 页面自由滚动，焦点保持在安全区(1/6~5/6 屏幕)
 *
 *   3. SWIPER VERTICAL — page flips vertically, auto-flip on focus
 *      zabtSetScrollConfig({ mode: 'swiper', pageCount: 3 })
 *      纵向翻页 — 页面纵向翻页，焦点跨页时自动翻页
 *
 *   4. SWIPER HORIZONTAL — page flips horizontally, auto-flip on focus
 *      zabtSetScrollConfig({ mode: 'swiper-h', pageCount: 3 })
 *      横向翻页 — 页面横向翻页，焦点跨页时自动翻页
 *
 * Config fields / 配置字段:
 *
 *   mode       — 'free' | 'swiper' | 'swiper-h' (required / 必填)
 *   pageCount  — swiper page count (default: 1 / 默认 1)
 *
 *   The following are AUTO-DETECTED. Pass them only when you need a custom value.
 *   以下字段自动获取，仅在需要覆盖时手动传入：
 *
 *   screenHeight — device screen height (auto: getDeviceInfo().height)
 *                   屏幕高度（自动获取）
 *   pageSize     — swiper page height or width (auto: screenHeight)
 *                   swiper 每页高度/宽度（自动等于屏幕高度）
 *
 *   Mapping to official setScrollMode / 对应官方 setScrollMode 参数:
 *     free mode → setScrollMode({ mode: SCROLL_MODE_FREE })     // no extra params
 *     swiper    → setScrollMode({ mode: SCROLL_MODE_SWIPER,     // height=pageSize
 *                                 options: { height, count } })
 *     swiper-h  → setScrollMode({ mode: SCROLL_MODE_SWIPER_H,   // width=pageSize
 *                                 options: { width, count } })
 *
 * @example
 * // Free scroll / 自由滚动
 * zabtSetScrollConfig({ mode: 'free' })
 *
 * // Swiper horizontal / 横向翻页
 * zabtSetScrollConfig({ mode: 'swiper-h', pageCount: 3 })
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
 *   x: (100), y: 310, w: 280, h: 56,
 *   radius: 28, text_size: 28,
 *   normal_color: DARK, press_color: PRESS,
 *   text: 'Confirm', click_func: () => showToast({ content: 'ok' }),
 *   order: 0,
 * })
 *
 * // Modal button — needs antiBounce
 * // 弹窗按钮 — 需要 antiBounce
 * const infoBtn = zabtBtn({
 *   x: (220), y: 420, w: 40, h: 40,
 *   radius: 20, text_size: 22,
 *   normal_color: DARK, press_color: PRESS,
 *   text: 'i', click_func: () => {
 *     let m = createModal({
 *       autoHide: true,
 *       onClick: () => { m.show(false); zabtUnblock() },
 *     })
 *   },
 *   order: 1, antiBounce: true,
 * })
 */

import { createWidget, widget, prop } from '@zos/ui'
import { onKey, KEY_SELECT, KEY_HOME, KEY_UP, KEY_DOWN, KEY_EVENT_CLICK, KEY_EVENT_PRESS, KEY_EVENT_RELEASE } from '@zos/interaction'
import { scrollTo, getScrollTop, getSwiperIndex, swipeToIndex, setScrollMode, SCROLL_MODE_FREE, SCROLL_MODE_SWIPER, SCROLL_MODE_SWIPER_HORIZONTAL } from '@zos/page'
import { getDeviceInfo } from '@zos/device'

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
let _scrollCfg = null    // { mode, screenHeight, pageHeight }
let _trackedST = null    // tracked scroll target, avoids animation jitter / 跟踪滚动目标避免动画跳动
let _scrollAnim = null    // smooth scroll interval id / 平滑滚动定时器 ID
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
  _ensureVisible(dir)
}

function _startScrollAnim(target) {
  if (_scrollAnim) clearInterval(_scrollAnim)
  let current = -getScrollTop()
  const step = () => {
    current += (target - current) * 0.35
    if (Math.abs(target - current) < 0.5) {
      current = target
      clearInterval(_scrollAnim)
      _scrollAnim = null
    }
    scrollTo({ y: -Math.round(current) })
  }
  _scrollAnim = setInterval(step, 16)
  step()
}

function _ensureVisible(dir) {
  if (!_scrollCfg || _focusIdx === null) return
  const btn = _entries[_focusIdx]
  const sh = _scrollCfg.screenHeight

  if (_scrollCfg.mode === 'free') {
    if (_trackedST === null) _trackedST = -getScrollTop()
    const st = _trackedST
    const btnTop = btn.opts.y
    const btnBottom = btn.opts.y + btn.opts.h

    const safeTop = st + sh / 6
    const safeBottom = st + sh * 5 / 6

    // Only skip if button is within the safe zone, not just anywhere in viewport
    // 按钮已在安全区内才跳过，不是整个视窗都算
    if (btnTop >= safeTop && btnBottom <= safeBottom) return

    let targetST
    if (dir > 0) {
      // DOWN: ensure bottom edge above 5/6 / 优先保证底边在 5/6 以上
      targetST = btnBottom - sh * 5 / 6
      if (btnTop < targetST + sh / 6) {
        targetST = btnTop - sh / 6
      }
    } else {
      // UP: ensure top edge below 1/6 / 优先保证顶边在 1/6 以下
      targetST = btnTop - sh / 6
      if (btnBottom > targetST + sh * 5 / 6) {
        targetST = btnBottom - sh * 5 / 6
      }
    }

    // Clamp: topmost button at screen/2, bottommost at screen/2 / 边界限制
    let minBtnTop = Infinity, maxBtnBottom = 0
    for (let i = 0; i < _entries.length; i++) {
      const t = _entries[i].opts.y
      const b = t + _entries[i].opts.h
      if (t < minBtnTop) minBtnTop = t
      if (b > maxBtnBottom) maxBtnBottom = b
    }
    const minST = Math.max(0, minBtnTop - sh / 2)
    const maxST = Math.max(0, maxBtnBottom - sh / 2)
    if (targetST < minST) targetST = minST
    if (targetST > maxST) targetST = maxST

    _trackedST = targetST
    _startScrollAnim(targetST)
  }

  if (_scrollCfg.mode === 'swiper' || _scrollCfg.mode === 'swiper-h') {
    // swiper-h uses x-based page calculation / 横向翻页用 x 算页号
    const useX = _scrollCfg.mode === 'swiper-h'
    const pageSize = _scrollCfg.pageSize || sh
    const pos = useX ? btn.opts.x : btn.opts.y
    const targetPage = Math.floor(pos / pageSize)
    const curPage = getSwiperIndex() - 1
    if (targetPage !== curPage) {
      swipeToIndex({ index: targetPage })
    }
  }
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

let _keyBound = false

export function zabtBtn(opts) {
  if (!_keyBound) {
    _keyBound = true
    onKey({ callback: (key, event) => zabtHandleKey(key, event) })
  }
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

export function zabtSetScrollConfig(cfg) {
  const dev = getDeviceInfo()
  const sh = cfg.screenHeight || dev.height
  const ps = cfg.pageSize || sh

  _scrollCfg = { mode: cfg.mode, screenHeight: sh, pageSize: ps, pageCount: cfg.pageCount }
  _trackedST = null

  if (cfg.mode === 'free') {
    setScrollMode({ mode: SCROLL_MODE_FREE })
  } else if (cfg.mode === 'swiper') {
    setScrollMode({ mode: SCROLL_MODE_SWIPER, options: { height: ps, count: cfg.pageCount || 1 } })
  } else if (cfg.mode === 'swiper-h') {
    setScrollMode({ mode: SCROLL_MODE_SWIPER_HORIZONTAL, options: { width: ps, count: cfg.pageCount || 1 } })
  }
}

export function zabtBlock()   { _blocked = true }
export function zabtUnblock() {
  _blocked = false
  _skipConfirm = true
  if (_skipTimer) clearTimeout(_skipTimer)
  _skipTimer = setTimeout(() => { _skipConfirm = false; _skipTimer = null }, 300)
  _syncAll()
}
