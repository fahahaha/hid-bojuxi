import { ref, watch } from 'vue'

/**
 * 宏事件类型
 */
export type MacroEventType = 'keydown' | 'keyup' | 'mousedown' | 'mouseup' | 'mousemove'

/**
 * 宏事件接口
 */
export interface MacroEvent {
  /** 事件类型 */
  type: MacroEventType
  /** 按键名称 (用于显示) */
  key: string
  /** Macro Code (博巨矽协议使用) */
  macroCode: number
  /** 延迟时间 (毫秒)，最大 32768ms */
  delay: number
  /** 鼠标 XY 移动数据 (仅当 macroCode 为 0xF9 时有效) */
  mouseXY?: { x: number; y: number }
}

/**
 * 循环模式
 * - 'once': 执行一次
 * - 'release': 循环直到按键松开 (0xFFFF)
 * - 'toggle': 切换模式，第一次按下开始循环，第二次按下停止 (0xFFFE)
 * - 'anykey': 循环直到任意键按下 (0xFFFD)
 * - 'count': 循环指定次数 (0x0000~0xFFFC)
 */
export type MacroLoopMode = 'once' | 'release' | 'toggle' | 'anykey' | 'count'

/**
 * 宏接口
 */
export interface Macro {
  /** 宏名称 */
  name: string
  /** 宏事件列表 */
  events: MacroEvent[]
  /** 循环模式 */
  loopMode: MacroLoopMode
  /** 循环次数 (当 loopMode 为 'count' 时有效，范围 1-65532) */
  loopCount: number
}

const STORAGE_KEY = 'mouse_macros'
const MAX_MACRO_COUNT = 10
const MAX_MACRO_ACTIONS = 340
const MAX_DELAY_MS = 32768

/**
 * 博巨矽协议 Macro Code 映射表
 * 根据协议文档附录定义
 */
export const MACRO_CODE_MAP: Record<string, number> = {
  // 特殊码
  'No Event': 0x00, // macro end
  'Delay Only 1': 0x01,
  'Delay Only 2': 0x02,
  'Delay Only 3': 0x03,

  // 字母键 A-Z (0x04-0x1D)
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

  // 数字键 1-0 (0x1E-0x27)
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

  // 特殊键
  Enter: 0x28,
  Escape: 0x29,
  Backspace: 0x2a,
  Tab: 0x2b,
  Space: 0x2c,
  ' ': 0x2c,
  Minus: 0x2d,
  '-': 0x2d,
  Equal: 0x2e,
  '=': 0x2e,
  LeftBracket: 0x2f,
  '[': 0x2f,
  RightBracket: 0x30,
  ']': 0x30,
  Backslash: 0x31,
  '\\': 0x31,
  Semicolon: 0x33,
  ';': 0x33,
  Quote: 0x34,
  "'": 0x34,
  Grave: 0x35,
  '`': 0x35,
  Comma: 0x36,
  ',': 0x36,
  Period: 0x37,
  '.': 0x37,
  Slash: 0x38,
  '/': 0x38,
  CapsLock: 0x39,

  // 功能键 F1-F12 (0x3A-0x45)
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

  // 系统键
  PrintScreen: 0x46,
  ScrollLock: 0x47,
  Pause: 0x48,
  Insert: 0x49,
  Home: 0x4a,
  PageUp: 0x4b,
  Delete: 0x4c,
  End: 0x4d,
  PageDown: 0x4e,

  // 方向键
  ArrowRight: 0x4f,
  Right: 0x4f,
  ArrowLeft: 0x50,
  Left: 0x50,
  ArrowDown: 0x51,
  Down: 0x51,
  ArrowUp: 0x52,
  Up: 0x52,

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
  App: 0x65,
  NumpadEqual: 0x67,

  // 扩展功能键 F13-F24 (0x68-0x73)
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

  // 修饰键 (0xE0-0xE7)
  LeftControl: 0xe0,
  Control: 0xe0,
  LeftShift: 0xe1,
  Shift: 0xe1,
  LeftAlt: 0xe2,
  Alt: 0xe2,
  LeftGUI: 0xe3,
  Meta: 0xe3,
  RightControl: 0xe4,
  RightShift: 0xe5,
  RightAlt: 0xe6,
  RightGUI: 0xe7,

  // 鼠标按键 (0xF0-0xF9)
  MouseLeft: 0xf0,
  MouseRight: 0xf1,
  MouseMiddle: 0xf2,
  MouseForward: 0xf3,
  MouseBack: 0xf4,
  MouseLTilt: 0xf5,
  MouseRTilt: 0xf6,
  MouseScrollUp: 0xf7,
  MouseScrollDown: 0xf8,
  MouseXY: 0xf9
}

/**
 * Macro Code 到按键名称的反向映射
 */
export const MACRO_CODE_TO_NAME: Record<number, string> = Object.entries(MACRO_CODE_MAP).reduce(
  (acc, [name, code]) => {
    // 优先使用更友好的名称
    if (!acc[code] || name.length < acc[code].length) {
      acc[code] = name
    }
    return acc
  },
  {} as Record<number, string>
)

