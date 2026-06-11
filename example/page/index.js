import { createWidget, widget } from '@zos/ui'
import { onKey } from '@zos/interaction'
import { push } from '@zos/router'
import { zabtBtn, zabtSetScrollConfig, zabtHandleKey } from '../utils/zabt'

Page({
  build() {
    // =================================================================
    // Page mode: FREE SCROLL / 自由滚动
    // Buttons stay in safe zone (1/6 ~ 5/6 of screen) during key nav.
    // Also enables custom smooth scroll animation.
    // 按键导航时按钮保持在屏幕安全区 (1/6 ~ 5/6)，含自定义平滑滚动动画。
    // =================================================================
    zabtSetScrollConfig({ mode: 'free', screenHeight: 480 })

    createWidget(widget.TEXT, {
      x: 60, y: 30, w: 360, h: 40,
      text: 'zabt Demo',
      text_size: 32, color: 0xFFFFFF, text_style: 2,
    })
    createWidget(widget.TEXT, {
      x: 60, y: 70, w: 360, h: 24,
      text: 'ZeppOS Adaptive Button Library',
      text_size: 16, color: 0x9CA3AF, text_style: 2,
    })

    // Basic features / 基础功能
    zabtBtn({
      x: 60, y: 120, w: 360, h: 55,
      radius: 12, text_size: 22,
      normal_color: 0x374151, press_color: 0x232C36,
      text: 'Basic / 基础功能',
      click_func: () => push({ url: 'page/basic' }),
      order: 0,
    })
    createWidget(widget.TEXT, {
      x: 80, y: 178, w: 320, h: 22,
      text: 'order, focusColor, antiBounce, modal',
      text_size: 15, color: 0x6B7280, text_style: 2,
    })

    // Free scroll / 自由滚动
    zabtBtn({
      x: 60, y: 215, w: 360, h: 55,
      radius: 12, text_size: 22,
      normal_color: 0x374151, press_color: 0x232C36,
      text: 'Scroll / 滚动测试',
      click_func: () => push({ url: 'page/scroll' }),
      order: 1,
    })
    createWidget(widget.TEXT, {
      x: 80, y: 273, w: 320, h: 22,
      text: 'free scroll, auto-scroll-to-focus',
      text_size: 15, color: 0x6B7280, text_style: 2,
    })

    // Horizontal swiper / 横向翻页
    zabtBtn({
      x: 60, y: 310, w: 360, h: 55,
      radius: 12, text_size: 22,
      normal_color: 0x374151, press_color: 0x232C36,
      text: 'Swiper-H / 横向翻页',
      click_func: () => push({ url: 'page/swiper-h' }),
      order: 2,
    })
    createWidget(widget.TEXT, {
      x: 80, y: 368, w: 320, h: 22,
      text: 'horizontal swiper, auto-page-flip',
      text_size: 15, color: 0x6B7280, text_style: 2,
    })

    // Vertical swiper / 纵向翻页
    zabtBtn({
      x: 60, y: 405, w: 360, h: 55,
      radius: 12, text_size: 22,
      normal_color: 0x374151, press_color: 0x232C36,
      text: 'Swiper-V / 纵向翻页',
      click_func: () => push({ url: 'page/swiper-v' }),
      order: 3,
    })
    createWidget(widget.TEXT, {
      x: 80, y: 463, w: 320, h: 22,
      text: 'vertical swiper, auto-page-flip',
      text_size: 15, color: 0x6B7280, text_style: 2,
    })

    onKey({ callback: (key, event) => zabtHandleKey(key, event) })
  },
})
