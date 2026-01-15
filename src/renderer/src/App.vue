<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-icon">
<!--            <i class="fa fa-mouse-pointer"></i>-->
          </div>
          <h1 class="app-title">{{ t('header.title') }}</h1>
          <span class="app-subtitle">{{ t('header.subtitle') }}</span>
        </div>

        <div class="header-right">
          <!-- 板载配置选择 -->
          <div class="profile-selector">
            <button class="header-btn btn-profile" @click="toggleProfileDropdown">
              <i class="fa fa-layer-group"></i>
              <span>{{ t('header.profile.label') }} {{ selectedProfile }}</span>
              <i class="fa fa-chevron-down" :class="{ 'rotate-180': showProfileDropdown }"></i>
            </button>
            <div v-if="showProfileDropdown" class="profile-dropdown">
              <button
                v-for="profile in profiles"
                :key="profile.id"
                @click="selectProfile(profile.id)"
                class="profile-option"
                :class="{ active: selectedProfile === profile.id }"
              >
                <i class="fa fa-check" :class="{ invisible: selectedProfile !== profile.id }"></i>
                <span>{{ profile.name }}</span>
              </button>
            </div>
          </div>

          <!-- 连接模式显示 -->
          <div v-if="isConnected && supportsDualMode" class="header-btn connection-mode">
            <i
              class="fa"
              :class="connectionMode === 'usb' ? 'fa-brands fa-usb' : 'fa-solid fa-wifi'"
            ></i>
            <span>
              {{
                connectionMode === 'usb'
                  ? t('header.connectionMode.usb')
                  : t('header.connectionMode.wireless')
              }}
              {{ t('header.connectionMode.label') }}
            </span>
          </div>
          <button class="header-btn btn-theme" @click="toggleTheme">
            <i
              class="fa"
              :class="theme === 'dark' ? 'fa-regular fa-sun' : 'fa-regular fa-moon'"
            ></i>
            <span>{{ t('header.theme') }}</span>
          </button>
          <div class="language-selector">
            <button class="header-btn btn-language" @click="toggleLanguageDropdown">
              <i class="fa fa-language"></i>
              <span>{{ locale === 'zh-CN' ? '中文' : 'English' }}</span>
              <i class="fa fa-chevron-down" :class="{ 'rotate-180': showLanguageDropdown }"></i>
            </button>
            <div v-if="showLanguageDropdown" class="language-dropdown">
              <button
                @click="selectLanguage('zh-CN')"
                class="language-option"
                :class="{ active: locale === 'zh-CN' }"
              >
                <i class="fa fa-check" :class="{ invisible: locale !== 'zh-CN' }"></i>
                <span>中文</span>
              </button>
              <button
                @click="selectLanguage('en-US')"
                class="language-option"
                :class="{ active: locale === 'en-US' }"
              >
                <i class="fa fa-check" :class="{ invisible: locale !== 'en-US' }"></i>
                <span>English</span>
              </button>
            </div>
          </div>
<!--          <div class="connection-status">-->
<!--            <span class="status-indicator" :class="{ connected: isConnected }"></span>-->
<!--            <span>{{ isConnected ? t('common.connected') : t('common.disconnected') }}</span>-->
<!--          </div>-->
          <button @click="handleConnect" class="btn-primary btn-sm">
            <i class="fa fa-plug"></i> {{ t('common.connect') }}
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
              <p class="status-label">{{ t('deviceStatus.battery') }}</p>
              <p class="status-value">{{ connectionMode === 'usb' ? t('deviceStatus.charging') : deviceStatus.battery }}</p>
            </div>
          </div>

          <div class="status-item">
            <div class="status-icon report-rate-icon">
              <i class="fa fa-refresh"></i>
            </div>
            <div class="status-info">
              <p class="status-label">{{ t('deviceStatus.reportRate') }}</p>
              <p class="status-value">{{ deviceStatus.reportRate }}</p>
            </div>
          </div>

          <div class="status-item">
            <div class="status-icon dpi-icon">
              <i class="fa fa-tachometer"></i>
            </div>
            <div class="status-info">
              <p class="status-label">{{ t('deviceStatus.dpi') }}</p>
              <p class="status-value">{{ deviceStatus.dpi }}</p>
            </div>
          </div>

          <div class="status-item">
            <div class="status-icon backlight-icon">
              <i class="fa-regular fa-lightbulb"></i>
            </div>
            <div class="status-info">
              <p class="status-label">{{ t('deviceStatus.backlight') }}</p>
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
        <DpiSettings v-if="activeTab === 'dpi'" />
        <BacklightSettings v-if="activeTab === 'backlight'" />
        <ButtonMapping v-if="activeTab === 'buttons'" :initialSubTab="pendingSubTab" @switchTab="handleSwitchTab" />
        <MacroManagement v-if="activeTab === 'macro'" @switchTab="handleSwitchTab" />
        <PerformanceSettings v-if="activeTab === 'performance'" />
        <DeviceInfo v-if="activeTab === 'device'" />
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="app-footer">
      <div class="footer-content">
