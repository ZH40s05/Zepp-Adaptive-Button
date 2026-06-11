import { createWidget, widget } from '@zos/ui'
import { showToast, onKey, createModal } from '@zos/interaction'
import { back } from '@zos/router'
import { zabtBtn, zabtSetLabel, zabtSetNormalColor, zabtHandleKey, zabtUnblock } from '../utils/zabt'

let toggleState = false
let modalCount = 0

function showInfo(title, msg, onClose) {
  let m = createModal({
    title, text: msg, textColor: 0x9CA3AF, autoHide: true,
    onClick: () => { if (m) m.show(false); zabtUnblock(); if (onClose) onClose() },
  })
}

Page({
  build() {
    // =================================================================
    // Page mode: LOCKED (no scroll config) / 页面模式：锁定不滚动
    // No zabtSetScrollConfig call — the page does not scroll.
    // Use this when all content fits on one screen.
    // 不调用 zabtSetScrollConfig — 页面不滚动。
    // 所有内容都在一屏内时使用此模式。
    // =================================================================

    createWidget(widget.TEXT, {
      x: 60, y: 10, w: 360, h: 36,
      text: 'Basic Features / 基础功能',
      text_size: 26, color: 0xFFFFFF, text_style: 2,
    })

    // =================================================================
    // Order assignment test / 顺序分配测试
    // Explicit: C=3, A=5, 变色=5(conflict→6), 弹窗=10
    // Auto-fill: B→0, D→1
    // Expected nav: B(0)→D(1)→C(3)→A(5)→变色(6)→弹窗(10)
    // =================================================================

    // A: explicit order=5, explicit focusColor=BLUE
    // ✗ no antiBounce — showToast is one-shot, no key interaction needed
    //   showToast 一次性提示，自动消失，无需按键交互
    zabtBtn({
      x: 60, y: 60, w: 360, h: 48,
      radius: 12, text_size: 20,
      normal_color: 0x374151, press_color: 0x232C36,
      text: 'A (order=5, blue focus)',
      click_func: () => showToast({ content: 'A pressed' }),
      order: 5, focusColor: 0x3B82F6,
    })

    // B: auto order → 0, auto focusColor
    // ✗ no antiBounce — same as A / 原因同 A
    zabtBtn({
      x: 60, y: 118, w: 360, h: 48,
      radius: 12, text_size: 20,
      normal_color: 0x374151, press_color: 0x232C36,
      text: 'B (auto → order=0)',
      click_func: () => showToast({ content: 'B pressed' }),
    })

    // C: explicit order=3, auto focusColor
    // ✗ no antiBounce — same as A / 原因同 A
    zabtBtn({
      x: 60, y: 176, w: 360, h: 48,
      radius: 12, text_size: 20,
      normal_color: 0x374151, press_color: 0x232C36,
      text: 'C (order=3)',
      click_func: () => showToast({ content: 'C pressed' }),
      order: 3,
    })

    // D: auto order → 1, auto focusColor
    // ✗ no antiBounce — same as A / 原因同 A
    zabtBtn({
      x: 60, y: 234, w: 360, h: 48,
      radius: 12, text_size: 20,
      normal_color: 0x374151, press_color: 0x232C36,
      text: 'D (auto → order=1)',
      click_func: () => showToast({ content: 'D pressed' }),
    })

    // Toggle: order=5 (conflict with A → shifts to 6)
    // ✗ no antiBounce — setProperty is pure data change, no overlay
    //   setProperty 纯数据变更，无叠加层
    const toggleBtn = zabtBtn({
      x: 60, y: 292, w: 360, h: 48,
      radius: 12, text_size: 20,
      normal_color: 0x374151, press_color: 0x232C36,
      text: '变色 (order=5 conflict)',
      click_func: () => {
        toggleState = !toggleState
        if (toggleState) {
          zabtSetLabel(toggleBtn, '变红! 再按变回')
          zabtSetNormalColor(toggleBtn, 0xEF4444)
        } else {
          zabtSetLabel(toggleBtn, '变色 (order=5 conflict)')
          zabtSetNormalColor(toggleBtn, 0x374151)
        }
      },
      order: 5,
    })

    // Modal: order=10
    // ✓ antiBounce: true — createModal opens a UI layer that consumes keys.
    //   Without antiBounce, the residual CLICK re-triggers the action.
    //   createModal 打开消耗按键的 UI 层，不用 antiBounce 残留 CLICK 会重触发。
    const MODAL_LABEL = '弹窗 (order=10, antiBounce)'
    const modalBtn = zabtBtn({
      x: 60, y: 350, w: 360, h: 48,
      radius: 12, text_size: 20,
      normal_color: 0x374151, press_color: 0x232C36,
      text: MODAL_LABEL,
      click_func: () => {
        modalCount++
        zabtSetLabel(modalBtn, '弹窗 #' + modalCount + ' (阻断中…)')
        showInfo('阻断测试 #' + modalCount,
          'Keys blocked\nCount: ' + modalCount + '\nClose to restore',
          () => zabtSetLabel(modalBtn, MODAL_LABEL))
      },
      order: 10, antiBounce: true,
    })

    // Back button / 返回按钮
    zabtBtn({
      x: 60, y: 420, w: 360, h: 48,
      radius: 12, text_size: 20,
      normal_color: 0x1F2937, press_color: 0x111827,
      text: 'Back / 返回',
      click_func: () => back(),
      order: 99,
    })

    onKey({ callback: (key, event) => zabtHandleKey(key, event) })
  },
})
