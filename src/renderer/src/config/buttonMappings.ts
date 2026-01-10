/**
 * 按键映射配置
 * 用于鼠标按键自定义功能
 *
 * 博巨矽协议按键配置4字节格式:
 * | Byte1 | 类型       | Byte2      | Byte3       | Byte4    |
 * | 0x00  | 键盘单键   | 0x00       | Key code    | 0x00     |
 * | 0x01  | 键盘组合键 | Modify key | Key code    | 2nd code |
 * | 0x02  | 鼠标按键   | 0x00       | Button ID   | 0x00     |
 * | 0x03  | 多媒体键   | 0x00       | 键值高位    | 键值低位 |
 * | 0x04  | 禁用按键   | 0x00       | 0x00        | 0x00     |
 * | 0x05  | DPI按键    | 0x00       | DPI change  | 0x00     |
 * | 0x06  | 功能按键   | 0x00       | Function ID | 0x00     |
 * | 0x07  | 宏定义     | 0x00       | Macro ID    | 0x00     |
 * | 0x08  | 滚轮       | 0x00       | 方向        | 连续滚动 |
 */

/**
 * 按键类型（博巨矽协议）
 */
export enum ButtonType {
  KEYBOARD_SINGLE = 'keyboard_single', // 键盘单键 (0x00)
  KEYBOARD_COMBO = 'keyboard_combo', // 键盘组合键 (0x01)
  MOUSE = 'mouse', // 鼠标按键 (0x02)
  MULTIMEDIA = 'multimedia', // 多媒体键 (0x03)
  DISABLED = 'disabled', // 禁用按键 (0x04)
  DPI = 'dpi', // DPI按键 (0x05)
  FUNCTION = 'function', // 功能按键 (0x06)
  MACRO = 'macro', // 宏定义 (0x07)
  SCROLL = 'scroll' // 滚轮 (0x08)
}

/**
 * 博巨矽协议按键类型码
 */
export const BUTTON_TYPE_CODE = {
  KEYBOARD_SINGLE: 0x00,
  KEYBOARD_COMBO: 0x01,
  MOUSE: 0x02,
  MULTIMEDIA: 0x03,
  DISABLED: 0x04,
  DPI: 0x05,
  FUNCTION: 0x06,
  MACRO: 0x07,
  SCROLL: 0x08
} as const

/**
 * 按键映射项
 */
export interface ButtonMapping {
  id: string
  name: string
  nameKey?: string // 国际化 key
  type: ButtonType
  code: number[] // 4字节编码
  category?: string // 分类（用于UI分组）
  categoryKey?: string // 分类国际化 key
}

/**
 * 鼠标功能按键（博巨矽协议）
 * 格式: [0x02, 0x00, Button ID, 0x00]
 * Button ID: bit0=左键(0x01), bit1=右键(0x02), bit2=中键(0x04), bit3=后退(0x08), bit4=前进(0x10)
 */
export const mouseButtons: ButtonMapping[] = [
  {
    id: 'left',
    name: '左键',
    nameKey: 'buttonMapping.mouseButtons.left',
    type: ButtonType.MOUSE,
    code: [0x02, 0x00, 0x01, 0x00],
    category: '基础功能',
    categoryKey: 'buttonMapping.categories.basic'
  },
  {
    id: 'right',
    name: '右键',
    nameKey: 'buttonMapping.mouseButtons.right',
    type: ButtonType.MOUSE,
    code: [0x02, 0x00, 0x02, 0x00],
    category: '基础功能',
    categoryKey: 'buttonMapping.categories.basic'
  },
  {
    id: 'middle',
    name: '中键',
    nameKey: 'buttonMapping.mouseButtons.middle',
    type: ButtonType.MOUSE,
    code: [0x02, 0x00, 0x04, 0x00],
    category: '基础功能',
    categoryKey: 'buttonMapping.categories.basic'
  },
  {
    id: 'back',
    name: '后退',
    nameKey: 'buttonMapping.mouseButtons.back',
    type: ButtonType.MOUSE,
    code: [0x02, 0x00, 0x08, 0x00],
    category: '基础功能',
    categoryKey: 'buttonMapping.categories.basic'
  },
  {
    id: 'forward',
    name: '前进',
    nameKey: 'buttonMapping.mouseButtons.forward',
    type: ButtonType.MOUSE,
    code: [0x02, 0x00, 0x10, 0x00],
    category: '基础功能',
    categoryKey: 'buttonMapping.categories.basic'
  },
  {
    id: 'disabled',
    name: '禁用',
    nameKey: 'buttonMapping.mouseButtons.disabled',
    type: ButtonType.DISABLED,
    code: [0x04, 0x00, 0x00, 0x00],
    category: '特殊功能',
    categoryKey: 'buttonMapping.categories.special'
  }
]

