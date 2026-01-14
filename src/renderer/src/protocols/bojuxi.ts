import { DeviceProtocol, ConnectionMode } from './index'

/**
 * 博巨矽 (Bojuxi) 游戏鼠标设备协议
 *
 * 设备信息:
 * - 有线 VID: 0x1A86, PID: 0x8312
 * - 无线 VID: 0x1A86, PID: 0x8300
 * - 机型名称: Game Mouse
 *
 * 协议特征:
 * - 发送包头: 0xBA
 * - 正常响应包头: 0x5A (ACK)
 * - 异常响应包头: 0x5B (NACK)
 * - 数据包长度: 64 字节
 * - 协议通道: HID → Interface 2 → EP3 → Usage Page (0xFF13)
 *
 * 连接模式:
 * - 0x8A: 无线方式（通过 DONGLE 的 RF）
 * - 0xFF: 有线 USB 方式
 */

// ============================================================================
// 常量定义
// ============================================================================

/** 包头定义 */
export const PACKET_HEADER = {
  /** PC 发送包头 */
  SEND: 0xba,
  /** 正常响应包头 (ACK) */
  ACK: 0x5a,
  /** 异常响应包头 (NACK) */
  NACK: 0x5b
} as const

/** 连接模式 */
export const CONNECTION_MODE = {
  /** 无线 2.4G */
  WIRELESS: 0x8a,
  /** 有线 USB */
  USB: 0xff
} as const

/** 命令码 */
export const COMMAND_CODE = {
  /** 配置基础设置 */
  SET_BASIC_SETTINGS: 0xa1,
  /** 读取基础设置 */
  GET_BASIC_SETTINGS: 0xa2,
  /** 配置宏 */
  SET_MACRO: 0xa3,
  /** 读取宏 (暂不开发) */
  GET_MACRO: 0xa4,
  /** 获取设备信息 */
  GET_DEVICE_INFO: 0xa5,
  /** 读取电池信息 */
  GET_BATTERY: 0xa6,
  /** 恢复出厂设置 */
  FACTORY_RESET: 0xa7,
  /** 固件升级 (暂不开发) */
  FIRMWARE_UPGRADE: 0xa8
} as const

/** 回报率值映射 */
export const POLLING_RATE = {
  /** 125Hz */
  HZ_125: 0x01,
  /** 250Hz */
  HZ_250: 0x02,
  /** 500Hz */
  HZ_500: 0x04,
  /** 1000Hz */
  HZ_1000: 0x08
} as const

/** 回报率值到 Hz 的映射 */
export const POLLING_RATE_TO_HZ: Record<number, number> = {
  0x01: 125,
  0x02: 250,
  0x04: 500,
  0x08: 1000
}

/** Hz 到回报率值的映射 */
export const HZ_TO_POLLING_RATE: Record<number, number> = {
  125: 0x01,
  250: 0x02,
  500: 0x04,
  1000: 0x08
}

/** 错误码定义 */
export const ERROR_CODES = {
  0x00: { name: 'Reserved', message: '保留错误码' },
  0x01: { name: 'Length Mismatch', message: '数据长度异常' },
  0x02: { name: 'Invalid Parameter', message: '参数异常' },
  0x03: { name: 'Command Not Supported', message: '命令不支持' },
  0x04: { name: 'Flash Read Error', message: 'Flash读取失败' },
  0x05: { name: 'Flash Erase Error', message: 'Flash擦除失败' },
  0x06: { name: 'Flash Write Error', message: 'Flash写入失败' },
  0x07: { name: 'Checksum Error', message: '数据校验失败' },
  0x08: { name: 'Table ID Out of Range', message: '表ID不支持' }
} as const

/** 按键类型定义 */
export const BUTTON_TYPE = {
  /** 键盘单键 */
  KEYBOARD_SINGLE: 0x00,
  /** 键盘组合键 */
  KEYBOARD_COMBO: 0x01,
  /** 鼠标按键 */
  MOUSE_BUTTON: 0x02,
  /** 多媒体键 */
  MULTIMEDIA: 0x03,
  /** 禁用按键 */
  DISABLED: 0x04,
  /** DPI 按键 */
  DPI: 0x05,
  /** 功能按键 */
  FUNCTION: 0x06,
  /** 宏定义 */
  MACRO: 0x07,
  /** 滚轮 */
  SCROLL: 0x08
} as const

