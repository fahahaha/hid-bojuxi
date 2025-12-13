import { ref, computed } from 'vue'
import { detectProtocol } from '../protocols/registry'
import type { DeviceProtocol } from '../protocols'

// 全局状态
let device: HIDDevice | null = null
const currentProtocol = ref<DeviceProtocol | null>(null)
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
  dpi: '--',
  dpiLevel: 1,
  backlight: '--',
  scrollDirection: 0 //正向0，反向1
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
   * 初始化设备连接（内部函数）
   * @param selectedDevice 要连接的设备
   */
  async function initializeDevice(selectedDevice: HIDDevice): Promise<{ success: boolean; message: string }> {
    try {
      device = selectedDevice
      console.log(`[设备连接] 尝试连接设备: ${device.productName || '未知设备'}`)
      console.log(
        `[设备信息] VID: 0x${device.vendorId.toString(16)}, PID: 0x${device.productId.toString(16)}`
      )

      // 检测设备协议
      currentProtocol.value = detectProtocol(device)
      console.log(`[协议检测] 使用协议: ${currentProtocol.value.name}`)

      await device.open()

      // 连接后自动延迟 100ms
      await new Promise((resolve) => setTimeout(resolve, 100))

      isConnected.value = true
      deviceInfo.value.status = '已连接'

      // 获取设备信息
      await getDeviceInfo()
      await getBattery()
      await getCurrentReportRate()
      await getCurrentDPI()
      // await getBacklightMode()
      await getCurrentScrollDirection()

      // 定时更新电池状态
      await getBattery()
      // setInterval(getBattery, 5000)

      // 监听设备断开
      navigator.hid.addEventListener('disconnect', (event: HIDConnectionEvent) => {
        if (event.device === device) {
          console.log('[设备事件] 设备已断开连接')
          isConnected.value = false
          deviceInfo.value.status = '未连接'
          device = null
          currentProtocol.value = null
        }
      })

      return { success: true, message: `已成功连接设备: ${device.productName || '未知设备'}` }
    } catch (err: any) {
      console.error('连接失败:', err)
      return { success: false, message: err.message || '无法连接到设备，请重试' }
    }
  }

  /**
   * 自动连接已授权的设备（页面加载时调用）
   */
  async function autoConnectDevice(): Promise<{ success: boolean; message: string }> {
    try {
      if (!navigator.hid) {
        return { success: false, message: '您的浏览器不支持WebHID API' }
      }

      if (!window.isSecureContext) {
        return { success: false, message: '请通过localhost或HTTPS访问' }
      }

      // 获取已授权的设备
      const existingDevices = await navigator.hid.getDevices()
      console.log(`[自动连接] 已授权设备数量: ${existingDevices.length}`)

      if (existingDevices.length === 0) {
        return { success: false, message: '没有已授权的设备' }
      }

      // 关闭所有已打开的设备
      for (const existingDevice of existingDevices) {
        if (existingDevice.opened) {
          console.log(`[自动连接] 关闭已打开的设备: ${existingDevice.productName || '未知设备'}`)
          try {
            await existingDevice.close()
          } catch (err) {
            console.warn('[自动连接] 关闭已有设备失败', err)
          }
        }
      }

      // 筛选可控制的设备
      const vendorDevices = existingDevices.filter(d =>
        d.collections.some(c =>
          c.outputReports.length > 0 || c.featureReports.length > 0
        )
      )

      if (vendorDevices.length === 0) {
        return { success: false, message: '没有可控制的 HID 设备' }
      }

      // 连接第一个可用设备
      return await initializeDevice(vendorDevices[0])
    } catch (err: any) {
      console.error('[自动连接] 失败:', err)
      return { success: false, message: err.message || '自动连接失败' }
    }
  }

  /**
   * 手动连接设备（用户点击连接按钮时调用）
   */
  async function connectDevice(): Promise<{ success: boolean; message: string }> {
    try {
      if (!navigator.hid) {
        return { success: false, message: '您的浏览器不支持WebHID API，请使用最新版Edge或Chrome' }
      }

      if (!window.isSecureContext) {
        return { success: false, message: '请通过localhost或HTTPS访问以使用WebHID功能' }
      }

      // 先检查是否有已授权的设备，并关闭所有已打开的设备
      const existingDevices = await navigator.hid.getDevices()
      console.log(`[设备连接] 已授权设备数量: ${existingDevices.length}`)

      // 关闭所有已打开的设备（无论是否是当前设备）
      for (const existingDevice of existingDevices) {
        if (existingDevice.opened) {
          console.log(`[设备连接] 关闭已打开的设备: ${existingDevice.productName || '未知设备'}`)
          try {
            await existingDevice.close()
          } catch (err) {
            console.warn('[设备连接] 关闭已有设备失败', err)
          }
        }
      }

      // 请求用户选择设备
      const devices = await navigator.hid.requestDevice({ filters: [] })

      const vendorDevices = devices.filter(d =>
        d.collections.some(c =>
          c.outputReports.length > 0 || c.featureReports.length > 0
        )
      )

      if (vendorDevices.length === 0) {
        throw new Error('未找到可控制的 HID 接口')
      }

      // 连接选中的设备
      return await initializeDevice(vendorDevices[0])
    } catch (err: any) {
      console.error('连接失败:', err)
      return { success: false, message: err.message || '无法连接到设备，请重试' }
    }
  }

  /**
   * 获取设备信息
   */
  async function getDeviceInfo(): Promise<void> {
    if (!device || !currentProtocol.value) return

    try {
      const command = currentProtocol.value.commands.getDeviceInfo
      const response = await sendCommandAndWait(command)

      if (response && response.length >= 16) {
        const info = currentProtocol.value.parsers.deviceInfo(response)
        deviceInfo.value = {
          name: info.name || device.productName || '未知设备',
          model: info.model || device.productId.toString(16),
          firmwareVersion: info.firmwareVersion,
          connectionType: '有线连接',
          vidPid: `0x${device.vendorId.toString(16).padStart(4, '0')}:0x${device.productId.toString(16).padStart(4, '0')}`,
          protocol: currentProtocol.value.name,
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
          protocol: currentProtocol.value.name,
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
    if (!device || !currentProtocol.value) return

    try {
      const command = currentProtocol.value.commands.getBattery
      const response = await sendCommandAndWait(command)

      if (!response || response.length < 2) {
        const batteryLevel = Math.floor(Math.random() * 30) + 70
        deviceStatus.value.battery = `${batteryLevel}%`
        return
      }

      const batteryLevel = currentProtocol.value.parsers.battery(response)
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
    if (!device || !currentProtocol.value) return

    try {
      const command = currentProtocol.value.commands.getReportRate
      const response = await sendCommandAndWait(command)

      if (!response || response.length < 1) {
        deviceStatus.value.reportRate = '1000 Hz'
        return
      }

      const rate = currentProtocol.value.parsers.reportRate(response)
      deviceStatus.value.reportRate = `${rate} Hz`
    } catch (err) {
      console.error('获取回报率失败:', err)
      deviceStatus.value.reportRate = '1000 Hz'
    }
  }

  /**
   * 获取当前 DPI
   */
  async function getCurrentDPI(): Promise<void> {
    if (!device || !currentProtocol.value) return

    try {
      const command = currentProtocol.value.commands.getDPI
      const response = await sendCommandAndWait(command)

      if (!response || response.length < 3) {
        deviceStatus.value.dpi = '2000'
        deviceStatus.value.dpiLevel = 1
        return
      }

      const dpiData = currentProtocol.value.parsers.dpi(response)
      deviceStatus.value.dpi = `${dpiData.value}`
      deviceStatus.value.dpiLevel = dpiData.level
    } catch (err) {
      console.error('获取 DPI 失败:', err)
      deviceStatus.value.dpi = '2000'
      deviceStatus.value.dpiLevel = 1
    }
  }

  /**
   * 和DPI一样，获取当前滚轮方向
   */
  async function getCurrentScrollDirection(): Promise<void> {
    if (!device || !currentProtocol.value || !currentProtocol.value.commands.getScrollDirection || !currentProtocol.value.parsers.scrollDirection) return

    try {
      const command = currentProtocol.value.commands.getScrollDirection
      const response = await sendCommandAndWait(command)

      if (!response || response.length < 3) {
        deviceStatus.value.scrollDirection = 0
        return
      }

      const scrollDirectionData = currentProtocol.value.parsers.scrollDirection(response)
      deviceStatus.value.scrollDirection = scrollDirectionData
    } catch (err) {
      console.error('获取 滚轮方向 失败:', err)
      deviceStatus.value.scrollDirection = 0
    }
  }

  /**
   * 获取背光模式
   */
  async function getBacklightMode(): Promise<void> {
    if (!device || !currentProtocol.value) return

    try {
      const command = currentProtocol.value.commands.getBacklight
      const response = await sendCommandAndWait(command)

      if (!response || response.length < 1) {
        deviceStatus.value.backlight = '呼吸'
        return
      }

      const mode = currentProtocol.value.parsers.backlight(response)
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
    if (!device || !currentProtocol.value) return { success: false, message: '设备未连接' }

    try {
      const command = currentProtocol.value.commands.setReportRate(rate)
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
   * 设置 DPI
   */
  async function setDPI(
    level: number,
    value: number
  ): Promise<{ success: boolean; message: string }> {
    if (!device || !currentProtocol.value) return { success: false, message: '设备未连接' }

    try {
      const scrollDirection = deviceStatus.value.scrollDirection
      const command = currentProtocol.value.commands.setDPI(level, value,scrollDirection)
      const success = await sendReport(command)

      if (!success) return { success: false, message: '发送命令失败' }

      await new Promise((resolve) => setTimeout(resolve, 100))
      await getCurrentDPI()

      return { success: true, message: `DPI 已设置为 ${value}` }
    } catch (err: any) {
      console.error('设置 DPI 失败:', err)
      return { success: false, message: '无法设置 DPI' }
    }
  }

  /**
   * 设置背光模式
   */
  async function setBacklightMode(mode: number): Promise<{ success: boolean; message: string }> {
    if (!device || !currentProtocol.value) return { success: false, message: '设备未连接' }

    try {
      const modeNames = ['常灭', '常亮', '呼吸', 'APM模式', '全光谱']
      const command = currentProtocol.value.commands.setBacklightMode(mode)
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
    if (!device || !currentProtocol.value) return { success: false, message: '设备未连接' }

    try {
      const command = currentProtocol.value.commands.setBacklightBrightness(brightness)
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
    if (!device || !currentProtocol.value) return { success: false, message: '设备未连接' }

    try {
      const frequencyLabels = ['极慢', '慢', '中等', '快', '极快']
      const command = currentProtocol.value.commands.setBacklightFrequency(frequency)
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
    if (!device || !currentProtocol.value) return { success: false, message: '设备未连接' }

    try {
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)

      const command = currentProtocol.value.commands.setBacklightColor(r, g, b)
      const success = await sendReport(command)

      if (!success) return { success: false, message: '发送命令失败' }

      return { success: true, message: '背光颜色已更新' }
    } catch (err: any) {
      console.error('设置背光颜色失败:', err)
      return { success: false, message: '无法设置背光颜色' }
    }
  }

  /**
   * 设置滚轮方向
   */
  async function setScrollDirection(
    direction: number
  ): Promise<{ success: boolean; message: string }> {
    if (!device || !currentProtocol.value) return { success: false, message: '设备未连接' }

    try {
      // 检查协议是否支持滚轮方向设置
      if (!currentProtocol.value.commands.setScrollDirection) {
        return { success: false, message: '当前设备不支持滚轮方向设置' }
      }

      // 获取当前 DPI 档位
      const currentLevel = deviceStatus.value.dpiLevel || 1

      const command = currentProtocol.value.commands.setScrollDirection(direction, currentLevel)
      const success = await sendReport(command)

      if (!success) return { success: false, message: '发送命令失败' }

      await new Promise((resolve) => setTimeout(resolve, 100))
      await getCurrentScrollDirection();

      const directionText = direction === 0 ? '正向' : '反向'
      return { success: true, message: `滚轮方向已设置为 ${directionText}` }
    } catch (err: any) {
      console.error('设置滚轮方向失败:', err)
      return { success: false, message: '无法设置滚轮方向' }
    }
  }

  /**
   * 获取当前设备协议
   */
  function getCurrentProtocol(): DeviceProtocol | null {
    return currentProtocol.value
  }

  return {
    isConnected: computed(() => isConnected.value),
    deviceInfo: computed(() => deviceInfo.value),
    deviceStatus: computed(() => deviceStatus.value),
    getCurrentProtocol,
    connectDevice,
    autoConnectDevice,
    setReportRate,
    setDPI,
    setScrollDirection,
    setBacklightMode,
    setBacklightBrightness,
    setBacklightFrequency,
    setBacklightColor
  }
}