/**
 * DPI 功能按键（博巨矽协议）
 * 格式: [0x05, 0x00, DPI change, 0x00]
 * DPI change: 0x00=DPI+不循环, 0x01=DPI-不循环, 0x02=DPI+循环, 0x03=DPI-循环
 */
export const dpiButtons: ButtonMapping[] = [
  {
    id: 'dpi_increase',
    name: 'DPI+',
    nameKey: 'buttonMapping.dpiButtons.increase',
    type: ButtonType.DPI,
    code: [0x05, 0x00, 0x00, 0x00],
    category: 'DPI功能',
    categoryKey: 'buttonMapping.categories.dpi'
  },
  {
    id: 'dpi_decrease',
    name: 'DPI-',
    nameKey: 'buttonMapping.dpiButtons.decrease',
    type: ButtonType.DPI,
    code: [0x05, 0x00, 0x01, 0x00],
    category: 'DPI功能',
    categoryKey: 'buttonMapping.categories.dpi'
  },
  {
    id: 'dpi_increase_cycle',
    name: 'DPI+循环',
    nameKey: 'buttonMapping.dpiButtons.increaseCycle',
    type: ButtonType.DPI,
    code: [0x05, 0x00, 0x02, 0x00],
    category: 'DPI功能',
    categoryKey: 'buttonMapping.categories.dpi'
  },
  {
    id: 'dpi_decrease_cycle',
    name: 'DPI-循环',
    nameKey: 'buttonMapping.dpiButtons.decreaseCycle',
    type: ButtonType.DPI,
    code: [0x05, 0x00, 0x03, 0x00],
    category: 'DPI功能',
    categoryKey: 'buttonMapping.categories.dpi'
  }
]

/**
 * 多媒体按键（博巨矽协议）
 * 格式: [0x03, 0x00, 键值高位, 键值低位]
 */