/** 鼠标按键 ID */
export const MOUSE_BUTTON_ID = {
  LEFT: 0x01,
  RIGHT: 0x02,
  MIDDLE: 0x04,
  BACKWARD: 0x08,
  FORWARD: 0x10
} as const

/** DPI 切换模式 */
export const DPI_CHANGE_MODE = {
  /** DPI+ 不循环 */
  INCREASE: 0x00,
  /** DPI- 不循环 */
  DECREASE: 0x01,
  /** DPI+ 循环 */
  INCREASE_CYCLE: 0x02,
  /** DPI- 循环 */
  DECREASE_CYCLE: 0x03
} as const

/** 滚轮方向 */
export const SCROLL_DIRECTION = {
  /** 前滚（向上） */
  UP: 0x00,
  /** 后滚（向下） */
  DOWN: 0x01,
  /** 左滚 */
  LEFT: 0x02,
  /** 右滚 */
  RIGHT: 0x03
} as const

/** 电池状态 */
export const BATTERY_STATUS = {
  /** 空闲 */
  IDLE: 0x00,
  /** 充电中 */
  CHARGING: 0x01,
  /** 充满电 */
  FULL: 0x02,
  /** 未稳定 */
  UNSTABLE: 0x03
} as const

/** 默认按键配置 */
export const DEFAULT_BUTTON_CONFIG = {
  /** 左键 (暂不开放修改) */
  LEFT: [0x02, 0x00, 0x01, 0x00],
  /** 中键 */
  MIDDLE: [0x02, 0x00, 0x04, 0x00],
  /** 右键 */
  RIGHT: [0x02, 0x00, 0x02, 0x00],
  /** 前进键 */
  FORWARD: [0x02, 0x00, 0x10, 0x00],
  /** 后退键 */
  BACKWARD: [0x02, 0x00, 0x08, 0x00],
  /** 滚轮前滚 (暂不开放修改,也不显示) */
  WHEEL_UP: [0x08, 0x00, 0x00, 0x00],
  /** 滚轮后滚 (暂不开放修改,也不显示)*/
  WHEEL_DOWN: [0x08, 0x00, 0x01, 0x00],
  /** DPI 键 */
  DPI: [0x05, 0x00, 0x02, 0x00]
} as const

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 创建 64 字节数据包
 * @param data 数据内容
 * @returns 64 字节数组
 */
function createPacket(data: number[]): number[] {
  const packet = [...data]
  while (packet.length < 64) {
    packet.push(0x00)
  }
  return packet
}

/**
 * 根据连接模式获取对应的字节值
 * @param mode 连接模式
 * @returns 连接模式字节值
 */
function getConnectionModeByte(mode: ConnectionMode): number {
  return mode === '2.4g' ? CONNECTION_MODE.WIRELESS : CONNECTION_MODE.USB
}

/**
 * 解析 NACK 响应
 * @param response 响应数据
 * @returns 错误信息
 */
export function parseNackResponse(response: Uint8Array): {
  command: number
  errorCode: number
  errorName: string
  errorMessage: string
} | null {
  if (response[0] !== PACKET_HEADER.NACK) return null

  const errorCode = response[4]
  const errorInfo = ERROR_CODES[errorCode as keyof typeof ERROR_CODES] || {
    name: 'Unknown',
    message: '未知错误'
  }

  return {
    command: response[2],
    errorCode: errorCode,
    errorName: errorInfo.name,
    errorMessage: errorInfo.message
  }
}

/**
 * 检查响应是否为 ACK
 * @param response 响应数据
 * @param expectedCommand 期望的命令码
 * @returns 是否为有效 ACK
 */
export function isValidAck(response: Uint8Array, expectedCommand: number): boolean {
  return response[0] === PACKET_HEADER.ACK && response[2] === expectedCommand
}

// ============================================================================
// 协议实现
// ============================================================================

/**
 * 博巨矽游戏鼠标协议
 */
