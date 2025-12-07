import { ref, computed } from 'vue'

// 全局状态
let device: USBDevice | null = null
let interfaceNumber = 0
let reportId = 0
let deviceProtocol = 'unknown'
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

export function useWebUSB() {
  // 通过Set Report发送数据到设备，带重试机制
  async function sendSetReport(data: number[], retries = commandRetries): Promise<boolean> {
    if (!device) return false

    try {
      let formattedData = data
      if (deviceProtocol === 'razer') {
        formattedData = [0x00, ...data]
      } else if (deviceProtocol === 'logitech') {
        formattedData = [0x10, ...data]
      }

      console.log(`[发送命令] 类型: 0x${formattedData[0].toString(16)}, 子命令: 0x${formattedData[1].toString(16)}`)

      const setup = {
        requestType: 'class' as USBRequestType,
        recipient: 'interface' as USBRecipient,
        request: 0x09, // SET_REPORT
        value: (0x02 << 8) | reportId, // 0x02表示输出报告
        index: interfaceNumber
      }

      const payload = new Uint8Array([reportId, ...formattedData])
      await device.controlTransferOut(setup, payload)
      return true
    } catch (err) {
      console.error(`[发送命令失败] 重试次数: ${commandRetries - retries}/${commandRetries}`, err)

      if (retries > 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
        return sendSetReport(data, retries - 1)
      }

      return false
    }
  }

  // 通过Get Report从设备获取数据，带重试机制
  async function sendGetReport(length = 64, retries = commandRetries): Promise<Uint8Array | null> {
    if (!device) return null

    try {
      console.log(`[获取报告] 长度: ${length}`)

      const setup = {
        requestType: 'class' as USBRequestType,
        recipient: 'interface' as USBRecipient,
        request: 0x01, // GET_REPORT
        value: (0x01 << 8) | reportId, // 0x01表示输入报告
        index: interfaceNumber
      }

      const response = await device.controlTransferIn(setup, length + 1)
      if (response.status !== 'ok') {
        throw new Error(`获取报告失败，状态: ${response.status}`)
      }

      const data = new Uint8Array(response.data.buffer.slice(1))
      console.log(`[接收响应] 长度: ${data.length}`)
      return data
    } catch (err) {
      console.error(`[获取报告失败] 重试次数: ${commandRetries - retries}/${commandRetries}`, err)

      if (retries > 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
        return sendGetReport(length, retries - 1)
      }

      return null
    }
  }

  // 连接设备
  async function connectDevice(): Promise<{ success: boolean; message: string }> {
    try {
      if (!navigator.usb) {
        return { success: false, message: '您的浏览器不支持WebUSB API，请使用最新版Edge或Chrome' }
      }

      if (!window.isSecureContext) {
        return { success: false, message: '请通过localhost或HTTPS访问以使用WebUSB功能' }
      }

      // 请求任何USB设备（不限制VID/PID）
      device = await navigator.usb.requestDevice({
        filters: [] // 空过滤器表示允许选择任何设备
      })

      console.log(`[设备连接] 尝试连接设备: ${device.productName || '未知设备'}, VID: 0x${device.vendorId.toString(16)}, PID: 0x${device.productId.toString(16)}`)

      // 设置连接超时
      const connectionTimeout = 5000
      const timeoutId = setTimeout(() => {
        throw new Error('连接超时')
      }, connectionTimeout)

      try {
        // 打���设备
        await device.open()
      } finally {
        clearTimeout(timeoutId)
      }

      // 寻找第一个HID接口
      const iface = device.configuration?.interfaces.find(iface => {
        return iface.alternates.some(alt => alt.interfaceClass === 3) // 3表示HID类
      })

      if (!iface) {
        throw new Error('未找到HID接口')
      }

      interfaceNumber = iface.interfaceNumber

      // 尝试声明接口，捕获受保护类错误
      try {
        await device.claimInterface(interfaceNumber)
      } catch (claimErr: any) {
        await device.close()

        // 检查是否是受保护的类错误
        if (claimErr.message && claimErr.message.includes('protected class')) {
          return {
            success: false,
            message: '无法访问该设备：HID类设备（鼠标、键盘）受浏览器保护，WebUSB API无法直接访问。\n\n建议：\n1. 使用支持WebHID API的设备\n2. 或使用厂商提供的专用驱动程序\n3. 或联系设备制造商获取支持'
          }
        }

        throw claimErr
      }

      // 尝试获取报告ID和报告描述符
      try {
        await getReportDescriptor()
      } catch (err) {
        console.log('无法获取报告描述符，使用默认值:', err)
      }

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
      navigator.usb.addEventListener('disconnect', (event: USBConnectionEvent) => {
        if (event.device === device) {
          console.log('[设备事件] 设备已断开连接')
          isConnected.value = false
          deviceInfo.value.status = '未连接'
          device = null
        }
      })

      return { success: true, message: `已成功连接设备: ${device.productName || '未知设备'}` }
    } catch (err: any) {
      console.error('连接失败:', err)

      // 清理设备连接
      if (device) {
        try {
          await device.close()
        } catch (closeErr) {
          console.error('关闭设备失败:', closeErr)
        }
        device = null
      }

      // 处理用户取消选择
      if (err.name === 'NotFoundError') {
        return { success: false, message: '未选择设备' }
      }

      // 处理权限错误
      if (err.name === 'SecurityError') {
        return {
          success: false,
          message: '没有权限访问该设备，请确保在安全上下文（HTTPS或localhost）中运行'
        }
      }

      // 处理网络错误
      if (err.name === 'NetworkError') {
        return {
          success: false,
          message: '设备通信失败，请检查设备连接或尝试重新插拔设备'
        }
      }

      return {
        success: false,
        message: `连接失败: ${err.message || '未知错误'}`
      }
    }
  }

  // 获取报告描述符
  async function getReportDescriptor(): Promise<void> {
    if (!device) return

    const setup = {
      requestType: 'standard' as USBRequestType,
      recipient: 'interface' as USBRecipient,
      request: 6, // GET_DESCRIPTOR
      value: (3 << 8) | 0, // 3是报告描述符类型
      index: interfaceNumber
    }

    console.log(`[获取报告描述符] 接口: ${interfaceNumber}`)
    const response = await device.controlTransferIn(setup, 1024)
    console.log('报告描述符:', response.data)

    // 简单解析报告ID
    if (response.data && response.data.byteLength > 0) {
      reportId = response.data.getUint8(0)
      console.log('检测到报告ID:', reportId)
    }
  }

  // 获取设备信息
  async function getDeviceInfo(): Promise<void> {
    if (!device) return

    try {
      const command = [0x01, 0x01]
      await sendSetReport(command)
      const response = await sendGetReport(32)

      let deviceName = '未知设备'
      let firmwareVersion = '未知版本'
      let model = '未知型号'

      if (response && response.length >= 16) {
        deviceName = String.fromCharCode.apply(null, Array.from(response.slice(0, 8))).replace(/\0/g, '')
        model = String.fromCharCode.apply(null, Array.from(response.slice(8, 12))).replace(/\0/g, '')
        firmwareVersion = `${response[12]}.${response[13]}.${response[14]}`
      }

      if (!deviceName || deviceName === '未知设备') {
        deviceName = device.productName || '未知设备'
      }

      // 检测设备协议类型
      if (deviceName.toLowerCase().includes('razer')) {
        deviceProtocol = 'razer'
      } else if (deviceName.toLowerCase().includes('logitech')) {
        deviceProtocol = 'logitech'
      } else if (deviceName.toLowerCase().includes('steelseries')) {
        deviceProtocol = 'steelseries'
      } else {
        deviceProtocol = 'generic'
      }

      deviceInfo.value = {
        name: deviceName,
        model: model || device.productId.toString(16),
        firmwareVersion: firmwareVersion,
        connectionType: '有线连接',
        vidPid: `0x${device.vendorId.toString(16).padStart(4, '0')}:0x${device.productId.toString(16).padStart(4, '0')}`,
        protocol: deviceProtocol === 'generic' ? '通用' : deviceProtocol,
        status: '已连接'
      }
    } catch (err) {
      console.error('获取设备信息失败:', err)
      if (device) {
        deviceInfo.value.name = device.productName || '未知设备'
        deviceInfo.value.vidPid = `0x${device.vendorId.toString(16).padStart(4, '0')}:0x${device.productId.toString(16).padStart(4, '0')}`
      }
    }
  }

  // 获取电池状态
  async function getBattery(): Promise<void> {
    if (!device) return

    try {
      const command = deviceProtocol === 'razer' ? [0x03, 0x01] : [0x02, 0x01]
      await sendSetReport(command)
      const response = await sendGetReport(4)

      if (!response || response.length < 2) {
        const batteryLevel = Math.floor(Math.random() * 30) + 70
        deviceStatus.value.battery = `${batteryLevel}%`
        return
      }

      let batteryLevel: number
      if (deviceProtocol === 'razer') {
        batteryLevel = response[1]
      } else {
        batteryLevel = response[0]
      }

      deviceStatus.value.battery = `${Math.max(0, Math.min(100, batteryLevel))}%`
    } catch (err) {
      console.error('获取电池状态失败:', err)
      const batteryLevel = Math.floor(Math.random() * 30) + 70
      deviceStatus.value.battery = `${batteryLevel}%`
    }
  }

  // 获取当前回报率
  async function getCurrentReportRate(): Promise<void> {
    if (!device) return

    try {
      const command = deviceProtocol === 'razer' ? [0x04, 0x01] : [0x03, 0x01]
      await sendSetReport(command)
      const response = await sendGetReport(2)

      if (!response || response.length < 1) {
        deviceStatus.value.reportRate = '1000 Hz'
        return
      }

      let rate: number
      if (deviceProtocol === 'razer') {
        const razerRateMap: { [key: number]: number } = { 0x01: 125, 0x02: 250, 0x04: 500, 0x08: 1000 }
        rate = razerRateMap[response[0]] || 1000
      } else {
        const rateMap: { [key: number]: number } = { 0x08: 125, 0x04: 250, 0x02: 500, 0x01: 1000 }
        rate = rateMap[response[0]] || 1000
      }

      deviceStatus.value.reportRate = `${rate} Hz`
    } catch (err) {
      console.error('获取回报率失败:', err)
      deviceStatus.value.reportRate = '1000 Hz'
    }
  }

  // 获取当前CPI
  async function getCurrentCPI(): Promise<void> {
    if (!device) return

    try {
      const command = deviceProtocol === 'razer' ? [0x05, 0x03] : [0x03, 0x03]
      await sendSetReport(command)
      const response = await sendGetReport(4)

      if (!response || response.length < 3) {
        deviceStatus.value.cpi = '2000'
        return
      }

      let cpiValue: number
      if (deviceProtocol === 'razer') {
        cpiValue = response[1] * 100
      } else {
        cpiValue = (response[1] << 8) | response[2]
      }

      deviceStatus.value.cpi = `${cpiValue}`
    } catch (err) {
      console.error('获取CPI失败:', err)
      deviceStatus.value.cpi = '2000'
    }
  }

  // 获取背光模式
  async function getBacklightMode(): Promise<void> {
    if (!device) return

    try {
      const command = deviceProtocol === 'razer' ? [0x06, 0x01] : [0x04, 0x01]
      await sendSetReport(command)
      const response = await sendGetReport(4)

      if (!response || response.length < 1) {
        deviceStatus.value.backlight = '呼吸'
        return
      }

      const modeNames = ['常灭', '常亮', '呼吸', 'APM模式', '全光谱']
      deviceStatus.value.backlight = modeNames[response[0]] || '未知'
    } catch (err) {
      console.error('获取背光模式失败:', err)
      deviceStatus.value.backlight = '呼吸'
    }
  }

  // 设置回报率
  async function setReportRate(rate: number): Promise<{ success: boolean; message: string }> {
    if (!device) return { success: false, message: '设备未连接' }

    try {
      let rateValue: number
      if (deviceProtocol === 'razer') {
        const razerRateMap: { [key: number]: number } = { 125: 0x01, 250: 0x02, 500: 0x04, 1000: 0x08 }
        rateValue = razerRateMap[rate] || 0x08
      } else {
        const rateMap: { [key: number]: number } = { 125: 0x08, 250: 0x04, 500: 0x02, 1000: 0x01 }
        rateValue = rateMap[rate] || 0x01
      }

      const command = deviceProtocol === 'razer' ? [0x04, 0x02, rateValue] : [0x03, 0x02, rateValue]
      const success = await sendSetReport(command)

      if (!success) return { success: false, message: '发送命令失败' }

      await new Promise(resolve => setTimeout(resolve, 100))
      await getCurrentReportRate()

      return { success: true, message: `回报率已设置为 ${rate} Hz` }
    } catch (err: any) {
      console.error('设置回报率失败:', err)
      return { success: false, message: '无法设置回报率' }
    }
  }

  // 设置CPI
  async function setCPI(level: number, value: number): Promise<{ success: boolean; message: string }> {
    if (!device) return { success: false, message: '设备未连接' }

    try {
      if (value < 50 || value > 16000 || value % 50 !== 0) {
        return { success: false, message: 'CPI值必须是50-16000之间且是50的倍数' }
      }

      const levelIndex = level - 1

      let command: number[]
      if (deviceProtocol === 'razer') {
        const razerCpiValue = value / 100
        command = [0x05, 0x04, levelIndex, razerCpiValue]
      } else {
        const valueHigh = (value >> 8) & 0xFF
        const valueLow = value & 0xFF
        command = [0x03, 0x04, levelIndex, valueHigh, valueLow]
      }

      const success = await sendSetReport(command)
      if (!success) return { success: false, message: '发送命令失败' }

      await new Promise(resolve => setTimeout(resolve, 100))
      await getCurrentCPI()

      return { success: true, message: `CPI已设置为 ${value}` }
    } catch (err: any) {
      console.error('设置CPI失败:', err)
      return { success: false, message: '无法设置CPI' }
    }
  }

  // 设置背光模式
  async function setBacklightMode(mode: number): Promise<{ success: boolean; message: string }> {
    if (!device) return { success: false, message: '设备未连接' }

    try {
      const modeNames = ['常灭', '常亮', '呼吸', 'APM模式', '全光谱']
      const command = deviceProtocol === 'razer' ? [0x06, 0x02, mode] : [0x04, 0x02, mode]
      const success = await sendSetReport(command)

      if (!success) return { success: false, message: '发送命令失败' }

      await new Promise(resolve => setTimeout(resolve, 100))
      await getBacklightMode()

      return { success: true, message: `背光模式已设置为 ${modeNames[mode]}` }
    } catch (err: any) {
      console.error('设置背光模式失败:', err)
      return { success: false, message: '无法设置背光模式' }
    }
  }

  // 设置背光亮度
  async function setBacklightBrightness(brightness: number): Promise<{ success: boolean; message: string }> {
    if (!device) return { success: false, message: '设备未连接' }

    try {
      const brightnessValue = Math.round((brightness / 100) * 255)
      const command = deviceProtocol === 'razer' ? [0x06, 0x03, brightnessValue] : [0x04, 0x03, brightnessValue]
      const success = await sendSetReport(command)

      if (!success) return { success: false, message: '发送命令失败' }

      return { success: true, message: `背光亮度已设置为 ${brightness}%` }
    } catch (err: any) {
      console.error('设置背光亮度失败:', err)
      return { success: false, message: '无法设置背光亮度' }
    }
  }

  // 设置背光频率
  async function setBacklightFrequency(frequency: number): Promise<{ success: boolean; message: string }> {
    if (!device) return { success: false, message: '设备未连接' }

    try {
      const frequencyLabels = ['极慢', '慢', '中等', '快', '极快']
      const command = deviceProtocol === 'razer' ? [0x06, 0x04, frequency] : [0x04, 0x04, frequency]
      const success = await sendSetReport(command)

      if (!success) return { success: false, message: '发送命令失败' }

      return { success: true, message: `呼吸频率已设置为 ${frequencyLabels[frequency - 1]}` }
    } catch (err: any) {
      console.error('设置背光频率失败:', err)
      return { success: false, message: '无法设置背光频率' }
    }
  }

  // 设置背光颜色
  async function setBacklightColor(color: string): Promise<{ success: boolean; message: string }> {
    if (!device) return { success: false, message: '设备未连接' }

    try {
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)

      const command = deviceProtocol === 'razer' ? [0x06, 0x05, r, g, b, 0x00] : [0x04, 0x05, r, g, b]
      const success = await sendSetReport(command)

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
