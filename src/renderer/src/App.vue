<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i class="fa fa-mouse-pointer text-white text-xl"></i>
          </div>
          <h1 class="text-xl font-bold text-dark">通用游戏鼠标驱动</h1>
          <span class="text-gray-medium text-sm hidden md:inline-block">支持多种游戏鼠标</span>
        </div>

        <div class="flex items-center space-x-4">
          <div class="flex items-center text-sm">
            <span
              class="w-2 h-2 rounded-full mr-2"
              :class="isConnected ? 'bg-success' : 'bg-danger'"
            ></span>
            <span>{{ isConnected ? '已连接设备' : '未连接设备' }}</span>
          </div>
          <button @click="handleConnect" class="btn-primary text-sm">
            <i class="fa fa-plug mr-1"></i> 连接设备
          </button>
        </div>
      </div>
    </header>

    <!-- 设备状态概览卡片 -->
    <main class="container mx-auto px-4 py-6">
      <div
        class="bg-white rounded-xl shadow-sm p-5 mb-6 transition-all duration-300"
        :class="{ 'opacity-50 pointer-events-none': !isConnected }"
      >
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <i class="fa fa-battery-three-quarters text-primary text-xl"></i>
            </div>
            <div>
              <p class="text-gray-medium text-sm">电池状态</p>
              <p class="font-medium">{{ deviceStatus.battery }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <i class="fa fa-refresh text-secondary text-xl"></i>
            </div>
            <div>
              <p class="text-gray-medium text-sm">当前回报率</p>
              <p class="font-medium">{{ deviceStatus.reportRate }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <i class="fa fa-tachometer text-accent text-xl"></i>
            </div>
            <div>
              <p class="text-gray-medium text-sm">当前DPI</p>
              <p class="font-medium">{{ deviceStatus.dpi }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <i class="fa fa-lightbulb-o text-warning text-xl"></i>
            </div>
            <div>
              <p class="text-gray-medium text-sm">背光模式</p>
              <p class="font-medium">{{ deviceStatus.backlight }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="border-b border-gray-light mb-6">
        <div class="flex overflow-x-auto scrollbar-hide space-x-1 md:space-x-4">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-4 py-3 text-sm md:text-base whitespace-nowrap transition-all duration-200"
            :class="activeTab === tab.id ? 'tab-active' : 'text-gray-dark hover:text-primary'"
          >
            <i :class="tab.icon" class="mr-2"></i>{{ tab.label }}
          </button>
        </div>
      </div>

      <!-- 标签页内容 -->
      <div class="tab-contents">
        <BasicSettings v-if="activeTab === 'basic'" />
        <BacklightSettings v-if="activeTab === 'backlight'" />
        <ButtonMapping v-if="activeTab === 'buttons'" />
        <MacroManagement v-if="activeTab === 'macro'" />
        <DeviceInfo v-if="activeTab === 'device'" />
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-white border-t border-gray-light mt-10 py-6">
      <div class="container mx-auto px-4 text-center text-gray-medium text-sm">
        <p>通用游戏鼠标驱动程序 v1.0.1</p>
        <p class="mt-1">© 2026 博巨矽科技有限公司 版权所有</p>
      </div>
    </footer>

    <!-- 通知提示框 -->
    <div
      v-if="notification.show"
      class="fixed bottom-5 right-5 p-4 rounded-lg shadow-lg transform transition-all duration-300 max-w-md"
      :class="[
        notification.show ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0',
        notificationClass
      ]"
    >
      <div class="flex items-start">
        <div class="mr-3 text-xl">
          <i :class="notificationIcon"></i>
        </div>
        <div class="flex-1">
          <h4 class="font-medium">{{ notification.title }}</h4>
          <p class="text-sm text-gray-dark mt-1 whitespace-pre-line">{{ notification.message }}</p>
        </div>
        <button @click="hideNotification" class="ml-auto text-gray-medium hover:text-dark">
          <i class="fa fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWebHID } from './composables/useWebHID'
import BasicSettings from './components/BasicSettings.vue'
import BacklightSettings from './components/BacklightSettings.vue'
import ButtonMapping from './components/ButtonMapping.vue'
import MacroManagement from './components/MacroManagement.vue'
import DeviceInfo from './components/DeviceInfo.vue'

const { isConnected, deviceStatus, connectDevice } = useWebHID()

const activeTab = ref('basic')

const tabs = [
  { id: 'basic', label: '基础设置', icon: 'fa fa-sliders' },
  { id: 'backlight', label: '背光设置', icon: 'fa fa-lightbulb-o' },
  { id: 'buttons', label: '改键设置', icon: 'fa fa-keyboard-o' },
  { id: 'macro', label: '宏管理', icon: 'fa fa-list-ol' },
  { id: 'device', label: '设备信息', icon: 'fa fa-info-circle' }
]

const notification = ref({
  show: false,
  type: 'info',
  title: '',
  message: ''
})

const notificationClass = computed(() => {
  const classes: { [key: string]: string } = {
    success: 'bg-success/10 border border-success/30',
    error: 'bg-danger/10 border border-danger/30',
    warning: 'bg-warning/10 border border-warning/30',
    info: 'bg-primary/10 border border-primary/30'
  }
  return classes[notification.value.type] || classes.info
})

const notificationIcon = computed(() => {
  const icons: { [key: string]: string } = {
    success: 'fa fa-check-circle text-success',
    error: 'fa fa-exclamation-circle text-danger',
    warning: 'fa fa-exclamation-triangle text-warning',
    info: 'fa fa-info-circle text-primary'
  }
  return icons[notification.value.type] || icons.info
})

async function handleConnect() {
  const result = await connectDevice()
  showNotification(
    result.success ? 'success' : 'error',
    result.success ? '连接成功' : '连接失败',
    result.message
  )
}

function showNotification(type: string, title: string, message: string) {
  notification.value = { show: true, type, title, message }
  setTimeout(hideNotification, 30000)
}

function hideNotification() {
  notification.value.show = false
}
</script>

<style scoped>
/* 组件特定样式 */
</style>