<!--        <p>{{ t('footer.version') }}</p>-->
        <p class="copyright">{{ t('footer.copyright') }}</p>
      </div>
    </footer>

    <!-- 通知提示框 -->
    <div
      v-if="notification.show"
      class="notification"
      :class="[notificationClass, { show: notification.show }]"
    >
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

    <!-- 全局消息弹窗 -->
    <MessageBox />

    <!-- 全局确认弹窗 -->
    <ConfirmBox />

    <!-- 全局加载遮罩层 -->
    <Transition name="fade">
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p class="loading-text">通信中...</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWebHID } from './composables/useWebHID'
import { useI18n } from './composables/useI18n'
import { useTheme } from './composables/useTheme'
import { useLoading } from './composables/useLoading'
import BasicSettings from './components/BasicSettings.vue'
import DpiSettings from './components/DpiSettings.vue'
import BacklightSettings from './components/BacklightSettings.vue'
import ButtonMapping from './components/ButtonMapping.vue'
import MacroManagement from './components/MacroManagement.vue'
import PerformanceSettings from './components/PerformanceSettings.vue'
import DeviceInfo from './components/DeviceInfo.vue'
import MessageBox from './components/MessageBox.vue'
import ConfirmBox from './components/ConfirmBox.vue'

const {
  isConnected,
  deviceStatus,
  connectDevice,
  autoConnectDevice,
  connectionMode,
  getCurrentProtocol
} = useWebHID()
const { locale, setLocale, t } = useI18n()
const { theme, toggleTheme } = useTheme()
const { isLoading } = useLoading()

const activeTab = ref('basic')
const showLanguageDropdown = ref(false)
const showProfileDropdown = ref(false)
const selectedProfile = ref(1)

// 板载配置列表
const profiles = computed(() => [
  { id: 1, name: t('header.profile.profile1') },
  { id: 2, name: t('header.profile.profile2') }
])

// 检查当前协议是否支持双模式
const supportsDualMode = computed(() => {
  const protocol = getCurrentProtocol()
  return protocol?.features?.supportsDualMode ?? false
})

const tabs = computed(() => [
  { id: 'basic', label: t('tabs.basic'), icon: 'fa fa-sliders' },
  { id: 'dpi', label: t('tabs.dpi'), icon: 'fa fa-tachometer' },
  { id: 'buttons', label: t('tabs.buttons'), icon: 'fa fa-computer-mouse' },
  { id: 'macro', label: t('tabs.macro'), icon: 'fa fa-code' },
  { id: 'performance', label: t('tabs.performance'), icon: 'fa fa-gauge-high' },
  { id: 'backlight', label: t('tabs.backlight'), icon: 'fa fa-lightbulb' },
  { id: 'device', label: t('tabs.device'), icon: 'fa fa-info-circle' }
])

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
    result.success ? t('notification.connectSuccess') : t('notification.connectFailed'),
    result.message
  )
}

function toggleLanguageDropdown() {
  showLanguageDropdown.value = !showLanguageDropdown.value
}

function selectLanguage(lang: 'zh-CN' | 'en-US') {
  setLocale(lang)
  showLanguageDropdown.value = false
}

function toggleProfileDropdown() {
  showProfileDropdown.value = !showProfileDropdown.value
  // 关闭其他下拉框
  showLanguageDropdown.value = false
}

function selectProfile(profileId: number) {
  selectedProfile.value = profileId
  showProfileDropdown.value = false
  // TODO: 这里可以添加切换板载配置的实际逻辑
}

function showNotification(type: string, title: string, message: string) {
  notification.value = { show: true, type, title, message }
  setTimeout(hideNotification, 30000)
}

function hideNotification() {
  notification.value.show = false
}

// 子标签页状态（用于跨组件传递）
const pendingSubTab = ref<string | null>(null)

/**
 * 处理子组件切换标签页的请求
 */
function handleSwitchTab(tab: string, subTab?: string) {
  pendingSubTab.value = subTab || null
  activeTab.value = tab
}

// 点击外部关闭下拉菜单
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.language-selector')) {
    showLanguageDropdown.value = false
  }
  if (!target.closest('.profile-selector')) {
    showProfileDropdown.value = false
  }
}