export const multimediaButtons: ButtonMapping[] = [
  {
    id: 'vol_up',
    name: '音量+',
    nameKey: 'buttonMapping.multimediaButtons.volUp',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x00, 0xe9],
    category: '音量控制',
    categoryKey: 'buttonMapping.categories.volume'
  },
  {
    id: 'vol_down',
    name: '音量-',
    nameKey: 'buttonMapping.multimediaButtons.volDown',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x00, 0xea],
    category: '音量控制',
    categoryKey: 'buttonMapping.categories.volume'
  },
  {
    id: 'mute',
    name: '静音',
    nameKey: 'buttonMapping.multimediaButtons.mute',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x00, 0xe2],
    category: '音量控制',
    categoryKey: 'buttonMapping.categories.volume'
  },
  {
    id: 'play_pause',
    name: '播放/暂停',
    nameKey: 'buttonMapping.multimediaButtons.playPause',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x00, 0xcd],
    category: '播放控制',
    categoryKey: 'buttonMapping.categories.playback'
  },
  {
    id: 'stop',
    name: '停止',
    nameKey: 'buttonMapping.multimediaButtons.stop',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x00, 0xb7],
    category: '播放控制',
    categoryKey: 'buttonMapping.categories.playback'
  },
  {
    id: 'prev',
    name: '上一首',
    nameKey: 'buttonMapping.multimediaButtons.prev',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x00, 0xb6],
    category: '播放控制',
    categoryKey: 'buttonMapping.categories.playback'
  },
  {
    id: 'next',
    name: '下一首',
    nameKey: 'buttonMapping.multimediaButtons.next',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x00, 0xb5],
    category: '播放控制',
    categoryKey: 'buttonMapping.categories.playback'
  },
  {
    id: 'media',
    name: '多媒体',
    nameKey: 'buttonMapping.multimediaButtons.media',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x01, 0x83],
    category: '系统功能',
    categoryKey: 'buttonMapping.categories.system'
  },
  {
    id: 'home',
    name: '主页',
    nameKey: 'buttonMapping.multimediaButtons.home',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x02, 0x23],
    category: '浏览器',
    categoryKey: 'buttonMapping.categories.browser'
  },
  {
    id: 'refresh',
    name: '网页-刷新',
    nameKey: 'buttonMapping.multimediaButtons.refresh',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x02, 0x27],
    category: '浏览器',
    categoryKey: 'buttonMapping.categories.browser'
  },
  {
    id: 'web_stop',
    name: '网页-停止',
    nameKey: 'buttonMapping.multimediaButtons.webStop',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x02, 0x26],
    category: '浏览器',
    categoryKey: 'buttonMapping.categories.browser'
  },
  {
    id: 'web_forward',
    name: '网页-前进',
    nameKey: 'buttonMapping.multimediaButtons.webForward',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x02, 0x25],
    category: '浏览器',
    categoryKey: 'buttonMapping.categories.browser'
  },
  {
    id: 'web_back',
    name: '网页-后退',
    nameKey: 'buttonMapping.multimediaButtons.webBack',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x02, 0x24],
    category: '浏览器',
    categoryKey: 'buttonMapping.categories.browser'
  },
  {
    id: 'favorites',
    name: '网页-收藏夹',
    nameKey: 'buttonMapping.multimediaButtons.favorites',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x02, 0x2a],
    category: '浏览器',
    categoryKey: 'buttonMapping.categories.browser'
  },
  {
    id: 'search',
    name: '网页-搜索',
    nameKey: 'buttonMapping.multimediaButtons.search',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x02, 0x21],
    category: '浏览器',
    categoryKey: 'buttonMapping.categories.browser'
  },
  {
    id: 'calculator',
    name: '计算器',
    nameKey: 'buttonMapping.multimediaButtons.calculator',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x01, 0x92],
    category: '系统功能',
    categoryKey: 'buttonMapping.categories.system'
  },
  {
    id: 'my_computer',
    name: '我的电脑',
    nameKey: 'buttonMapping.multimediaButtons.myComputer',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x01, 0x94],
    category: '系统功能',
    categoryKey: 'buttonMapping.categories.system'
  },
  {
    id: 'mail',
    name: '邮件',
    nameKey: 'buttonMapping.multimediaButtons.mail',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x01, 0x8a],
    category: '系统功能',
    categoryKey: 'buttonMapping.categories.system'
  },
  {
    id: 'brightness_up',
    name: '亮度提升',
    nameKey: 'buttonMapping.multimediaButtons.brightnessUp',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x00, 0x6f],
    category: '系统功能',
    categoryKey: 'buttonMapping.categories.system'
  },
  {
    id: 'brightness_down',
    name: '亮度降低',
    nameKey: 'buttonMapping.multimediaButtons.brightnessDown',
    type: ButtonType.MULTIMEDIA,
    code: [0x03, 0x00, 0x00, 0x70],
    category: '系统功能',
    categoryKey: 'buttonMapping.categories.system'
  }
]

/**
 * 修饰键枚举（博巨矽协议）
 * Modify key 位图:
 * bit0=L-Shift, bit1=L-Ctrl, bit2=L-Alt, bit3=L-Win
 * bit4=R-Shift, bit5=R-Ctrl, bit6=R-Alt, bit7=R-Win
 */
export enum ModifierKey {
  NONE = 0x00,
  L_CTRL = 0x01,
  L_SHIFT = 0x02,
  L_ALT = 0x04,
  L_WIN = 0x08,
  R_CTRL = 0x10,
  R_SHIFT = 0x20,
  R_ALT = 0x40,
  R_WIN = 0x80
}

/**
 * 修饰键配置
 */
