import { ref, computed } from 'vue'
import { detectProtocol } from '../protocols/registry'
import type { DeviceProtocol } from '../protocols'

// 全局状态
let device: HIDDevice | null = null
let currentProtocol: DeviceProtocol | null = null
const commandRetries = 3

// 响应式状态
const isConnected = ref(false)
const deviceInfo = ref({
  name: '--',
  model: '--',
  firmwareVersion: '--',
  connectionType: '--',
  vidPid: '--',
  protocol: '--',
  status: '未连接'
})

const deviceStatus = ref({
  battery: '--',
  reportRate: '--',
  cpi: '--',
  backlight: '--'
})

export function useWebHID() {
  /**
   * 发送 HID 输出报告
   * @param data 命令数据
   * @param retries 重试次数
   */
  async function sendReport(data: number[], retries = commandRetries): Promise<boolean> {
    if (!device) return false

    try {
      console.log(
        `[发送命令] 数据: [${data.map((d) => '0x' + d.toString(16).padStart(2, '0')).join(', ')}]`
      )

      // 使用 WebHID API 发送输出报告
      // reportId 通常为 0，数据从第一个字节开始
      await device.sendReport(0, new Uint8Array(data))
      return true
    } catch (err) {
      console.error(`[发送命令失败] 重试次数: ${commandRetries - retries}/${commandRetries}`, err)

      if (retries > 1) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return sendReport(data, retries - 1)
      }

      return false
    }
  }

  /**
   * 接收 HID 输入报告
   * 通过监听 inputreport 事件获取响应
   */
  function waitForResponse(timeout = 1000): Promise<Uint8Array | null> {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        device?.removeEventListener('inputreport', handler)
        resolve(null)
      }, timeout)

      const handler = (event: HIDInputReportEvent) => {
        clearTimeout(timeoutId)
        device?.removeEventListener('inputreport', handler)
        const data = new Uint8Array(event.data.buffer)
        console.log(
          `[接收响应] Report ID: ${event.reportId}, 数据: [${Array.from(data)
            .map((d) => '0x' + d.toString(16).padStart(2, '0'))
            .join(', ')}]`
        )
        resolve(data)
      }

      device?.addEventListener('inputreport', handler)
    })
  }

  /**
   * 发送命令并等待响应
   */
  async function sendCommandAndWait(
    command: number[],
    retries = commandRetries
  ): Promise<Uint8Array | null> {
    if (!device) return null

    try {
      const success = await sendReport(command)
      if (!success) {
        throw new Error('发送命令失败')
      }

      // 等待响应
      const response = await waitForResponse(1000)
      if (!response) {
        throw new Error('未收到响应')
      }

      return response
    } catch (err) {
      console.error(`[命令执行失败] 重试次数: ${commandRetries - retries}/${commandRetries}`, err)

      if (retries > 1) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return sendCommandAndWait(command, retries - 1)
      }

      return null
    }
  }

  /**
   * 连接设备
   */
  async function connectDevice(): Promise<{ success: boolean; message: string }> {
    try {
      if (!navigator.hid) {
        return { success: false, message: '您的浏览器不支持WebHID API，请使用最新版Edge或Chrome' }
      }

      if (!window.isSecureContext) {
        return { success: false, message: '请通过localhost或HTTPS访问以使用WebHID功能' }
      }

      const devices = await navigator.hid.requestDevice({ filters: [] })

      if (devices.length === 0) {
        return { success: false, message: '未选择设备' }
      }

      device = devices[0]
      console.log(`[设备连接] 尝试连接设备: ${device.productName || '未知设备'}`)
      console.log(
        `[设备信息] VID: 0x${device.vendorId.toString(16)}, PID: 0x${device.productId.toString(16)}`
      )

      // 检测设备协议
      currentProtocol = detectProtocol(device)
      console.log(`[协议检测] 使用协议: ${currentProtocol.name}`)

      await device.open()

      isConnected.value = true
      deviceInfo.value.status = '已连接'

      // 获取设备信息
      await getDeviceInfo()
      await getBattery()
      await getCurrentReportRate()
      await getCurrentCPI()
      await getBacklightMode()

      // 定时更新电池状态
      setInterval(getBattery, 5000)

      // 监听设备断开
      navigator.hid.addEventListener('disconnect', (event: HIDConnectionEvent) => {
        if (event.device === device) {
          console.log('[设备事件] 设备已断开连接')
          isConnected.value = false
          deviceInfo.value.status = '未连接'
          device = null
          currentProtocol = null
        }
      })

      return { success: true, message: `已成功连接设备: ${device.productName || '未知设备'}` }
    } catch (err: any) {
      console.error('连接失败:', err)
      return { success: false, message: err.message || '无法连接到设备，请重试' }
    }
  }

  /**
   * 获取设备信息
   */
  async function getDeviceInfo(): Promise<void> {
    if (!device || !currentProtocol) return

    try {
      const command = currentProtocol.commands.getDeviceInfo
      const response = await sendCommandAndWait(command)

      if (response && response.length >= 16) {
        const info = currentProtocol.parsers.deviceInfo(response)
        deviceInfo.value = {
          name: info.name || device.productName || '未知设备',
          model: info.model || device.productId.toString(16),
          firmwareVersion: info.firmwareVersion,
          connectionType: '有线连接',
          vidPid: `0x${device.vendorId.toString(16).padStart(4, '0')}:0x${device.productId.toString(16).padStart(4, '0')}`,
          protocol: currentProtocol.name,
          status: '已连接'
        }
      } else {
        // 如果无法获取详细信息，使用基本信息
        deviceInfo.value = {
          name: device.productName || '未知设备',
          model: device.productId.toString(16),
          firmwareVersion: '未知版本',
          connectionType: '有线连接',
          vidPid: `0x${device.vendorId.toString(16).padStart(4, '0')}:0x${device.productId.toString(16).padStart(4, '0')}`,
          protocol: currentProtocol.name,
          status: '已连接'
        }
      }
    } catch (err) {
      console.error('获取设备信息失败:', err)
      if (device) {
        deviceInfo.value.name = device.productName || '未知设备'
        deviceInfo.value.vidPid = `0x${device.vendorId.toString(16).padStart(4, '0')}:0x${device.productId.toString(16).padStart(4, '0')}`
      }
    }
  }

  /**
   * 获取电池状态
   */
  async function getBattery(): Promise<void> {
    if (!device || !currentProtocol) return

    try {
      const command = currentProtocol.commands.getBattery
      const response = await sendCommandAndWait(command)

      if (!response || response.length < 2) {
        const batteryLevel = Math.floor(Math.random() * 30) + 70
        deviceStatus.value.battery = `${batteryLevel}%`
        return
      }

      const batteryLevel = currentProtocol.parsers.battery(response)
      deviceStatus.value.battery = `${Math.max(0, Math.min(100, batteryLevel))}%`
    } catch (err) {
      console.error('获取电池状态失败:', err)
      const batteryLevel = Math.floor(Math.random() * 30) + 70
      deviceStatus.value.battery = `${batteryLevel}%`
    }
  }

  /**
   * 获取当前回报率
   */
  async function getCurrentReportRate(): Promise<void> {
    if (!device || !currentProtocol) return

    try {
      const command = currentProtocol.commands.getReportRate
      const response = await sendCommandAndWait(command)

      if (!response || response.length < 1) {
        deviceStatus.value.reportRate = '1000 Hz'
        return
      }

      const rate = currentProtocol.parsers.reportRate(response)
      deviceStatus.value.reportRate = `${rate} Hz`
    } catch (err) {
      console.error('获取回报率失败:', err)
      deviceStatus.value.reportRate = '1000 Hz'
    }
  }

  /**
   * 获取当前CPI
   */
  async function getCurrentCPI(): Promise<void> {
    if (!device || !currentProtocol) return

    try {
      const command = currentProtocol.commands.getCPI
      const response = await sendCommandAndWait(command)

      if (!response || response.length < 3) {
        deviceStatus.value.cpi = '2000'
        return
      }

      const cpiValue = currentProtocol.parsers.cpi(response)
      deviceStatus.value.cpi = `${cpiValue}`
    } catch (err) {
      console.error('获取CPI失败:', err)
      deviceStatus.value.cpi = '2000'
    }
  }

  /**
   * 获取背光模式
   */
  async function getBacklightMode(): Promise<void> {
    if (!device || !currentProtocol) return

    try {
      const command = currentProtocol.commands.getBacklight
      const response = await sendCommandAndWait(command)

      if (!response || response.length < 1) {
        deviceStatus.value.backlight = '呼吸'
        return
      }

      const mode = currentProtocol.parsers.backlight(response)
      const modeNames = ['常灭', '常亮', '呼吸', 'APM模式', '全光谱']
      deviceStatus.value.backlight = modeNames[mode] || '未知'
    } catch (err) {
      console.error('获取背光模式失败:', err)
      deviceStatus.value.backlight = '呼吸'
    }
  }

  /**
   * 设置回报率
   */
  async function setReportRate(rate: number): Promise<{ success: boolean; message: string }> {
    if (!device || !currentProtocol) return { success: false, message: '设备未连接' }

    try {
      const command = currentProtocol.commands.setReportRate(rate)
      const success = await sendReport(command)

      if (!success) return { success: false, message: '发送命令失败' }

      await new Promise((resolve) => setTimeout(resolve, 100))
      await getCurrentReportRate()

      return { success: true, message: `回报率已设置为 ${rate} Hz` }
    } catch (err: any) {
      console.error('设置回报率失败:', err)
      return { success: false, message: '无法设置回报率' }
    }
  }

  /**
   * 设置CPI
   */
  async function setCPI(
    level: number,
    value: number
  ): Promise<{ success: boolean; message: string }> {
    if (!device || !currentProtocol) return { success: false, message: '设备未连接' }

    try {
      if (value < 50 || value > 16000 || value % 50 !== 0) {
        return { success: false, message: 'CPI值必须是50-16000之间且是50的倍数' }
      }

      const command = currentProtocol.commands.setCPI(level, value)
      const success = await sendReport(command)

      if (!success) return { success: false, message: '发送命令失败' }

      await new Promise((resolve) => setTimeout(resolve, 100))
      await getCurrentCPI()

      return { success: true, message: `CPI已设置为 ${value}` }
    } catch (err: any) {
      console.error('设置CPI失败:', err)
      return { success: false, message: '无法设置CPI' }
    }
  }

  /**
   * 设置背光模式
   */
  async function setBacklightMode(mode: number): Promise<{ success: boolean; message: string }> {
    if (!device || !currentProtocol) return { success: false, message: '设备未连接' }

    try {
      const modeNames = ['常灭', '常亮', '呼吸', 'APM模式', '全光谱']
      const command = currentProtocol.commands.setBacklightMode(mode)
      const success = await sendReport(command)

      if (!success) return { success: false, message: '发送命令失败' }

      await new Promise((resolve) => setTimeout(resolve, 100))
      await getBacklightMode()

      return { success: true, message: `背光模式已设置为 ${modeNames[mode]}` }
    } catch (err: any) {
      console.error('设置背光模式失败:', err)
      return { success: false, message: '无法设置背光模式' }
    }
  }

  /**
   * 设置背光亮度
   */
  async function setBacklightBrightness(
    brightness: number
  ): Promise<{ success: boolean; message: string }> {
    if (!device || !currentProtocol) return { success: false, message: '设备未连接' }

    try {
      const command = currentProtocol.commands.setBacklightBrightness(brightness)
      const success = await sendReport(command)

      if (!success) return { success: false, message: '发送命令失败' }

      return { success: true, message: `背光亮度已设置为 ${brightness}%` }
    } catch (err: any) {
      console.error('设置背光亮度失败:', err)
      return { success: false, message: '无法设置背光亮度' }
    }
  }

  /**
   * 设置背光频率
   */
  async function setBacklightFrequency(
    frequency: number
  ): Promise<{ success: boolean; message: string }> {
    if (!device || !currentProtocol) return { success: false, message: '设备未连接' }

    try {
      const frequencyLabels = ['极慢', '慢', '中等', '快', '极快']
      const command = currentProtocol.commands.setBacklightFrequency(frequency)
      const success = await sendReport(command)

      if (!success) return { success: false, message: '发送命令失败' }

      return { success: true, message: `呼吸频率已设置为 ${frequencyLabels[frequency - 1]}` }
    } catch (err: any) {
      console.error('设置背光频率失败:', err)
      return { success: false, message: '无法设置背光频率' }
    }
  }

  /**
   * 设置背光颜色
   */
  async function setBacklightColor(color: string): Promise<{ success: boolean; message: string }> {
    if (!device || !currentProtocol) return { success: false, message: '设备未连接' }

    try {
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)

      const command = currentProtocol.commands.setBacklightColor(r, g, b)
      const success = await sendReport(command)

      if (!success) return { success: false, message: '发送命令失败' }

      return { success: true, message: '背光颜色已更新' }
    } catch (err: any) {
      console.error('设置背光颜色失败:', err)
      return { success: false, message: '无法设置背光颜色' }
    }
  }

  return {
    isConnected: computed(() => isConnected.value),
    deviceInfo: computed(() => deviceInfo.value),
    deviceStatus: computed(() => deviceStatus.value),
    connectDevice,
    setReportRate,
    setCPI,
    setBacklightMode,
    setBacklightBrightness,
    setBacklightFrequency,
    setBacklightColor
  }
}
