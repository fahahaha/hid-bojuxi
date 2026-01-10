<template>
  <div class="basic-settings">
    <!-- 回报率设置 -->
    <div class="settings-card" :class="{ disabled: !supportsReportRate }">
      <h3 class="card-title">
        <i class="fa fa-refresh icon-secondary"></i>{{ t('basicSettings.reportRate.title') }}
        <span v-if="!supportsReportRate" class="unsupported-badge">
          ({{ t('common.unsupported') }})
        </span>
      </h3>
      <p class="card-description">{{ t('basicSettings.reportRate.description') }}</p>

      <div v-if="!supportsReportRate" class="empty-state">
        <i class="fa fa-exclamation-circle"></i>
        <p>{{ t('basicSettings.reportRate.notSupported') }}</p>
      </div>

      <div v-else class="rate-buttons">
        <button
          v-for="rate in reportRates"
          :key="rate"
          @click="handleSetReportRate(rate)"
          class="rate-button"
          :class="{ 'setting-active': selectedReportRate === rate }"
        >
          {{ rate }} Hz
        </button>
      </div>
    </div>

    <!-- DPI设置 -->
    <div class="settings-card dpi-card" :class="{ disabled: !supportsDPI }">
      <h3 class="card-title">
        <i class="fa fa-tachometer icon-accent"></i>{{ t('basicSettings.dpi.title') }}
        <span v-if="!supportsDPI" class="unsupported-badge"> ({{ t('common.unsupported') }}) </span>
      </h3>
      <p class="card-description">
        {{ t('basicSettings.dpi.description') }}
        <span v-if="dpiLevels.length > 0" class="dpi-count">
          {{ t('basicSettings.dpi.totalLevels', { count: String(dpiLevels.length) }) }}
        </span>
      </p>

      <div v-if="!supportsDPI" class="empty-state">
        <i class="fa fa-exclamation-circle"></i>
        <p>{{ t('basicSettings.dpi.notSupported') }}</p>
      </div>

      <div v-else class="dpi-settings-new">
        <!-- 当前档位状态显示 -->
        <div class="current-dpi-status">
          <div class="status-info">
            <span class="status-label">{{ t('basicSettings.dpi.currentLevel') }}</span>
            <span class="status-value">{{ t('basicSettings.dpi.levelLabel', { level: String(currentDpiLevel + 1) }) }}</span>
          </div>
          <div class="status-info">
            <span class="status-label">{{ t('basicSettings.dpi.current') }}</span>
            <span class="status-dpi-value">{{ deviceStatus.dpi }} DPI</span>
          </div>
        </div>

        <!-- DPI 档位列表 -->
        <div class="dpi-levels-container">
          <div
            v-for="(dpiValue, index) in dpiLevels"
            :key="index"
            class="dpi-level-item"
            :class="{ active: currentDpiLevel === index }"
          >
            <div class="level-header">
              <div class="level-info">
                <span class="level-badge" :class="{ active: currentDpiLevel === index }">
                  {{ index + 1 }}
                </span>
                <span class="level-label">{{ t('basicSettings.dpi.levelLabel', { level: String(index + 1) }) }}</span>
                <span v-if="currentDpiLevel === index" class="current-badge">{{ t('basicSettings.dpi.currentBadge') }}</span>
              </div>
              <button
                class="switch-btn"
                :class="{ active: currentDpiLevel === index }"
                @click="handleSwitchDpiLevel(index)"
                :disabled="currentDpiLevel === index"
              >
                {{ currentDpiLevel === index ? t('basicSettings.dpi.selected') : t('basicSettings.dpi.switchLevel') }}
              </button>
            </div>

            <div class="level-content">
              <div class="dpi-value-display">
                <span class="dpi-value">{{ localDpiValues[index] || dpiValue }}</span>
                <span class="dpi-unit">DPI</span>
              </div>

              <div class="slider-container">
                <input
                  type="range"
                  class="dpi-slider"
                  :min="dpiMin"
                  :max="dpiMax"
                  :step="dpiStep"
                  :value="localDpiValues[index] || dpiValue"
                  @input="handleDpiSliderInput(index, $event)"
                  @change="handleDpiSliderChange(index, $event)"
                />
                <div class="slider-labels">
                  <span>{{ dpiMin }}</span>
                  <span>{{ dpiMax }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 滚轮方向设置 -->
    <div class="settings-card" :class="{ disabled: !supportedScrollDirection }">
      <h3 class="card-title">
        <i class="fa fa-arrows-v icon-primary"></i>{{ t('basicSettings.scrollDirection.title') }}
        <span v-if="!supportedScrollDirection" class="unsupported-badge">
          ({{ t('common.unsupported') }})
        </span>
      </h3>
      <p class="card-description">{{ t('basicSettings.scrollDirection.description') }}</p>

      <div v-if="!supportedScrollDirection" class="empty-state">
        <i class="fa fa-exclamation-circle"></i>
        <p>{{ t('basicSettings.scrollDirection.notSupported') }}</p>
      </div>

      <div v-else class="scroll-direction-settings">
        <label class="checkbox-label" :class="{ active: !isReverseScroll }">
          <input
            type="checkbox"
            :checked="!isReverseScroll"
            @change="handleSetNormalScroll"
            class="checkbox-input"
          />
          <span class="checkbox-text">{{ t('basicSettings.scrollDirection.normal') }}</span>
        </label>
        <label class="checkbox-label" :class="{ active: isReverseScroll }">
          <input
            type="checkbox"
            :checked="isReverseScroll"
            @change="handleSetReverseScroll"
            class="checkbox-input"
          />
          <span class="checkbox-text">{{ t('basicSettings.scrollDirection.reverse') }}</span>
        </label>
        <p class="scroll-hint">
          {{
            isReverseScroll
              ? t('basicSettings.scrollDirection.reverseHint')
              : t('basicSettings.scrollDirection.normalHint')
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { useWebHID } from '../composables/useWebHID'
import { useI18n } from '../composables/useI18n'

const {
  setReportRate,
  setDPI,
  setDPILevelValue,
  setScrollDirection,
  getCurrentProtocol,
  isConnected,
  deviceStatus,
  connectionMode
} = useWebHID()
const { t } = useI18n()

// DPI 范围配置（从 A5 获取，暂时写死）
const dpiMin = 50
const dpiMax = 16000
const dpiStep = 50

// 本地 DPI 值（用于滑动条实时显示）
const localDpiValues = reactive<Record<number, number>>({})

// 获取设备特性
const deviceFeatures = computed(() => {
  const protocol = getCurrentProtocol()
  return protocol?.features || null
})

// 支持的回报率列表(根据设备特性和连接模式动态调整)
// USB 模式只支持 1000Hz，2.4G 模式支持全部回报率
const reportRates = computed(() => {
  const allRates = deviceFeatures.value?.supportedReportRates || [125, 250, 500, 1000]
  // USB 模式只支持 1000Hz
  if (connectionMode.value === 'usb') {
    return [1000]
  }
  // 2.4G 模式支持全部回报率
  return allRates
})

// DPI 档位列表（从设备状态获取）
const dpiLevels = computed(() => {
  return deviceStatus.value.dpiLevels || []
})

// 当前 DPI 档位
const currentDpiLevel = computed(() => {
  return deviceStatus.value.dpiLevel || 0
})

// 是否支持回报率设置
const supportsReportRate = computed(() => {
  return isConnected.value && reportRates.value.length > 0
})

// 是否支持 DPI 设置
const supportsDPI = computed(() => {
  return isConnected.value && dpiLevels.value.length > 0
})

// 是否支持滚轮方向设置
const supportedScrollDirection = computed(() => {
  return isConnected.value && deviceFeatures.value?.hasScrollDirection !== false
})

const selectedReportRate = ref(1000)
const isReverseScroll = ref(false)

// 监听设备状态变化,回显当前回报率
watch(
  () => deviceStatus.value.reportRate,
  (newRate) => {
    if (newRate && newRate !== '--') {
      // 从 "1000 Hz" 格式中提取数字
      const rateValue = parseInt(newRate)
      if (!isNaN(rateValue)) {
        selectedReportRate.value = rateValue
      }
    }
  },
  { immediate: true }
)

// 监听设备连接状态,初始化回报率选中值
watch(isConnected, (connected) => {
  if (connected && deviceStatus.value.reportRate !== '--') {
    const rateValue = parseInt(deviceStatus.value.reportRate)
    if (!isNaN(rateValue)) {
      selectedReportRate.value = rateValue
    }
  }
})

// 监听 DPI 档位变化，同步本地值
watch(
  () => deviceStatus.value.dpiLevels,
  (newLevels) => {
    if (newLevels && newLevels.length > 0) {
      newLevels.forEach((value, index) => {
        localDpiValues[index] = value
      })
    }
  },
  { immediate: true, deep: true }
)

// 监听设备状态变化,回显当前 滚轮方向
watch(
  () => deviceStatus.value.scrollDirection,
  (newScroll) => {
    isReverseScroll.value = Number(newScroll) == 0 ? false : true
  },
  { immediate: true }
)

// 监听设备连接状态,初始化选中值,回显当前 滚轮方向
watch(isConnected, (connected) => {
  if (connected) {
    isReverseScroll.value = Number(deviceStatus.value.scrollDirection) == 0 ? false : true
  }
})

async function handleSetReportRate(rate: number) {
  if (!supportsReportRate.value) {
    console.warn('当前设备不支持回报率设置')
    return
  }

  selectedReportRate.value = rate
  const result = await setReportRate(rate)
  if (!result.success) {
    console.error('设置回报率失败:', result.message)
  }
}

// 切换 DPI 档位
async function handleSwitchDpiLevel(levelIndex: number) {
  if (!supportsDPI.value) {
    console.warn('当前设备不支持 DPI 设置')
    return
  }

  // setDPI 的 level 参数是 1-based
  const result = await setDPI(levelIndex + 1, dpiLevels.value[levelIndex])
  if (!result.success) {
    console.error('切换 DPI 档位失败:', result.message)
  }
}

// 滑动条输入时实时更新本地值（不发送命令）
function handleDpiSliderInput(levelIndex: number, event: Event) {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value)
  localDpiValues[levelIndex] = value
}

// 滑动条释放时发送命令
async function handleDpiSliderChange(levelIndex: number, event: Event) {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value)

  if (!supportsDPI.value) {
    console.warn('当前设备不支持 DPI 设置')
    return
  }

  const result = await setDPILevelValue(levelIndex, value)
  if (!result.success) {
    console.error('设置 DPI 值失败:', result.message)
    // 恢复原值
    localDpiValues[levelIndex] = dpiLevels.value[levelIndex]
  }
}

async function handleSetNormalScroll() {
  if (!supportedScrollDirection.value) {
    console.warn('当前设备不支持滚轮方向设置')
    return
  }

  isReverseScroll.value = false
  const result = await setScrollDirection(0)
  if (!result.success) {
    console.error('设置滚轮方向失败:', result.message)
  } else {
    console.log(result.message)
  }
}

async function handleSetReverseScroll() {
  if (!supportedScrollDirection.value) {
    console.warn('当前设备不支持滚轮方向设置')
    return
  }

  isReverseScroll.value = true
  const result = await setScrollDirection(1)
  if (!result.success) {
    console.error('设置滚轮方向失败:', result.message)
  } else {
    console.log(result.message)
  }
}
</script>

<style scoped>
.basic-settings {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .basic-settings {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .basic-settings {
    grid-template-columns: repeat(2, 1fr);
  }
}

.settings-card {
  background-color: var(--bg-primary);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-sm);
  padding: 1.25rem;
}

.settings-card.dpi-card {
  grid-column: 1 / -1;
}

.settings-card.disabled {
  opacity: 0.6;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  color: var(--text-primary);
}

.card-title i {
  margin-right: 0.5rem;
}

.icon-secondary {
  color: var(--color-secondary);
}

.icon-accent {
  color: var(--color-accent);
}

.icon-primary {
  color: var(--color-primary);
}

.unsupported-badge {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  color: #f53f3f;
  font-weight: normal;
}

.card-description {
  color: var(--text-tertiary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.dpi-count {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.empty-state {
  text-align: center;
  padding: 1rem 0;
  color: var(--text-tertiary);
}

.empty-state i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0;
}

.rate-buttons {
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 0.5rem;
}

.rate-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border-primary);
  transition: all 0.2s;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
}

.rate-button:hover {
  border-color: var(--color-primary);
}

/* 新的 DPI 设置样式 */
.dpi-settings-new {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.current-dpi-status {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background-color: var(--bg-tertiary);
  border-radius: 0.5rem;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.status-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.status-dpi-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.dpi-levels-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.dpi-level-item {
  background-color: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 0.2s;
}

.dpi-level-item:hover {
  border-color: var(--color-primary);
}

.dpi-level-item.active {
  border-color: var(--color-primary);
  background-color: var(--bg-hover);
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.level-badge {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
}

.level-badge.active {
  background-color: var(--color-primary);
  color: white;
}

.level-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.current-badge {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  background-color: var(--color-primary);
  color: white;
  border-radius: 0.25rem;
  font-weight: 500;
}

.switch-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border-primary);
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.switch-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.switch-btn.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  cursor: default;
}

.switch-btn:disabled {
  opacity: 0.7;
}

.level-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dpi-value-display {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.dpi-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-accent);
}

.dpi-unit {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.slider-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dpi-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--bg-tertiary);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.dpi-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  transition: transform 0.2s;
}

.dpi-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.dpi-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  border: none;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.625rem;
  color: var(--text-tertiary);
}

/* 滚轮方向设置 */
.scroll-direction-settings {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 2px solid var(--border-primary);
  transition: all 0.2s;
  background-color: var(--bg-primary);
}

.checkbox-label:hover {
  border-color: var(--color-primary);
  background-color: var(--bg-tertiary);
}

.checkbox-label.active {
  border-color: var(--color-primary);
  background-color: var(--bg-hover);
}

.checkbox-input {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.checkbox-text {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.checkbox-label.active .checkbox-text {
  color: var(--color-primary);
  font-weight: 600;
}

.scroll-hint {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin: 0;
  padding-left: 0.5rem;
}
</style>
