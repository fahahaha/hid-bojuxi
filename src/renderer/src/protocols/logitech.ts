import { DeviceProtocol } from './index'

/**
 * Logitech 设备协议
 */
export const logitechProtocol: DeviceProtocol = {
  name: 'Logitech',

  identify: (device: HIDDevice) => {
    const productName = device.productName?.toLowerCase() || ''
    return productName.includes('logitech')
  },

  commands: {
    getDeviceInfo: [0x01, 0x01],
    getBattery: [0x02, 0x01],
    getReportRate: [0x03, 0x01],
    getCPI: [0x03, 0x03],
    getBacklight: [0x04, 0x01],

    setReportRate: (rate: number) => {
      const rateMap: Record<number, number> = {
        125: 0x08,
        250: 0x04,
        500: 0x02,
        1000: 0x01
      }
      return [0x03, 0x02, rateMap[rate] || 0x01]
    },

    setCPI: (level: number, value: number) => {
      const levelIndex = level - 1
      const valueHigh = (value >> 8) & 0xff
      const valueLow = value & 0xff
      return [0x03, 0x04, levelIndex, valueHigh, valueLow]
    },

    setBacklightMode: (mode: number) => [0x04, 0x02, mode],

    setBacklightBrightness: (brightness: number) => {
      const brightnessValue = Math.round((brightness / 100) * 255)
      return [0x04, 0x03, brightnessValue]
    },

    setBacklightFrequency: (frequency: number) => [0x04, 0x04, frequency],

    setBacklightColor: (r: number, g: number, b: number) => [0x04, 0x05, r, g, b]
  },

  parsers: {
    deviceInfo: (response: Uint8Array) => {
      const name =
        String.fromCharCode(...Array.from(response.slice(0, 8))).replace(/\0/g, '') || '未知设备'
      const model =
        String.fromCharCode(...Array.from(response.slice(8, 12))).replace(/\0/g, '') || '未知型号'
      const firmwareVersion = `${response[12]}.${response[13]}.${response[14]}`
      return { name, model, firmwareVersion }
    },

    battery: (response: Uint8Array) => response[0],

    reportRate: (response: Uint8Array) => {
      const rateMap: Record<number, number> = {
        0x08: 125,
        0x04: 250,
        0x02: 500,
        0x01: 1000
      }
      return rateMap[response[0]] || 1000
    },

    cpi: (response: Uint8Array) => (response[1] << 8) | response[2],

    backlight: (response: Uint8Array) => response[0]
  }
}