export const bojuxiProtocol: DeviceProtocol = {
  name: 'Bojuxi Gaming Mouse',

  /**
   * 设备识别
   * 通过 VID/PID 识别博巨矽鼠标
   */
  identify: (device: HIDDevice) => {
    // 博巨矽鼠标 VID: 0x1A86
    // 有线 PID: 0x8312
    // 无线 PID: 0x8300
    const isBojuxi =
      device.vendorId === 0x1a86 &&
      (device.productId === 0x8312 || device.productId === 0x8300 || device.productId === 0x8301)

    console.log(
      `[Bojuxi] (VID: 0x${device.vendorId.toString(16)}, PID: 0x${device.productId.toString(16)})`
    )
    if (isBojuxi) {
      console.log(
        `[Bojuxi] 识别到博巨矽鼠标 (VID: 0x${device.vendorId.toString(16)}, PID: 0x${device.productId.toString(16)})`
      )
    }

    return isBojuxi
  },

  commands: {
    // ========================================================================
    // 获取命令
    // ========================================================================

    /**
     * 获取设备信息 (M05)
     * 命令码: 0xA5
     * @param mode 连接模式
     */
    getDeviceInfo: (mode: ConnectionMode = 'usb') =>
      createPacket([
        PACKET_HEADER.SEND,
        getConnectionModeByte(mode),
        COMMAND_CODE.GET_DEVICE_INFO,
        0x02, // 数据长度
        0x01, // mode
        0x00 // table_id
      ]),

    /**
     * 获取电池信息 (M06)
     * 命令码: 0xA6
     * @param mode 连接模式
     */
    getBattery: (mode: ConnectionMode = 'usb') =>
      createPacket([
        PACKET_HEADER.SEND,
        getConnectionModeByte(mode),
        COMMAND_CODE.GET_BATTERY,
        0x00 // 无数据
      ]),

    /**
     * 获取回报率
     * 通过读取基础设置获取
     * @param mode 连接模式
     */
    getReportRate: (mode: ConnectionMode = 'usb') =>
      createPacket([
        PACKET_HEADER.SEND,
        getConnectionModeByte(mode),
        COMMAND_CODE.GET_BASIC_SETTINGS,
        0x04, // 数据长度
        0x01, // mode
        0x00, // table_base_id
        0x00, // table_config_id
        0x00 // reserved
      ]),

    /**
     * 获取 DPI
     * 通过读取基础设置获取
     * @param mode 连接模式
     */
    getDPI: (mode: ConnectionMode = 'usb') =>
      createPacket([
        PACKET_HEADER.SEND,
        getConnectionModeByte(mode),
        COMMAND_CODE.GET_BASIC_SETTINGS,
        0x04,
        0x01,
        0x00,
        0x00,
        0x00
      ]),

    /**
     * 获取背光模式 (暂不支持)
     * @param _mode 连接模式
     */
    getBacklight: (_mode: ConnectionMode = 'usb') => [],

    /**
     * 获取按键映射
     * 通过读取基础设置获取
     * @param mode 连接模式
     */
    getButtonMapping: (mode: ConnectionMode = 'usb') =>
      createPacket([
        PACKET_HEADER.SEND,
        getConnectionModeByte(mode),
        COMMAND_CODE.GET_BASIC_SETTINGS,
        0x04,
        0x01,
        0x00,
        0x00,
        0x00
      ]),

    /**
     * 获取滚轮方向
     * 通过读取基础设置获取
     * @param mode 连接模式
     */
    getScrollDirection: (mode: ConnectionMode = 'usb') =>
      createPacket([
        PACKET_HEADER.SEND,
        getConnectionModeByte(mode),
        COMMAND_CODE.GET_BASIC_SETTINGS,
        0x04,
        0x01,
        0x00,
        0x00,
        0x00
      ]),

    // ========================================================================
    // 设置命令
    // ========================================================================

    /**
     * 设置回报率
     * @param rate 回报率 Hz (125/250/500/1000)
     * @param _dpiLevel 当前 DPI 档位 (可选)
     * @param _scrollDirection 滚轮方向 (可选)
     * @param _connectionMode 连接模式 (可选)
     */
    setReportRate: (
      rate: number,
      _dpiLevel?: number,
      _scrollDirection?: number,
      _connectionMode?: ConnectionMode
    ) => {
      const rateValue = HZ_TO_POLLING_RATE[rate] || POLLING_RATE.HZ_1000
      // TODO: 需要先读取当前配置，然后只修改回报率字段
      // 这里返回空数组，实际实现需要在 useWebHID 中处理
      console.log('[Bojuxi] setReportRate:', rate, '-> 0x' + rateValue.toString(16))
      return []
    },

    /**
     * 设置 DPI
     * @param level DPI 档位 (0-6)
     * @param value DPI 值 (50-16000)
     * @param _scrollDirection 滚轮方向 (可选)
     * @param _reportRate 回报率 (可选)
     * @param _connectionMode 连接模式 (可选)
     */
    setDPI: (
      level: number,
      value: number,
      _scrollDirection?: number,
      _reportRate?: number,
      _connectionMode?: ConnectionMode
    ) => {
      // TODO: 需要先读取当前配置，然后只修改 DPI 字段
      console.log('[Bojuxi] setDPI: level=', level, 'value=', value)
      return []
    },

    /**
     * 设置背光模式 (暂不支持)
     * @param _mode 背光模式
     * @param _connectionMode 连接模式 (可选)
     */
    setBacklightMode: (_mode: number, _connectionMode?: ConnectionMode) => [],

    /**
     * 设置背光亮度 (暂不支持)
     * @param _brightness 亮度
     * @param _connectionMode 连接模式 (可选)
     */
    setBacklightBrightness: (_brightness: number, _connectionMode?: ConnectionMode) => [],

    /**
     * 设置背光频率 (暂不支持)
     * @param _frequency 频率
     * @param _connectionMode 连接模式 (可选)
     */
    setBacklightFrequency: (_frequency: number, _connectionMode?: ConnectionMode) => [],

    /**
     * 设置背光颜色 (暂不支持)
     * @param _r 红色
     * @param _g 绿色
     * @param _b 蓝色
     * @param _connectionMode 连接模式 (可选)
     */
    setBacklightColor: (_r: number, _g: number, _b: number, _connectionMode?: ConnectionMode) => [],

    /**
     * 设置滚轮方向
     * @param direction 方向 (0=正向, 1=反向)
     * @param _currentLevel 当前 DPI 档位
     * @param _reportRate 回报率 (可选)
     * @param _connectionMode 连接模式 (可选)
     */
    setScrollDirection: (
      direction: number,
      _currentLevel: number,
      _reportRate?: number,
      _connectionMode?: ConnectionMode
    ) => {
      // TODO: 需要先读取当前配置，然后只修改滚轮方向字段
      console.log('[Bojuxi] setScrollDirection:', direction)
      return []
    },

    /**
     * 设置按键映射
     * @param buttonMappings 按键映射数组，每个按键 4 字节
     * @param _connectionMode 连接模式 (可选)
     */
    setButtonMapping: (buttonMappings: number[][], _connectionMode?: ConnectionMode) => {
      // TODO: 需要先读取当前配置，然后只修改按键映射字段
      console.log('[Bojuxi] setButtonMapping:', buttonMappings)
      return []
    },

    /**
     * 设置宏 (M03)
     * @param macroIndex 宏 ID (0-9)
     * @param macroEvents 宏事件数据
     * @param _connectionMode 连接模式 (可选)
     */
    setMacro: (macroIndex: number, macroEvents: number[], _connectionMode?: ConnectionMode) => {
      // TODO: 实现多帧传输
      console.log('[Bojuxi] setMacro: index=', macroIndex, 'events=', macroEvents.length)
      return []
    },

    /**
     * 删除宏
     * @param macroIndex 宏 ID (0-9)
     * @param _connectionMode 连接模式 (可选)
     */
    deleteMacro: (macroIndex: number, _connectionMode?: ConnectionMode) => {
      // 发送空宏（宏长度=4，循环次数=0）
      console.log('[Bojuxi] deleteMacro:', macroIndex)
      return []
    },

    /**
     * 恢复出厂设置 (M07)
     * 命令码: 0xA7
     * @param mode 连接模式
     */
    factoryReset: (mode: ConnectionMode = 'usb') =>
      createPacket([
        PACKET_HEADER.SEND,
        getConnectionModeByte(mode),
        COMMAND_CODE.FACTORY_RESET,
        0x00 // 无数据
      ])
  },

  parsers: {
    /**
     * 解析设备信息 (M05 响应)
     */
    deviceInfo: (response: Uint8Array) => {
      // 检查响应有效性
      if (response[0] !== PACKET_HEADER.ACK || response[2] !== COMMAND_CODE.GET_DEVICE_INFO) {
        console.warn('[Bojuxi] 无效的设备信息响应')
        return {
          name: 'Unknown',
          model: 'Unknown',
          firmwareVersion: 'Unknown'
        }
      }

      // 解析设备信息
      // Byte 8-9: device_id (uint16, 低字节在前)
      const deviceId = response[8] | (response[9] << 8)

      // Byte 10-11: version (uint16)
      const versionRaw = response[10] | (response[11] << 8)
      const versionMajor = (versionRaw >> 8) & 0xff
      const versionMinor = versionRaw & 0xff
      const firmwareVersion = `V${versionMajor}.${versionMinor}`

      // Byte 12-14: sensor_id (3 bytes)
      const sensorId = `${response[12].toString(16)}${response[13].toString(16)}${response[14].toString(16)}`

      // Byte 15-16: dpi_step
      const dpiStep = response[15] | (response[16] << 8)

      // Byte 17-18: dpi_min
      const dpiMin = response[17] | (response[18] << 8)

      // Byte 19-20: dpi_max
      const dpiMax = response[19] | (response[20] << 8)

      console.log('[Bojuxi] 设备信息:', {
        deviceId,
        firmwareVersion,
        sensorId,
        dpiRange: `${dpiMin}-${dpiMax}`,
        dpiStep
      })

      return {
        name: 'Bojuxi Gaming Mouse',
        model: `Device ID: ${deviceId}, Sensor: ${sensorId}`,
        firmwareVersion
      }
    },

    /**
     * 解析电池信息 (M06 响应)
     */
    battery: (response: Uint8Array) => {
      // 检查响应有效性
      if (response[0] !== PACKET_HEADER.ACK || response[2] !== COMMAND_CODE.GET_BATTERY) {
        console.warn('[Bojuxi] 无效的电池信息响应')
        return 0
      }

      // Byte 4: status
      const status = response[4]
      // Byte 5-6: voltage (uint16, 低字节在前)
      const voltage = response[5] | (response[6] << 8)
      // Byte 7: percentage
      const percentage = response[7]

      const statusNames = ['空闲', '充电中', '充满电', '未稳定']
      console.log('[Bojuxi] 电池信息:', {
        status: statusNames[status] || '未知',
        voltage: `${voltage / 1000}V`,
        percentage: `${percentage}%`
      })

      return percentage
    },

    /**
     * 解析回报率 (从 M02 响应中提取)
     */
    reportRate: (response: Uint8Array) => {
      // 检查响应有效性
      if (response[0] !== PACKET_HEADER.ACK || response[2] !== COMMAND_CODE.GET_BASIC_SETTINGS) {
        return 1000
      }

      // Byte 8: polling_rate
      const rateValue = response[8]
      return POLLING_RATE_TO_HZ[rateValue] || 1000
    },

    /**
     * 解析 DPI (从 M02 响应中提取)
     */
    dpi: (response: Uint8Array) => {
      // 检查响应有效性
      if (response[0] !== PACKET_HEADER.ACK || response[2] !== COMMAND_CODE.GET_BASIC_SETTINGS) {
        return { value: 800, level: 0 }
      }

      // Byte 26: dpi_total_levels
      const totalLevels = response[26]
      // Byte 27: dpi_current_level
      const currentLevel = response[27]

      // DPI 档位数据从 Byte 12 开始，每档 2 字节
      const dpiOffset = 12
      const dpiLow = response[dpiOffset + currentLevel * 2]
      const dpiHigh = response[dpiOffset + currentLevel * 2 + 1]
      const currentValue = dpiLow | (dpiHigh << 8)

      console.log('[Bojuxi] DPI 信息:', {
        currentLevel,
        totalLevels,
        currentValue
      })

      return {
        value: currentValue,
        level: currentLevel
      }
    },

    /**
     * 解析背光模式 (暂不支持)
     */
    backlight: (_response: Uint8Array) => 0,

    /**
     * 解析按键映射 (从 M02 响应中提取)
     */
    buttonMapping: (response: Uint8Array) => {
      // 检查响应有效性
      if (response[0] !== PACKET_HEADER.ACK || response[2] !== COMMAND_CODE.GET_BASIC_SETTINGS) {
        return []
      }

      const buttons: Array<{
        index: number
        code: number
        modifier: number
        extra: number
      }> = []

      // 按键映射从 Byte 28 开始，每个按键 4 字节
      const buttonOffsets = [
        { name: 'left', offset: 28 },
        { name: 'middle', offset: 32 },
        { name: 'right', offset: 36 },
        { name: 'forward', offset: 40 },
        { name: 'backward', offset: 44 },
        { name: 'wheel_up', offset: 48 },
        { name: 'wheel_down', offset: 52 },
        { name: 'dpi', offset: 56 }
      ]

      buttonOffsets.forEach((btn, index) => {
        const offset = btn.offset
        buttons.push({
          index: index + 1,
          code: response[offset] | (response[offset + 1] << 8),
          modifier: response[offset + 2],
          extra: response[offset + 3]
        })
      })

      return buttons
    },

    /**
     * 解析滚轮方向 (从 M02 响应中提取)
     */
    scrollDirection: (response: Uint8Array) => {
      // 检查响应有效性
      if (response[0] !== PACKET_HEADER.ACK || response[2] !== COMMAND_CODE.GET_BASIC_SETTINGS) {
        return 0
      }

      // Byte 9: wheel_direction
      return response[9]
    }
  },

  /**
   * 设备特性配置
   */
  features: {
    /** DPI 范围将从设备信息中动态获取，这里设置默认值 */
    supportedDPI: [400, 800, 1200, 1600, 2400, 3200, 6400],
    /** 最大 7 个 DPI 档位 */
    maxDPILevels: 7,
    /** 支持 4 档回报率 */
    supportedReportRates: [125, 250, 500, 1000],
    /** 8 个可配置按键 */
    buttonCount: 8,
    /** 暂不支持 RGB */
    hasRGB: false,
    /** 无线版本有电池 */
    hasBattery: true,
    /** 支持板载内存 */
    hasOnboardMemory: true,
    /** 支持滚轮方向 */
    hasScrollDirection: true,
    /** 支持宏功能 */
    hasMacro: true,
    /** 最多 10 个宏 */
    maxMacroCount: 10,
    /** 支持双模式 */
    supportsDualMode: true
  }
}

