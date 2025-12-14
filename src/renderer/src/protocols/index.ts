/**
 * 设备协议接口定义
 * 每个设备品牌需要实现此接口
 */
export interface DeviceProtocol {
  /** 协议名称 */
  name: string

  /** 设备识别函数 */
  identify: (device: HIDDevice) => boolean

  /** 命令定义 */
  commands: {
    /** 获取设备信息命令 */
    getDeviceInfo: number[]
    /** 获取电池状态命令 */
    getBattery: number[]
    /** 获取回报率命令 */
    getReportRate: number[]
    /** 获取 DPI 命令 */
    getDPI: number[]
    /** 获取背光模式命令 */
    getBacklight: number[]
    /** 获取按键映射命令 */
    getButtonMapping: number[]
    /** 获取 滚轮 命令 */
    getScrollDirection?: number[]

    /** 设置回报率 */
    setReportRate: (rate: number) => number[]
    /** 设置 DPI */
    setDPI: (level: number, value: number, scrollDirection?: number) => number[]
    /** 设置背光模式 */
    setBacklightMode: (mode: number) => number[]
    /** 设置背光亮度 */
    setBacklightBrightness: (brightness: number) => number[]
    /** 设置背光频率 */
    setBacklightFrequency: (frequency: number) => number[]
    /** 设置背光颜色 */
    setBacklightColor: (r: number, g: number, b: number) => number[]
    /** 设置滚轮方向 */
    setScrollDirection?: (direction: number, currentLevel: number) => number[]
    setButtonMapping?:(buttonMappings: number[][]) => number[]
  }

  /** 响应解析器 */
  parsers: {
    /** 解析设备信息 */
    deviceInfo: (response: Uint8Array) => {
      name: string
      model: string
      firmwareVersion: string
    }
    /** 解析电池电量 */
    battery: (response: Uint8Array) => number
    /** 解析回报率 */
    reportRate: (response: Uint8Array) => number
    /** 解析 DPI (返回当前 DPI 值和档位) */
    dpi: (response: Uint8Array) => {
      value: number
      level: number
    }
    /** 解析背光模式 */
    backlight: (response: Uint8Array) => number
    /** 解析按键映射 */
    buttonMapping: (response: Uint8Array) => Array<{
      index: number
      code: number
      modifier: number
      extra: number
    }>
    scrollDirection?: (response: Uint8Array) => number
  }

  /** 设备特性配置 (可选) */
  features?: {
    /** 支持的 DPI 档位列表 */
    supportedDPI?: number[]
    /** 最大 DPI 档位数 */
    maxDPILevels?: number
    /** 支持的回报率列表 */
    supportedReportRates?: number[]
    /** 按键数量 */
    buttonCount?: number
    /** 是否支持 RGB 背光 */
    hasRGB?: boolean
    /** 是否有电池 */
    hasBattery?: boolean
    /** 是否支持板载内存 */
    hasOnboardMemory?: boolean
    /** 是否支持的滚轮方向 */
    hasScrollDirection?: boolean
  }
}
