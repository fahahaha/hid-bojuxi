<script setup lang="ts">
import { ref } from 'vue'
import Versions from './components/Versions.vue'
import { getElectronAPI, getEnvName } from './utils/env'

const hidStatus = ref<string>('未连接')
const hidDevices = ref<HIDDevice[]>([])
const hidLogs = ref<string[]>([])

const ipcHandle = (): void => {
  const electronAPI = getElectronAPI()
  if (electronAPI) {
    electronAPI.ipcRenderer.send('ping')
  } else {
    console.log('Web 环境: 无法使用 IPC 通信')
    alert('当前在 Web 环境中,IPC 功能不可用')
  }
}

const addLog = (message: string): void => {
  const timestamp = new Date().toLocaleTimeString()
  hidLogs.value.unshift(`[${timestamp}] ${message}`)
  if (hidLogs.value.length > 10) {
    hidLogs.value.pop()
  }
}

const testWebHID = async (): Promise<void> => {
  try {
    addLog(`当前环境: ${getEnvName()}`)

    // 检查 WebHID API 是否可用
    if (!navigator.hid) {
      hidStatus.value = 'WebHID API 不可用'
      addLog('错误: 浏览器不支持 WebHID API')
      alert('当前浏览器不支持 WebHID API')
      return
    }

    addLog('WebHID API 可用，正在请求设备...')
    hidStatus.value = '正在请求设备...'

    // 请求 HID 设备
    const devices = await navigator.hid.requestDevice({
      filters: []
    })

    if (devices.length === 0) {
      hidStatus.value = '未选择设备'
      addLog('用户未选择任何设备')
      return
    }

    hidDevices.value = devices
    const device = devices[0]

    addLog(`已选择设备: ${device.productName || '未知设备'}`)
    addLog(`厂商ID: ${device.vendorId}, 产品ID: ${device.productId}`)

    // 打开设备
    if (!device.opened) {
      await device.open()
      addLog('设备已打开')
    }

    hidStatus.value = `已连接: ${device.productName || '未知设备'}`
    addLog('✓ WebHID 测试成功！')

    // 监听输入数据
    device.addEventListener('inputreport', (event) => {
      const { data, reportId } = event
      addLog(`收到数据 (Report ID: ${reportId}): ${new Uint8Array(data.buffer).join(', ')}`)
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    hidStatus.value = `错误: ${errorMessage}`
    addLog(`错误: ${errorMessage}`)
    console.error('WebHID 测试失败:', error)
  }
}

const disconnectHID = async (): Promise<void> => {
  try {
    for (const device of hidDevices.value) {
      if (device.opened) {
        await device.close()
        addLog(`设备已断开: ${device.productName || '未知设备'}`)
      }
    }
    hidDevices.value = []
    hidStatus.value = '未连接'
    addLog('所有设备已断开')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    addLog(`断开失败: ${errorMessage}`)
    console.error('断开设备失败:', error)
  }
}
</script>

<template>
  <img alt="logo" class="logo" src="./assets/electron.svg" />
  <div class="creator">啊啊啊 Powered by electron-vite</div>
  <div class="text">
    Build an Electron app with
    <span class="vue">Vue</span>
    and
    <span class="ts">TypeScript</span>
  </div>
  <p class="tip">Please try pressing <code>F12</code> to open the devTool</p>

  <!-- WebHID 测试区域 -->
  <div class="webhid-section">
    <div class="webhid-status">
      <span class="status-label">WebHID 状态:</span>
      <span class="status-value" :class="{ connected: hidDevices.length > 0 }">
        {{ hidStatus }}
      </span>
    </div>
    <div class="webhid-actions">
      <button class="hid-button primary" @click="testWebHID">
        🔌 连接 HID 设备
      </button>
      <button
        class="hid-button secondary"
        @click="disconnectHID"
        :disabled="hidDevices.length === 0"
      >
        ❌ 断开设备
      </button>
    </div>
    <div v-if="hidLogs.length > 0" class="webhid-logs">
      <div class="logs-title">操作日志:</div>
      <div class="logs-content">
        <div v-for="(log, index) in hidLogs" :key="index" class="log-item">
          {{ log }}
        </div>
      </div>
    </div>
  </div>

  <div class="actions">
    <div class="action">
      <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">Documentation</a>
    </div>
    <div class="action">
      <a target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</a>
    </div>
  </div>
  <Versions />
</template>
