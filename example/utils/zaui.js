/**
 * zaui.js — ZeppOS Adaptive UI Library
 * ZeppOS 自适应 UI 库
 *
 * @version 0.3.1
 * @date    2024/08/12 (original), 2026/06/11 (docs update)
 * @author  ZHAO Charlie_Q
 * @license MIT
 *
 * ## 概述
 *
 * ZeppOS 设备屏幕尺寸多样（480/454/416 圆形，390 方形等），直接用 px 硬编码
 * 会导致不同设备上 UI 错位或溢出。本库提供四种自适应策略：
 *
 *   P0 — 宽度等比缩放（重写官方 px）
 *   P1 — 高度等比缩放 + 水平居中（推荐，适用于绝大多数页面布局）
 *   P2 — 圆形屏幕兼容基线
 *   P3 — 点对点最大重叠设计
 *   PW — 副屏小组件专用
 *
 * ## 快速开始
 *
 *   1. 将本文件复制到小程序 `utils/zaui.js`
 *   2. 在需要自适应的页面中导入：
 *      import { pw, pl } from '../utils/zaui'
 *   3. 用 pw(x) 包裹所有 x 坐标，用 pl(l) 包裹所有长度值（w/h/y/radius/text_size）：
 *      createWidget(widget.TEXT, {
 *        x: pw(60), y: pl(188), w: pl(360), h: pl(46),
 *        text_size: pl(36),
 *      })
 *
 * ## 权限要求
 *
 *   需要在 app.json 中声明： "data:os.device.info"
 *
 * ## P1 详解（推荐方案）
 *
 *   缩放因子 pxh = 设备高度 / 480
 *   水平偏移 widbase = 设备宽度/2 - 设备高度/2  （方形屏居中用）
 *
 *   pw(w) — w × pxh + widbase  （x 坐标 + 水平居中）
 *   pl(l) — l × pxh            （宽/高/字号/圆角等所有长度）
 *
 *   在 480×480 圆形屏上 pxh=1, widbase=0，值不变。
 *   在 390×390 方形屏上 pxh=0.8125，所有值等比缩小。
 *
 * ## API 参考
 *
 * ### P0 — 宽度缩放
 *   px0(x)    x 坐标，按宽度/480 缩放
 *
 * ### P1 — 高度缩放（推荐）
 *   pw(w)     x 坐标，高度缩放 + 水平居中偏移
 *   ph(h)     y 坐标（已废弃，用 pl 替代）
 *   pl(l)     长度值（w/h/y/radius/text_size/center_y…）
 *
 * ### P2 — 圆形屏兼容基线
 *   pw2(w)    x 坐标（宽度缩放）
 *   ph2(h)    y 坐标（圆形屏基线偏移 + 宽度缩放）
 *   pl2(l)    长度值（宽度缩放）
 *
 * ### P3 — 点对点最大重叠
 *   pw3(w)    x 坐标（圆形 480/方形 390 为基准）
 *   ph3(h)    y 坐标
 *   pl3(l)    长度值
 *
 * ### PW — 副屏小组件
 *   pww(x)    小组件内相对 x 坐标
 *   pww2(x)   480 屏幕上绝对 x 坐标
 *   phw(x)    按宽度缩放（phw/plw 同义）
 *   plw(x)    按宽度缩放
 *
 * @example
 * // P1 典型用法 — 适用于绝大多数页面
 * import { pw, pl } from "../utils/zaui"
 *
 * createWidget(widget.TEXT, {
 *    x: pw(60), y: pl(188), w: pl(360), h: pl(46),
 *    text: '标题',
 *    text_size: pl(36),
 *    color: 0xFFFFFF,
 * })
 *
 * createWidget(widget.BUTTON, {
 *    x: pw(100), y: pl(310), w: pl(280), h: pl(56),
 *    radius: pl(28),
 *    text_size: pl(28),
 *    text: '按钮',
 * })
 *
 * createWidget(widget.CIRCLE, {
 *    center_x: pw(240), center_y: pl(124),
 *    radius: pl(40),
 * })
 */

import { getDeviceInfo, SCREEN_SHAPE_SQUARE, SCREEN_SHAPE_ROUND } from '@zos/device'
let { width, height, screenShape } = getDeviceInfo()

// ---- P0: 宽度等比缩放 ----
const pxw = width / 480

export function px0(x) {
    return x * pxw
}

// ---- P1: 高度等比缩放 + 水平居中（推荐） ----
const pxh = height / 480
const widbase1 = width / 2 - height / 2

export function pw(w) {
    return w * pxh + widbase1
}

/** @deprecated 已废弃，请使用 pl() 替代 */
export function ph(h) {
    return h * pxh
}

export function pl(l) {
    return l * pxh
}

// ---- P2: 圆形屏兼容基线 ----
const heibase2 = height / 2 - 240 * pxw

export function pw2(w) {
    return w * pxw
}

export function ph2(h) {
    return heibase2 + h * pxw
}

export function pl2(l) {
    return l * pxw
}

// ---- P3: 点对点最大重叠 ----
let pxw1
if (screenShape === SCREEN_SHAPE_ROUND) {
    pxw1 = width / 480
} else {
    pxw1 = width / 390
}
const widbase3 = width / 2 - 240 * pxw1
const heibase3 = height / 2 - 240 * pxw1

export function pw3(w) {
    return widbase3 + w * pxw1
}

export function ph3(h) {
    return heibase3 + h * pxw1
}

export function pl3(l) {
    return l * pxw1
}

// ---- PW: 副屏小组件 ----
import { getAppWidgetSize } from '@zos/ui'

const { w, margin } = getAppWidgetSize()
const pww0 = w / 400

export function pww(x) {
    return margin + x * pww0
}

export function pww2(x) {
    return margin + (x - 40) * pww0
}

export function phw(x) {
    return x * pww0
}

export function plw(x) {
    return x * pww0
}