export const modifierKeys = [
  { id: 'l_ctrl', name: 'Ctrl', nameKey: 'buttonMapping.modifiers.ctrl', value: ModifierKey.L_CTRL },
  {
    id: 'l_shift',
    name: 'Shift',
    nameKey: 'buttonMapping.modifiers.shift',
    value: ModifierKey.L_SHIFT
  },
  { id: 'l_alt', name: 'Alt', nameKey: 'buttonMapping.modifiers.alt', value: ModifierKey.L_ALT },
  { id: 'l_win', name: 'Win', nameKey: 'buttonMapping.modifiers.win', value: ModifierKey.L_WIN }
]

/**
 * 键盘扫描码映射（HID Usage ID）
 * 参考：https://www.usb.org/sites/default/files/documents/hut1_12v2.pdf
 */
export const keyboardScancodes: Record<string, number> = {
  // 字母键 A-Z
  A: 0x04,
  B: 0x05,
  C: 0x06,
  D: 0x07,
  E: 0x08,
  F: 0x09,
  G: 0x0a,
  H: 0x0b,
  I: 0x0c,
  J: 0x0d,
  K: 0x0e,
  L: 0x0f,
  M: 0x10,
  N: 0x11,
  O: 0x12,
  P: 0x13,
  Q: 0x14,
  R: 0x15,
  S: 0x16,
  T: 0x17,
  U: 0x18,
  V: 0x19,
  W: 0x1a,
  X: 0x1b,
  Y: 0x1c,
  Z: 0x1d,

  // 数字键 1-9, 0
  '1': 0x1e,
  '2': 0x1f,
  '3': 0x20,
  '4': 0x21,
  '5': 0x22,
  '6': 0x23,
  '7': 0x24,
  '8': 0x25,
  '9': 0x26,
  '0': 0x27,

  // 功能键 F1-F12
  F1: 0x3a,
  F2: 0x3b,
  F3: 0x3c,
  F4: 0x3d,
  F5: 0x3e,
  F6: 0x3f,
  F7: 0x40,
  F8: 0x41,
  F9: 0x42,
  F10: 0x43,
  F11: 0x44,
  F12: 0x45,

  // 特殊键
  Enter: 0x28,
  Escape: 0x29,
  Backspace: 0x2a,
  Tab: 0x2b,
  Space: 0x2c,
  Minus: 0x2d,
  Equal: 0x2e,
  LeftBracket: 0x2f,
  RightBracket: 0x30,
  Backslash: 0x31,
  Semicolon: 0x33,
  Quote: 0x34,
  Grave: 0x35,
  Comma: 0x36,
  Period: 0x37,
  Slash: 0x38,
  CapsLock: 0x39,

  // 导航键
  Insert: 0x49,
  Home: 0x4a,
  PageUp: 0x4b,
  Delete: 0x4c,
  End: 0x4d,
  PageDown: 0x4e,
  Right: 0x4f,
  Left: 0x50,
  Down: 0x51,
  Up: 0x52,

  // 系统键
  PrintScreen: 0x46,
  ScrollLock: 0x47,
  Pause: 0x48,

  // 小键盘
  NumLock: 0x53,
  NumpadDivide: 0x54,
  NumpadMultiply: 0x55,
  NumpadMinus: 0x56,
  NumpadPlus: 0x57,
  NumpadEnter: 0x58,
  Numpad1: 0x59,
  Numpad2: 0x5a,
  Numpad3: 0x5b,
  Numpad4: 0x5c,
  Numpad5: 0x5d,
  Numpad6: 0x5e,
  Numpad7: 0x5f,
  Numpad8: 0x60,
  Numpad9: 0x61,
  Numpad0: 0x62,
  NumpadDecimal: 0x63,
  NumpadEqual: 0x67,

  // 应用键
  App: 0x65,

  // 扩展功能键 F13-F24
  F13: 0x68,
  F14: 0x69,
  F15: 0x6a,
  F16: 0x6b,
  F17: 0x6c,
  F18: 0x6d,
  F19: 0x6e,
  F20: 0x6f,
  F21: 0x70,
  F22: 0x71,
  F23: 0x72,
  F24: 0x73,

  // 修饰键（作为单键使用）
  LeftControl: 0xe0,
  LeftShift: 0xe1,
  LeftAlt: 0xe2,
  LeftGUI: 0xe3,
  RightControl: 0xe4,
  RightShift: 0xe5,
  RightAlt: 0xe6,
  RightGUI: 0xe7
}