/**
 * 循环模式到协议值的映射
 */
export const LOOP_MODE_TO_VALUE: Record<MacroLoopMode, number | null> = {
  once: 1, // 执行1次
  release: 0xffff, // 按住循环，松开停止
  toggle: 0xfffe, // 切换模式
  anykey: 0xfffd, // 循环至任意键按下
  count: null // 使用 loopCount 值
}

/**
 * 宏管理本地存储
 */
export function useMacroStorage() {
  // 初始化宏列表 (空数组,从缓存加载)
  const macros = ref<Macro[]>([])

  /**
   * 从 localStorage 加载宏列表
   */
  function loadMacros(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Macro[]
        if (Array.isArray(parsed)) {
          macros.value = parsed
          console.log('[宏存储] 已加载宏列表:', parsed)
        } else {
          console.warn('[宏存储] 存储的宏列表格式不正确,使用空数组')
          macros.value = []
        }
      } else {
        macros.value = []
      }
    } catch (err) {
      console.error('[宏存储] 加载宏列表失败:', err)
      macros.value = []
    }
  }

  /**
   * 保存宏列表到 localStorage
   */
  function saveMacros(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(macros.value))
      console.log('[宏存储] 已保存宏列表')
    } catch (err) {
      console.error('[宏存储] 保存宏列表失败:', err)
    }
  }

  /**
   * 获取指定索引的宏
   */
  function getMacro(index: number): Macro | null {
    if (index < 0 || index >= macros.value.length) {
      console.error('[宏存储] 宏索引超出范围:', index)
      return null
    }
    return macros.value[index]
  }

  /**
   * 添加新宏
   */
  function addMacro(macro: Macro): boolean {
    if (macros.value.length >= MAX_MACRO_COUNT) {
      console.error('[宏存储] 已达到最大宏数量限制')
      return false
    }
    macros.value.push({ ...macro })
    saveMacros()
    return true
  }

  /**
   * 更新指定索引的宏
   */
  function updateMacro(index: number, macro: Macro): boolean {
    if (index < 0 || index >= macros.value.length) {
      console.error('[宏存储] 宏索引超出范围:', index)
      return false
    }
    macros.value[index] = { ...macro }
    saveMacros()
    return true
  }

  /**
   * 删除指定索引的宏
   */
  function deleteMacro(index: number): boolean {
    if (index < 0 || index >= macros.value.length) {
      console.error('[宏存储] 宏索引超出范围:', index)
      return false
    }
    macros.value.splice(index, 1)
    saveMacros()
    return true
  }

  /**
   * 清空所有宏
   */
  function clearAllMacros(): void {
    macros.value = []
    saveMacros()
  }

  /**
   * 获取下一个可用的宏名称
   */
  function getNextMacroName(): string {
    const existingNumbers = macros.value
      .map((m) => {
        const match = m.name.match(/^宏\s*(\d+)$/)
        return match ? parseInt(match[1]) : 0
      })
      .filter((n) => n > 0)

    if (existingNumbers.length === 0) {
      return '宏 1'
    }

    const maxNumber = Math.max(...existingNumbers)
    return `宏 ${maxNumber + 1}`
  }

  /**
   * 将宏事件编码为博巨矽协议格式
   * 格式说明:
   * - 普通动作 (3字节): [action_state_low, action_state_high, action_code]
   * - 鼠标XY动作 (6字节): [action_state_low, action_state_high, 0xF9, xy_high, x_low, y_low]
   *
   * action_state (16位):
   * - bit0: 按下/释放标志 (1=按下, 0=释放)
   * - bit1~15: 延时时间 (单位ms, 最大32768ms)
   *
   * @param events 宏事件列表
   * @param loopMode 循环模式
   * @param loopCount 循环次数
   * @returns 编码后的宏数据 (包含宏长度和循环次数)
   */
  function encodeMacroForDevice(
    events: MacroEvent[],
    loopMode: MacroLoopMode,
    loopCount: number
  ): { data: number[]; totalLength: number } {
    const actionData: number[] = []

    for (const event of events) {
      // 计算 action_state
      // bit0: 按下=1, 释放=0
      // bit1~15: 延时时间
      const isPress = event.type === 'keydown' || event.type === 'mousedown'
      const delay = Math.min(MAX_DELAY_MS, Math.max(0, event.delay))
      const actionState = (delay << 1) | (isPress ? 1 : 0)

      // 低字节在前
      actionData.push(actionState & 0xff)
      actionData.push((actionState >> 8) & 0xff)

      // 动作码
      actionData.push(event.macroCode)

      // 如果是鼠标XY移动，需要额外3字节
      if (event.macroCode === 0xf9 && event.mouseXY) {
        const x = Math.max(-2048, Math.min(2047, event.mouseXY.x))
        const y = Math.max(-2048, Math.min(2047, event.mouseXY.y))

        // 处理负数 (12位有符号)
        const xEncoded = x < 0 ? x + 4096 : x
        const yEncoded = y < 0 ? y + 4096 : y

        const xH4 = (xEncoded >> 8) & 0x0f
        const yH4 = (yEncoded >> 8) & 0x0f
        const xyHigh = (xH4 << 4) | yH4
        const xLow = xEncoded & 0xff
        const yLow = yEncoded & 0xff

        actionData.push(xyHigh)
        actionData.push(xLow)
        actionData.push(yLow)
      }
    }

    // 计算循环次数值
    let loopValue: number
    if (loopMode === 'count') {
      loopValue = Math.min(0xfffc, Math.max(0, loopCount))
    } else {
      loopValue = LOOP_MODE_TO_VALUE[loopMode] ?? 1
    }

    // 宏长度 = 2(宏长度) + 2(循环次数) + 动作数据长度
    const macroLength = 4 + actionData.length

    // 构建完整的宏数据
    const data: number[] = [
      macroLength & 0xff, // 宏长度低字节
      (macroLength >> 8) & 0xff, // 宏长度高字节
      loopValue & 0xff, // 循环次数低字节
      (loopValue >> 8) & 0xff, // 循环次数高字节
      ...actionData
    ]

    return { data, totalLength: macroLength }
  }

  /**
   * 将宏事件编码为设备协议格式 (兼容旧接口)
   * @deprecated 请使用 encodeMacroForDevice
   */
  function encodeMacroEvents(events: MacroEvent[]): number[] {
    const result = encodeMacroForDevice(events, 'once', 1)
    return result.data
  }

  /**
   * 将设备协议格式解码为宏事件
   */
  function decodeMacroEvents(
    data: Array<{ delay: number; eventType: number; keyCode: number }>
  ): MacroEvent[] {
    const events: MacroEvent[] = []

    for (const item of data) {
      const type = item.eventType === 1 ? 'keydown' : 'keyup'
      const key = getKeyNameFromMacroCode(item.keyCode)

      events.push({
        type,
        key,
        macroCode: item.keyCode,
        delay: item.delay
      })
    }

    return events
  }

  /**
   * 根据 Macro Code 获取按键名称
   */
  function getKeyNameFromMacroCode(macroCode: number): string {
    return MACRO_CODE_TO_NAME[macroCode] || `Key(0x${macroCode.toString(16)})`
  }

  /**
   * 根据按键名称获取 Macro Code
   */
  function getMacroCodeFromKeyName(keyName: string): number {
    // 先尝试直接匹配
    if (MACRO_CODE_MAP[keyName] !== undefined) {
      return MACRO_CODE_MAP[keyName]
    }

    // 尝试大写匹配
    const upperKey = keyName.toUpperCase()
    if (MACRO_CODE_MAP[upperKey] !== undefined) {
      return MACRO_CODE_MAP[upperKey]
    }

    // 尝试首字母大写匹配
    const capitalizedKey = keyName.charAt(0).toUpperCase() + keyName.slice(1).toLowerCase()
    if (MACRO_CODE_MAP[capitalizedKey] !== undefined) {
      return MACRO_CODE_MAP[capitalizedKey]
    }

    console.warn('[宏存储] 未知按键:', keyName)
    return 0x00
  }

  /**
   * 根据按键名称获取扫描码 (兼容旧接口)
   * @deprecated 请使用 getMacroCodeFromKeyName
   */
  function getScancodeFromKeyName(keyName: string): number {
    return getMacroCodeFromKeyName(keyName)
  }

  /**
   * 检查宏是否超出限制
   */
  function validateMacro(macro: Macro): { valid: boolean; message: string } {
    if (macro.events.length > MAX_MACRO_ACTIONS) {
      return {
        valid: false,
        message: `宏动作数量超出限制，最多 ${MAX_MACRO_ACTIONS} 个动作`
      }
    }

    // 检查延迟时间
    for (const event of macro.events) {
      if (event.delay > MAX_DELAY_MS) {
        return {
          valid: false,
          message: `延迟时间超出限制，最大 ${MAX_DELAY_MS}ms`
        }
      }
    }

    // 检查循环次数
    if (macro.loopMode === 'count' && (macro.loopCount < 1 || macro.loopCount > 65532)) {
      return {
        valid: false,
        message: '循环次数必须在 1-65532 之间'
      }
    }

    return { valid: true, message: '' }
  }

  // 监听宏列表变化,自动保存
  watch(
    macros,
    () => {
      saveMacros()
    },
    { deep: true }
  )

  // 初始化时加载宏列表
  loadMacros()

  return {
    macros,
    getMacro,
    addMacro,
    updateMacro,
    deleteMacro,
    clearAllMacros,
    getNextMacroName,
    encodeMacroEvents,
    encodeMacroForDevice,
    decodeMacroEvents,
    getKeyNameFromMacroCode,
    getMacroCodeFromKeyName,
    getScancodeFromKeyName,
    validateMacro,
    MAX_MACRO_COUNT,
    MAX_MACRO_ACTIONS,
    MAX_DELAY_MS
  }
}
