import { createWidget, widget } from '@zos/ui'
import { showToast, onKey, createModal } from '@zos/interaction'
import { back } from '@zos/router'
import { zabtBtn, zabtSetScrollConfig, zabtHandleKey, zabtUnblock } from '../utils/zabt'

const SH = 480

Page({
  build() {
    // =================================================================
    // Page mode: FREE SCROLL / 自由滚动
    // 12 buttons across y=100..950. Navigation keeps focused button
    // within safe zone (between green & red markers). Smooth scroll animation.
    // 12 个按钮分布在 y=100~950。焦点在安全区(绿线~红线)内自动跟随滚动。
    // =================================================================
    zabtSetScrollConfig({ mode: 'free', screenHeight: 480 })

    createWidget(widget.TEXT, {
      x: 60, y: 10, w: 360, h: 32,
      text: 'Scroll-Aware Focus / 焦点跟随滚动',
      text_size: 24, color: 0xFFFFFF, text_style: 2,
    })

    // Safe zone markers / 安全区标记
    //   green = SH/6, red = 5*SH/6 / 绿 = 上1/6, 红 = 下5/6
    createWidget(widget.FILL_RECT, { x: 0, y: 80, w: 480, h: 1, color: 0x10B981 })
    createWidget(widget.FILL_RECT, { x: 0, y: 400, w: 480, h: 1, color: 0xEF4444 })

    // 12 buttons spanning y=100..870 / 12个按钮分布 y=100~870
    for (let i = 0; i < 12; i++) {
      const y = 100 + i * 70
      const inSafe = y + 50 <= 400 && y >= 80
      const label = 'BTN ' + i + (inSafe ? ' (safe)' : ' (scroll)')

      zabtBtn({
        x: 60, y, w: 360, h: 50,
        radius: 12, text_size: 22,
        normal_color: 0x374151, press_color: 0x232C36,
        text: label,
        click_func: () => showToast({ content: 'BTN ' + i }),
        order: i,
      })
    }

    // Back — antiBounce since navigation consumes keys / 返回可能影响按键，加防回弹
    zabtBtn({
      x: 60, y: 950, w: 360, h: 50,
      radius: 12, text_size: 22,
      normal_color: 0x1F2937, press_color: 0x111827,
      text: 'Back / 返回',
      click_func: () => back(),
      order: 99, antiBounce: true,
    })

    onKey({ callback: (key, event) => zabtHandleKey(key, event) })
  },
})