/**
 * 反向映射：从扫描码到键名
 */
export const scancodeToKey: Record<number, string> = Object.fromEntries(
  Object.entries(keyboardScancodes).map(([key, value]) => [value, key])
)

/**
 * 创建键盘按键映射（博巨矽协议）
 * 单键格式: [0x00, 0x00, Key code, 0x00]
 * 组合键格式: [0x01, Modify key, Key code, 2nd code]
 * @param modifiers 修饰键组合（按位或）
 * @param scancode 键盘扫描码
 * @param scancode2 第二个键盘扫描码（可选）
 * @returns 4字节编码
 */
export function createKeyboardMapping(
  modifiers: number,
  scancode: number,
  scancode2: number = 0
): number[] {
  if (modifiers === 0 && scancode2 === 0) {
    // 单键
    return [BUTTON_TYPE_CODE.KEYBOARD_SINGLE, 0x00, scancode, 0x00]
  } else {
    // 组合键
    return [BUTTON_TYPE_CODE.KEYBOARD_COMBO, modifiers, scancode, scancode2]
  }
}

/**
 * 解析键盘按键映射（博巨矽协议）
 * @param code 4字节编码
 * @returns { modifiers: number, scancode: number, scancode2: number, keyName: string, keyName2: string }
 */
export function parseKeyboardMapping(code: number[]): {
  modifiers: number
  scancode: number
  scancode2: number
  keyName: string
  keyName2: string
  modifierNames: string[]
} {
  // 单键 (0x00) 或组合键 (0x01)
  if (code[0] !== BUTTON_TYPE_CODE.KEYBOARD_SINGLE && code[0] !== BUTTON_TYPE_CODE.KEYBOARD_COMBO) {
    throw new Error('不是键盘按键映射')
  }

  const modifiers = code[0] === BUTTON_TYPE_CODE.KEYBOARD_COMBO ? code[1] : 0
  const scancode = code[2]
  const scancode2 = code[3]

  // 0x00 表示 No Event（无按键），不显示
  const keyName = scancode === 0 ? '' : (scancodeToKey[scancode] || `Unknown(0x${scancode.toString(16)})`)
  const keyName2 = scancode2 === 0 ? '' : (scancodeToKey[scancode2] || `Unknown(0x${scancode2.toString(16)})`)

  const modifierNames: string[] = []
  if (modifiers & ModifierKey.L_CTRL) modifierNames.push('Ctrl')
  if (modifiers & ModifierKey.L_SHIFT) modifierNames.push('Shift')
  if (modifiers & ModifierKey.L_ALT) modifierNames.push('Alt')
  if (modifiers & ModifierKey.L_WIN) modifierNames.push('Win')

  return { modifiers, scancode, scancode2, keyName, keyName2, modifierNames }
}

/**
 * 翻译函数类型
 */
export type TranslateFunction = (key: string, params?: Record<string, string | number>) => string

/**
 * 获取按键映射的显示名称（博巨矽协议）
 * @param code 4字节编码
 * @param t 翻译函数（可选，不传则使用默认中文）
 * @returns 显示名称
 */
