<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-icon">
            <i class="fa fa-mouse-pointer"></i>
          </div>
          <h1 class="app-title">通用游戏鼠标驱动</h1>
          <span class="app-subtitle">支持多种游戏鼠标</span>
        </div>

        <div class="header-right">
          <div class="connection-status">
            <span class="status-indicator" :class="{ connected: isConnected }"></span>
            <span>{{ isConnected ? '已连接设备' : '未连接设备' }}</span>
          </div>
          <button @click="handleConnect" class="btn-primary btn-sm">
            <i class="fa fa-plug"></i> 连接设备
          </button>
        </div>
      </div>
    </header>

    <!-- 设备状态概览卡片 -->
    <main class="main-content">
      <div class="device-status-card" :class="{ disabled: !isConnected }">
        <div class="status-grid">
          <div class="status-item">
            <div class="status-icon battery-icon">
              <i class="fa fa-battery-three-quarters"></i>
            </div>
            <div class="status-info">
              <p class="status-label">电池状态</p>
              <p class="status-value">{{ deviceStatus.battery }}</p>
            </div>
          </div>

          <div class="status-item">
            <div class="status-icon report-rate-icon">
              <i class="fa fa-refresh"></i>
            </div>
            <div class="status-info">
              <p class="status-label">当前回报率</p>
              <p class="status-value">{{ deviceStatus.reportRate }}</p>
            </div>
          </div>

          <div class="status-item">
            <div class="status-icon dpi-icon">
              <i class="fa fa-tachometer"></i>
            </div>
            <div class="status-info">
              <p class="status-label">当前DPI</p>
              <p class="status-value">{{ deviceStatus.dpi }}</p>
            </div>
          </div>

          <div class="status-item">
            <div class="status-icon backlight-icon">
              <i class="fa fa-lightbulb-o"></i>
            </div>
            <div class="status-info">
              <p class="status-label">背光模式</p>
              <p class="status-value">{{ deviceStatus.backlight }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="tabs-container">
        <div class="tabs-nav scrollbar-hide">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="tab-button"
            :class="{ 'tab-active': activeTab === tab.id }"
          >
            <i :class="tab.icon"></i>{{ tab.label }}
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
    <footer class="app-footer">
      <div class="footer-content">
        <p>通用游戏鼠标驱动程序 v1.0.1</p>
        <p class="copyright">© 2026 博巨矽科技有限公司 版权所有</p>
      </div>
    </footer>

    <!-- 通知提示框 -->
    <div v-if="notification.show" class="notification" :class="[notificationClass, { show: notification.show }]">
      <div class="notification-content">
        <div class="notification-icon">
          <i :class="notificationIcon"></i>
        </div>
        <div class="notification-body">
          <h4 class="notification-title">{{ notification.title }}</h4>
          <p class="notification-message">{{ notification.message }}</p>
        </div>
        <button @click="hideNotification" class="notification-close">
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
  return notification.value.type
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
.app-container {
  min-height: 100vh;
  background-color: rgb(249, 250, 251);
}

/* 顶部导航栏 */
.app-header {
  background-color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 50;
  transition: all 0.3s;
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 2.5rem;
  height: 2.5rem;
  background-color: var(--color-primary);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.app-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--color-dark);
  margin: 0;
}

.app-subtitle {
  color: var(--color-gray-medium);
  font-size: 0.875rem;
  display: none;
}

@media (min-width: 768px) {
  .app-subtitle {
    display: inline-block;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.connection-status {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  gap: 0.5rem;
}

.status-indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background-color: var(--color-danger);
}

.status-indicator.connected {
  background-color: var(--color-success);
}

.btn-sm {
  font-size: 0.875rem;
}

.btn-sm i {
  margin-right: 0.25rem;
}

/* 主内容区 */
.main-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.device-status-card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s;
}

.device-status-card.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .status-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.battery-icon {
  background-color: rgba(22, 93, 255, 0.1);
  color: var(--color-primary);
}

.report-rate-icon {
  background-color: rgba(54, 207, 201, 0.1);
  color: var(--color-secondary);
}

.dpi-icon {
  background-color: rgba(114, 46, 209, 0.1);
  color: var(--color-accent);
}

.backlight-icon {
  background-color: rgba(255, 125, 0, 0.1);
  color: var(--color-warning);
}

.status-info {
  flex: 1;
}

.status-label {
  color: var(--color-gray-medium);
  font-size: 0.875rem;
  margin: 0;
}

.status-value {
  font-weight: 500;
  margin: 0;
}

/* 标签页导航 */
.tabs-container {
  border-bottom: 1px solid var(--color-gray-light);
  margin-bottom: 1.5rem;
}

.tabs-nav {
  display: flex;
  overflow-x: auto;
  gap: 0.25rem;
}

@media (min-width: 768px) {
  .tabs-nav {
    gap: 1rem;
  }
}

.tab-button {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  white-space: nowrap;
  transition: all 0.2s;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-gray-dark);
  cursor: pointer;
}

@media (min-width: 768px) {
  .tab-button {
    font-size: 1rem;
  }
}

.tab-button i {
  margin-right: 0.5rem;
}

.tab-button:hover {
  color: var(--color-primary);
}

/* 页脚 */
.app-footer {
  background-color: white;
  border-top: 1px solid var(--color-gray-light);
  margin-top: 2.5rem;
  padding: 1.5rem 0;
}

.footer-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
  color: var(--color-gray-medium);
  font-size: 0.875rem;
}

.footer-content p {
  margin: 0;
}

.copyright {
  margin-top: 0.25rem;
}

/* 通知提示框 */
.notification {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(5rem);
  transition: all 0.3s;
  opacity: 0;
  max-width: 28rem;
}

.notification.show {
  transform: translateY(0);
  opacity: 1;
}

.notification-content {
  display: flex;
  align-items: flex-start;
}

.notification-icon {
  margin-right: 0.75rem;
  font-size: 1.25rem;
}

.notification-body {
  flex: 1;
}

.notification-title {
  font-weight: 500;
  margin: 0;
}

.notification-message {
  font-size: 0.875rem;
  color: var(--color-gray-dark);
  margin: 0.25rem 0 0 0;
  white-space: pre-line;
}

.notification-close {
  margin-left: auto;
  color: var(--color-gray-medium);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
}

.notification-close:hover {
  color: var(--color-dark);
}

/* 通知类型样式 */
.notification.success {
  background-color: rgba(0, 180, 42, 0.1);
  border: 1px solid rgba(0, 180, 42, 0.3);
}

.notification.success .notification-icon {
  color: var(--color-success);
}

.notification.error {
  background-color: rgba(245, 63, 63, 0.1);
  border: 1px solid rgba(245, 63, 63, 0.3);
}

.notification.error .notification-icon {
  color: var(--color-danger);
}

.notification.warning {
  background-color: rgba(255, 125, 0, 0.1);
  border: 1px solid rgba(255, 125, 0, 0.3);
}

.notification.warning .notification-icon {
  color: var(--color-warning);
}

.notification.info {
  background-color: rgba(22, 93, 255, 0.1);
  border: 1px solid rgba(22, 93, 255, 0.3);
}

.notification.info .notification-icon {
  color: var(--color-primary);
}
</style>
