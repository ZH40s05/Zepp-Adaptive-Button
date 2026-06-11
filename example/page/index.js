import { createWidget, widget, prop } from '@zos/ui'
import { showToast, onKey, createModal } from '@zos/interaction'
import { pw, pl } from '../utils/zaui'
import { zabtBtn, zabtSetLabel, zabtSetNormalColor, zabtHandleKey, zabtUnblock } from '../../zabt'

const GRAY = 0x9CA3AF
const DARK = 0x374151
const PRESS = 0x232C36
const BLUE = 0x3B82F6
const RED = 0xEF4444

let toggleState = false
let modalCount = 0

function showInfo(title, msg, onClose) {
  let m = createModal({
    title, text: msg,
    textColor: GRAY, autoHide: true,
    onClick: () => { if (m) m.show(false); zabtUnblock(); if (onClose) onClose() },
  })
}

Page({
  build() {
    createWidget(widget.TEXT, {
      x: pw(60), y: pl(10), w: pl(360), h: pl(40),
      text: 'Button Fusion 测试',
      text_size: pl(28), color: 0xFFFFFF, text_style: 2,
    })

    // =================================================================
    // Order assignment test / 顺序分配测试
    // Explicit: C=3, A=5, 变色=5(conflict→6), 弹窗=10
    // Auto-fill: B→0, D→1
    // Expected nav: B(0) → D(1) → C(3) → A(5) → 变色(6) → 弹窗(10)
    // =================================================================

    // A: order=5, explicit focusColor=BLUE  / 显式 order + 显式高亮色
    // ✗ no antiBounce — showToast is one-shot, no key interaction needed
    //   showToast 是一次性提示，无需按键交互，不需要抗回弹
    zabtBtn({
      x: pw(60), y: pl(70), w: pl(360), h: pl(50),
      radius: pl(12), text_size: pl(22),
      normal_color: DARK, press_color: PRESS,
      text: 'A (order=5, blue focus)', click_func: () => showToast({ content: 'A pressed' }),
      order: 5, focusColor: BLUE,
    })

    // B: auto order → 0  / 自动分配 order
    // ✗ no antiBounce — same reason as A / 原因同 A
    zabtBtn({
      x: pw(60), y: pl(135), w: pl(360), h: pl(50),
      radius: pl(12), text_size: pl(22),
      normal_color: DARK, press_color: PRESS,
      text: 'B (auto → order=0)', click_func: () => showToast({ content: 'B pressed' }),
    })

    // C: order=3  / 显式 order=3
    // ✗ no antiBounce — same reason as A / 原因同 A
    zabtBtn({
      x: pw(60), y: pl(200), w: pl(360), h: pl(50),
      radius: pl(12), text_size: pl(22),
      normal_color: DARK, press_color: PRESS,
      text: 'C (order=3)', click_func: () => showToast({ content: 'C pressed' }),
      order: 3,
    })

    // D: auto order → 1  / 自动分配 order → 1
    // ✗ no antiBounce — same reason as A / 原因同 A
    zabtBtn({
      x: pw(60), y: pl(265), w: pl(360), h: pl(50),
      radius: pl(12), text_size: pl(22),
      normal_color: DARK, press_color: PRESS,
      text: 'D (auto → order=1)', click_func: () => showToast({ content: 'D pressed' }),
    })

    // Toggle button / 变色按钮: order=5 (conflict with A → shifts to 6)
    // ✗ no antiBounce — setProperty is pure data, no overlay to dismiss
    //   setProperty 是纯数据变更，无叠加层需要关闭，不需要抗回弹
    const toggleBtn = zabtBtn({
      x: pw(60), y: pl(330), w: pl(360), h: pl(50),
      radius: pl(12), text_size: pl(22),
      normal_color: DARK, press_color: PRESS,
      text: '变色 (order=5 conflict)', click_func: () => {
        toggleState = !toggleState
        if (toggleState) {
          zabtSetLabel(toggleBtn, '变红! 再按变回')
          zabtSetNormalColor(toggleBtn, RED)
        } else {
          zabtSetLabel(toggleBtn, '变色 (order=5 conflict)')
          zabtSetNormalColor(toggleBtn, DARK)
        }
      },
      order: 5,
    })

    // Modal button / 弹窗按钮: order=10
    // ✓ antiBounce: true — createModal opens a UI layer that consumes keys.
    //   Without antiBounce, the residual CLICK from the key press that
    //   dismisses the modal would immediately re-trigger this action.
    //   createModal 会打开一个需要按键交互的 UI 层。不用 antiBounce 的话，
    //   关闭弹窗的按键产生的残留 CLICK 会立即重新触发这个按钮。
    const MODAL_LABEL = '弹窗 (order=10, 测试block)'
    const modalBtn = zabtBtn({
      x: pw(60), y: pl(395), w: pl(360), h: pl(50),
      radius: pl(12), text_size: pl(22),
      normal_color: DARK, press_color: PRESS,
      text: MODAL_LABEL, click_func: () => {
        modalCount++
        zabtSetLabel(modalBtn, '弹窗 #' + modalCount + ' (阻断中…)')
        showInfo('阻断测试 #' + modalCount, '按键已阻断\n计数: ' + modalCount + '\n关闭弹窗恢复', () => {
          zabtSetLabel(modalBtn, MODAL_LABEL)
        })
      },
      order: 10, antiBounce: true,
    })

    onKey({ callback: (key, event) => zabtHandleKey(key, event) })
  },
})