export function getButtonDisplayName(code: number[], t?: TranslateFunction): string {
  const typeCode = code[0]

  // 检查是否是宏映射 (0x07)
  if (typeCode === BUTTON_TYPE_CODE.MACRO) {
    const macroIndex = code[2]
    if (t) {
      return t('buttonMapping.displayNames.macro', { index: String(macroIndex + 1) })
    }
    return `宏${macroIndex + 1}`
  }

  // 检查是否是禁用 (0x04)
  if (typeCode === BUTTON_TYPE_CODE.DISABLED) {
    if (t) {
      return t('buttonMapping.displayNames.disabled')
    }
    return '禁用'
  }

  // 检查是否是鼠标功能 (0x02)
  if (typeCode === BUTTON_TYPE_CODE.MOUSE) {
    const mouseButton = mouseButtons.find((btn) => btn.code.every((byte, i) => byte === code[i]))
    if (mouseButton) {
      if (t && mouseButton.nameKey) {
        return t(mouseButton.nameKey)
      }
      return mouseButton.name
    }
  }

  // 检查是否是 DPI 功能 (0x05)
  if (typeCode === BUTTON_TYPE_CODE.DPI) {
    const dpiButton = dpiButtons.find((btn) => btn.code.every((byte, i) => byte === code[i]))
    if (dpiButton) {
      if (t && dpiButton.nameKey) {
        return t(dpiButton.nameKey)
      }
      return dpiButton.name
    }
  }

  // 检查是否是多媒体按键 (0x03)
  if (typeCode === BUTTON_TYPE_CODE.MULTIMEDIA) {
    const multimediaButton = multimediaButtons.find((btn) =>
      btn.code.every((byte, i) => byte === code[i])
    )
    if (multimediaButton) {
      if (t && multimediaButton.nameKey) {
        return t(multimediaButton.nameKey)
      }
      return multimediaButton.name
    }
  }

  // 检查是否是键盘按键 (0x00 单键 或 0x01 组合键)
  if (typeCode === BUTTON_TYPE_CODE.KEYBOARD_SINGLE || typeCode === BUTTON_TYPE_CODE.KEYBOARD_COMBO) {
    try {
      const { keyName, keyName2, modifierNames } = parseKeyboardMapping(code)

      // 构建显示名称，过滤掉空的部分
      const parts: string[] = []
      if (modifierNames.length > 0) {
        parts.push(modifierNames.join('+'))
      }
      if (keyName) {
        parts.push(keyName)
      }
      if (keyName2) {
        parts.push(keyName2)
      }

      // 如果所有部分都为空，返回空字符串或默认值
      if (parts.length === 0) {
        if (t) {
          return t('buttonMapping.displayNames.none')
        }
        return '无'
      }

      return parts.join('+')
    } catch {
      // 解析失败，返回未知
    }
  }

  // 检查是否是滚轮 (0x08)
  if (typeCode === BUTTON_TYPE_CODE.SCROLL) {
    const direction = code[2]
    if (t) {
      const directionKeys = [
        'buttonMapping.displayNames.scrollUp',
        'buttonMapping.displayNames.scrollDown',
        'buttonMapping.displayNames.scrollLeft',
        'buttonMapping.displayNames.scrollRight'
      ]
      if (direction >= 0 && direction < directionKeys.length) {
        return t(directionKeys[direction])
      }
      return t('buttonMapping.displayNames.scroll')
    }
    const directionNames = ['滚轮↑', '滚轮↓', '滚轮←', '滚轮→']
    return directionNames[direction] || '滚轮'
  }

  // 未知按键，显示十六进制
  const hexCode = code.map((b) => b.toString(16).padStart(2, '0')).join(' ')
  if (t) {
    return t('buttonMapping.displayNames.unknown', { code: hexCode })
  }
  return `未知(${hexCode})`
}

/**
 * 默认按键映射（博巨矽协议，8个按键）
 * 按键顺序（设备数组索引）:
 * 0: 左键 (暂不开放修改)
 * 1: 中键
 * 2: 右键
 * 3: 前进键
 * 4: 后退键
 * 5: 滚轮前滚 (暂不开放修改，也不显示)
 * 6: 滚轮后滚 (暂不开放修改，也不显示)
 * 7: DPI键
 */
export const defaultButtonMappings: number[][] = [
  [0x02, 0x00, 0x01, 0x00], // 索引0: 左键
  [0x02, 0x00, 0x04, 0x00], // 索引1: 中键
  [0x02, 0x00, 0x02, 0x00], // 索引2: 右键
  [0x02, 0x00, 0x10, 0x00], // 索引3: 前进键
  [0x02, 0x00, 0x08, 0x00], // 索引4: 后退键
  [0x08, 0x00, 0x00, 0x00], // 索引5: 滚轮前滚
  [0x08, 0x00, 0x01, 0x00], // 索引6: 滚轮后滚
  [0x05, 0x00, 0x02, 0x00] // 索引7: DPI键 (DPI+循环)
]