// 页面加载时自动连接已授权的设备
onMounted(async () => {
  const result = await autoConnectDevice()
  if (result.success) {
    console.log('[自动连接] 成功:', result.message)
  } else {
    console.log('[自动连接] 失败:', result.message)
  }

  // 添加全局点击事件监听
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // 移除全局点击事件监听
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.app-header {
  background-color: var(--bg-primary);
  box-shadow: var(--shadow-sm);
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
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;

  background-image: url('./assets/bojuxi.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
}

.app-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0;
}

.app-subtitle {
  color: var(--text-tertiary);
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
  gap: 0.75rem;
}

/* 统一的头部按钮样式 */
.header-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  height: 2.25rem;
  box-sizing: border-box;
}

.header-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--bg-hover);
}

.header-btn i:first-child {
  font-size: 1rem;
}

/* 连接模式 */
.connection-mode {
  cursor: default;
}

.connection-mode:hover {
  border-color: var(--border-primary);
  color: var(--text-secondary);
  background-color: var(--bg-primary);
}

/* 主题按钮 */
.btn-theme i:first-child {
  transition: transform 0.3s ease;
}

.btn-theme:hover i:first-child {
  transform: rotate(20deg);
}

/* 语言按钮 */
.btn-language i.fa-chevron-down {
  font-size: 0.75rem;
  transition: transform 0.2s;
}

.btn-language i.fa-chevron-down.rotate-180 {
  transform: rotate(180deg);
}

.connection-status {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  gap: 0.5rem;
  color: var(--text-secondary);
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

.language-selector {
  position: relative;
}

.language-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.375rem;
  box-shadow: var(--shadow-md);
  min-width: 120px;
  z-index: 100;
  overflow: hidden;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: left;
}

.language-option:hover {
  background-color: var(--bg-hover);
  color: var(--color-primary);
}

.language-option.active {
  color: var(--color-primary);
  font-weight: 500;
}

.language-option i.fa-check {
  font-size: 0.875rem;
  width: 1rem;
}

.language-option i.fa-check.invisible {
  visibility: hidden;
}

/* 板载配置选择器 */
.profile-selector {
  position: relative;
}

.btn-profile i.fa-chevron-down {
  font-size: 0.75rem;
  transition: transform 0.2s;
}

.btn-profile i.fa-chevron-down.rotate-180 {
  transform: rotate(180deg);
}

.profile-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.375rem;
  box-shadow: var(--shadow-md);
  min-width: 140px;
  z-index: 100;
  overflow: hidden;
}

.profile-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: left;
}

.profile-option:hover {
  background-color: var(--bg-hover);
  color: var(--color-primary);
}

.profile-option.active {
  color: var(--color-primary);
  font-weight: 500;
}

.profile-option i.fa-check {
  font-size: 0.875rem;
  width: 1rem;
}

.profile-option i.fa-check.invisible {
  visibility: hidden;
}

/* 主内容区 */
.main-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

.device-status-card {
  background-color: var(--bg-primary);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-sm);
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
  background-color: var(--icon-bg-battery);
  color: var(--color-primary);
}

.report-rate-icon {
  background-color: var(--icon-bg-report);
  color: var(--color-secondary);
}

.dpi-icon {
  background-color: var(--icon-bg-dpi);
  color: var(--color-accent);
}

.backlight-icon {
  background-color: var(--icon-bg-backlight);
  color: var(--color-warning);
}

.status-info {
  flex: 1;
}

.status-label {
  color: var(--text-tertiary);
  font-size: 0.875rem;
  margin: 0;
}

.status-value {
  font-weight: 500;
  margin: 0;
  color: var(--text-primary);
}

/* 标签页导航 */
.tabs-container {
  border-bottom: 1px solid var(--border-primary);
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
  color: var(--text-secondary);
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
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-primary);
  padding: 1.5rem 0;
  flex-shrink: 0;
}

.footer-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
  color: var(--text-tertiary);
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
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
  white-space: pre-line;
}

.notification-close {
  margin-left: auto;
  color: var(--text-tertiary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
}

.notification-close:hover {
  color: var(--text-primary);
}

/* 通知类型样式 */
.notification.success {
  background-color: var(--notify-success-bg);
  border: 1px solid var(--notify-success-border);
}

.notification.success .notification-icon {
  color: var(--color-success);
}

.notification.error {
  background-color: var(--notify-error-bg);
  border: 1px solid var(--notify-error-border);
}

.notification.error .notification-icon {
  color: var(--color-danger);
}

.notification.warning {
  background-color: var(--notify-warning-bg);
  border: 1px solid var(--notify-warning-border);
}

.notification.warning .notification-icon {
  color: var(--color-warning);
}

.notification.info {
  background-color: var(--notify-info-bg);
  border: 1px solid var(--notify-info-border);
}

.notification.info .notification-icon {
  color: var(--color-primary);
}

/* 全局加载遮罩层 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-primary);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #ffffff;
  font-size: 0.875rem;
  margin: 0;
  font-weight: 500;
}

/* 淡入淡出过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