// ============================================================================
// 扩展类型定义
// ============================================================================

/**
 * 博巨矽设备信息扩展
 */
export interface BojuxiDeviceInfo {
  deviceId: number
  firmwareVersion: string
  sensorId: string
  dpiMin: number
  dpiMax: number
  dpiStep: number
  lodMin: number
  lodMax: number
  lodStep: number
}

/**
 * 博巨矽基础设置
 */
export interface BojuxiBasicSettings {
  mode: number
  tableBaseId: number
  tableConfigId: number
  pollingRate: number
  wheelDirection: number
  lod: number
  dpiLevels: number[]
  dpiTotalLevels: number
  dpiCurrentLevel: number
  buttonMappings: number[][]
}

/**
 * 博巨矽电池信息
 */
export interface BojuxiBatteryInfo {
  status: number
  voltage: number
  percentage: number
}

// ============================================================================
// A1 命令构建器
// ============================================================================

/**
 * 构建 A1 基础设置配置命令
 * @param settings 基础设置参数
 * @param mode 连接模式
 * @returns 64 字节命令数据
 */
export function buildSetBasicSettingsCommand(
  settings: BojuxiBasicSettings,
  mode: ConnectionMode = 'usb'
): number[] {
  const packet: number[] = []

  // Byte 0: 包头
  packet.push(PACKET_HEADER.SEND)
  // Byte 1: 连接模式
  packet.push(getConnectionModeByte(mode))
  // Byte 2: 命令码
  packet.push(COMMAND_CODE.SET_BASIC_SETTINGS)
  // Byte 3: 数据长度 (60 字节)
  packet.push(0x3c)

  // Byte 4: mode (bit0:USB, bit1:2.4G)
  packet.push(settings.mode || 0x01)
  // Byte 5: table_base_id
  packet.push(settings.tableBaseId || 0x00)
  // Byte 6: table_config_id
  packet.push(settings.tableConfigId || 0x00)
  // Byte 7: reserved
  packet.push(0x00)

  // Byte 8: polling_rate
  packet.push(settings.pollingRate || POLLING_RATE.HZ_1000)
  // Byte 9: wheel_direction
  packet.push(settings.wheelDirection || 0x00)
  // Byte 10: lod (静默高度，固定 0x02)
  packet.push(settings.lod || 0x02)
  // Byte 11: reserved
  packet.push(0x00)

  // Byte 12-25: DPI 档位 (7 档，每档 2 字节，低字节在前)
  for (let i = 0; i < 7; i++) {
    const dpiValue = settings.dpiLevels[i] || 0
    packet.push(dpiValue & 0xff) // 低字节
    packet.push((dpiValue >> 8) & 0xff) // 高字节
  }

  // Byte 26: dpi_total_levels (0=1档, 6=7档)
  packet.push(settings.dpiTotalLevels)
  // Byte 27: dpi_current_level
  packet.push(settings.dpiCurrentLevel)

  // Byte 28-59: 按键映射 (8 个按键，每个 4 字节)
  const defaultButtons = [
    DEFAULT_BUTTON_CONFIG.LEFT,
    DEFAULT_BUTTON_CONFIG.MIDDLE,
    DEFAULT_BUTTON_CONFIG.RIGHT,
    DEFAULT_BUTTON_CONFIG.FORWARD,
    DEFAULT_BUTTON_CONFIG.BACKWARD,
    DEFAULT_BUTTON_CONFIG.WHEEL_UP,
    DEFAULT_BUTTON_CONFIG.WHEEL_DOWN,
    DEFAULT_BUTTON_CONFIG.DPI
  ]

  for (let i = 0; i < 8; i++) {
    const btnConfig = settings.buttonMappings[i] || defaultButtons[i]
    packet.push(btnConfig[0] || 0x00)
    packet.push(btnConfig[1] || 0x00)
    packet.push(btnConfig[2] || 0x00)
    packet.push(btnConfig[3] || 0x00)
  }

  // Byte 60-63: reserved
  packet.push(0x00, 0x00, 0x00, 0x00)

  return packet
}

