import { DeviceProtocol } from './index'

/**
 * 银火狐pro v6+ 设备协议
 */
export const yhhProtocol: DeviceProtocol = {
  name: 'USB MOUSE',

  identify: (device: HIDDevice) => {
    const productName = device.productName?.toLowerCase() || ''
    return productName.includes('USB MOUSE')
  },

  commands: {
    getDeviceInfo: [0x01, 0x01],
    getBattery: [0x03, 0x01],
    getReportRate: [0x04, 0x01],
    getCPI: [0x05, 0x03],
    getBacklight: [0x06, 0x01],

    setReportRate: (rate: number) => {
      const rateMap: Record<number, number> = {
        125: 0x01,
        250: 0x02,
        500: 0x04,
        1000: 0x08
      }
      return [0x04, 0x02, rateMap[rate] || 0x08]
    },

    setCPI: (level: number, value: number) => {
      const levelIndex = level - 1
      const razerCpiValue = value / 100
      return [0x05, 0x04, levelIndex, razerCpiValue]
    },

    setBacklightMode: (mode: number) => [0x06, 0x02, mode],

    setBacklightBrightness: (brightness: number) => {
      const brightnessValue = Math.round((brightness / 100) * 255)
      return [0x06, 0x03, brightnessValue]
    },

    setBacklightFrequency: (frequency: number) => [0x06, 0x04, frequency],

    setBacklightColor: (r: number, g: number, b: number) => [0x06, 0x05, r, g, b, 0x00]
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

    battery: (response: Uint8Array) => response[1],

    reportRate: (response: Uint8Array) => {
      const rateMap: Record<number, number> = {
        0x01: 125,
        0x02: 250,
        0x04: 500,
        0x08: 1000
      }
      return rateMap[response[0]] || 1000
    },

    cpi: (response: Uint8Array) => response[1] * 100,

    backlight: (response: Uint8Array) => response[0]
  }
}
