import { createWidget, widget } from '@zos/ui'
import { showToast, onKey, createModal } from '@zos/interaction'
import { zabtBtn, zabtSetLabel, zabtSetNormalColor, zabtHandleKey, zabtUnblock } from '../utils/zabt'

let toggleState = false
let modalCount = 0

function showInfo(title, msg, onClose) {
  let m = createModal({
    title,
    text: msg,
    textColor: 0x9CA3AF,
    autoHide: true,
    onClick: () => {
      if (m) m.show(false)
      zabtUnblock()
      if (onClose) onClose()
    },
  })
}

Page({
  build() {
    createWidget(widget.TEXT, {
      x: 60,
      y: 10,
      w: 360,
      h: 40,
      text: 'zabt Button Fusion Test',
      text_size: 28,
      color: 0xFFFFFF,
      text_style: 2,
    })

    // =================================================================
    // Order assignment test / 顺序分配测试
    // Explicit: C=3, A=5, 变色=5(conflict→6), 弹窗=10
    // Auto-fill: B→0, D→1
    // Expected nav: B(0) → D(1) → C(3) → A(5) → 变色(6) → 弹窗(10)
    // =================================================================

    // A: explicit order=5, explicit focusColor=BLUE
    // ✗ no antiBounce — showToast is one-shot, auto-dismiss, no key interaction
    //   showToast 一次性提示，自动消失，无需按键交互 → 不需要抗回弹
    zabtBtn({
      x: 60,
      y: 70,
      w: 360,
      h: 50,
      radius: 12,
      text_size: 22,
      normal_color: 0x374151,
      press_color: 0x232C36,
      text: 'A (order=5, blue focus)',
      click_func: () => showToast({ content: 'A pressed' }),
      order: 5,
      focusColor: 0x3B82F6,
    })

    // B: auto order → 0, auto focusColor
    // ✗ no antiBounce — same as A / 原因同 A
    zabtBtn({
      x: 60,
      y: 135,
      w: 360,
      h: 50,
      radius: 12,
      text_size: 22,
      normal_color: 0x374151,
      press_color: 0x232C36,
      text: 'B (auto → order=0)',
      click_func: () => showToast({ content: 'B pressed' }),
    })

    // C: explicit order=3, auto focusColor
    // ✗ no antiBounce — same as A / 原因同 A
    zabtBtn({
      x: 60,
      y: 200,
      w: 360,
      h: 50,
      radius: 12,
      text_size: 22,
      normal_color: 0x374151,
      press_color: 0x232C36,
      text: 'C (order=3)',
      click_func: () => showToast({ content: 'C pressed' }),
      order: 3,
    })

    // D: auto order → 1, auto focusColor
    // ✗ no antiBounce — same as A / 原因同 A
    zabtBtn({
      x: 60,
      y: 265,
      w: 360,
      h: 50,
      radius: 12,
      text_size: 22,
      normal_color: 0x374151,
      press_color: 0x232C36,
      text: 'D (auto → order=1)',
      click_func: () => showToast({ content: 'D pressed' }),
    })

    // Toggle: order=5 (conflict with A → shifts to 6)
    // ✗ no antiBounce — setProperty is pure data change, no overlay to dismiss
    //   setProperty 纯数据变更，无叠加层需要关闭 → 不需要抗回弹
    const toggleBtn = zabtBtn({
      x: 60,
      y: 330,
      w: 360,
      h: 50,
      radius: 12,
      text_size: 22,
      normal_color: 0x374151,
      press_color: 0x232C36,
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
    //   Without antiBounce, the residual CLICK from the key press that
    //   dismisses the modal would immediately re-trigger this action.
    //   createModal 打开一个消耗按键的 UI 层。
    //   不用 antiBounce 的话，关闭弹窗的残留 CLICK 会立即重新触发。
    const MODAL_LABEL = '弹窗 (order=10, 测试block)'
    const modalBtn = zabtBtn({
      x: 60,
      y: 395,
      w: 360,
      h: 50,
      radius: 12,
      text_size: 22,
      normal_color: 0x374151,
      press_color: 0x232C36,
      text: MODAL_LABEL,
      click_func: () => {
        modalCount++
        zabtSetLabel(modalBtn, '弹窗 #' + modalCount + ' (阻断中…)')
        showInfo(
          '阻断测试 #' + modalCount,
          'Keys blocked\nCount: ' + modalCount + '\nClose to restore',
          () => zabtSetLabel(modalBtn, MODAL_LABEL)
        )
      },
      order: 10,
      antiBounce: true,
    })

    onKey({ callback: (key, event) => zabtHandleKey(key, event) })
  },
})
