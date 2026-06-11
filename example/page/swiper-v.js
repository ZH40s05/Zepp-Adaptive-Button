import { createWidget, widget } from '@zos/ui'
import { showToast, onKey } from '@zos/interaction'
import { back } from '@zos/router'
import { zabtBtn, zabtSetScrollConfig, zabtHandleKey } from '../utils/zabt'

const SH = 480

Page({
  build() {
    // =================================================================
    // Page mode: SWIPER VERTICAL / 纵向翻页
    // 3 pages stacked, 480px each. Buttons on different pages.
    // Navigating to a button on another page auto-flips to that page.
    // zabtSetScrollConfig handles both system setup + focus tracking.
    // 3 页堆叠，每页 480px。导航到其他页按钮时自动翻页。
    // =================================================================
    zabtSetScrollConfig({ mode: 'swiper', screenHeight: 480, pageSize: 480, pageCount: 3 })

    createWidget(widget.TEXT, {
      x: 60, y: 20, w: 360, h: 36,
      text: 'Swiper V / 纵向翻页',
      text_size: 26, color: 0xFFFFFF, text_style: 2,
    })

    // Page 0 (y=0..480) / 第0页
    zabtBtn({
      x: 60, y: 100, w: 360, h: 80,
      radius: 16, text_size: 24,
      normal_color: 0x374151, press_color: 0x232C36,
      text: 'Page 0 — BTN 0',
      click_func: () => showToast({ content: 'Page 0 Btn 0' }),
      order: 0,
    })
    zabtBtn({
      x: 60, y: 220, w: 360, h: 80,
      radius: 16, text_size: 24,
      normal_color: 0x374151, press_color: 0x232C36,
      text: 'Page 0 — BTN 1',
      click_func: () => showToast({ content: 'Page 0 Btn 1' }),
      order: 1,
    })

    // Page 1 (y=480..960) / 第1页
    zabtBtn({
      x: 60, y: 560, w: 360, h: 80,
      radius: 16, text_size: 24,
      normal_color: 0x374151, press_color: 0x232C36,
      text: 'Page 1 — BTN 2',
      click_func: () => showToast({ content: 'Page 1 Btn 2' }),
      order: 2,
    })
    zabtBtn({
      x: 60, y: 680, w: 360, h: 80,
      radius: 16, text_size: 24,
      normal_color: 0x374151, press_color: 0x232C36,
      text: 'Page 1 — BTN 3',
      click_func: () => showToast({ content: 'Page 1 Btn 3' }),
      order: 3,
    })

    // Page 2 (y=960..1440) / 第2页
    zabtBtn({
      x: 60, y: 1040, w: 360, h: 80,
      radius: 16, text_size: 24,
      normal_color: 0x374151, press_color: 0x232C36,
      text: 'Page 2 — BTN 4',
      click_func: () => showToast({ content: 'Page 2 Btn 4' }),
      order: 4,
    })
    zabtBtn({
      x: 60, y: 1160, w: 360, h: 80,
      radius: 16, text_size: 24,
      normal_color: 0x374151, press_color: 0x232C36,
      text: 'Page 2 — BTN 5',
      click_func: () => showToast({ content: 'Page 2 Btn 5' }),
      order: 5,
    })
    zabtBtn({
      x: 60, y: 1300, w: 360, h: 80,
      radius: 16, text_size: 24,
      normal_color: 0x1F2937, press_color: 0x111827,
      text: 'Back / 返回',
      click_func: () => back(),
      order: 99, antiBounce: true,
    })

    onKey({ callback: (key, event) => zabtHandleKey(key, event) })
  },
})