/**
 * 从 A2 响应数据解析完整的基础设置
 * @param response A2 响应数据
 * @returns 基础设置对象
 */
export function parseBasicSettingsFromResponse(response: Uint8Array): BojuxiBasicSettings {
  // 检查响应有效性
  if (response[0] !== PACKET_HEADER.ACK || response[2] !== COMMAND_CODE.GET_BASIC_SETTINGS) {
    console.warn('[Bojuxi] 无效的基础设置响应，使用默认值')
    return getDefaultBasicSettings()
  }

  // 解析各字段
  const mode = response[4]
  const tableBaseId = response[5]
  const tableConfigId = response[6]
  const pollingRate = response[8]
  const wheelDirection = response[9]
  const lod = response[10]

  // 解析 DPI 档位
  const dpiLevels: number[] = []
  for (let i = 0; i < 7; i++) {
    const offset = 12 + i * 2
    const dpiValue = response[offset] | (response[offset + 1] << 8)
    dpiLevels.push(dpiValue)
  }

  const dpiTotalLevels = response[26]
  const dpiCurrentLevel = response[27]

  // 解析按键映射
  const buttonMappings: number[][] = []
  for (let i = 0; i < 8; i++) {
    const offset = 28 + i * 4
    buttonMappings.push([
      response[offset],
      response[offset + 1],
      response[offset + 2],
      response[offset + 3]
    ])
  }

  return {
    mode,
    tableBaseId,
    tableConfigId,
    pollingRate,
    wheelDirection,
    lod,
    dpiLevels,
    dpiTotalLevels,
    dpiCurrentLevel,
    buttonMappings
  }
}

/**
 * 获取默认基础设置
 */
export function getDefaultBasicSettings(): BojuxiBasicSettings {
  return {
    mode: 0x01,
    tableBaseId: 0x00,
    tableConfigId: 0x00,
    pollingRate: POLLING_RATE.HZ_1000,
    wheelDirection: 0x00,
    lod: 0x02,
    dpiLevels: [800, 1600, 3200, 0, 0, 0, 0],
    dpiTotalLevels: 2, // 0=1档, 2=3档
    dpiCurrentLevel: 0,
    buttonMappings: [
      [...DEFAULT_BUTTON_CONFIG.LEFT],
      [...DEFAULT_BUTTON_CONFIG.MIDDLE],
      [...DEFAULT_BUTTON_CONFIG.RIGHT],
      [...DEFAULT_BUTTON_CONFIG.FORWARD],
      [...DEFAULT_BUTTON_CONFIG.BACKWARD],
      [...DEFAULT_BUTTON_CONFIG.WHEEL_UP],
      [...DEFAULT_BUTTON_CONFIG.WHEEL_DOWN],
      [...DEFAULT_BUTTON_CONFIG.DPI]
    ]
  }
}
