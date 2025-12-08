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
    /** 获取 CPI 命令 */
    getCPI: number[]
    /** 获取背光模式命令 */
    getBacklight: number[]

    /** 设置回报率 */
    setReportRate: (rate: number) => number[]
    /** 设置 CPI */
    setCPI: (level: number, value: number) => number[]
    /** 设置背光模式 */
    setBacklightMode: (mode: number) => number[]
    /** 设置背光亮度 */
    setBacklightBrightness: (brightness: number) => number[]
    /** 设置背光频率 */
    setBacklightFrequency: (frequency: number) => number[]
    /** 设置背光颜色 */
    setBacklightColor: (r: number, g: number, b: number) => number[]
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
    /** 解析 CPI */
    cpi: (response: Uint8Array) => number
    /** 解析背光模式 */
    backlight: (response: Uint8Array) => number
  }
}
