<template>
  <div class="dpi-settings">
    <div class="settings-card" :class="{ disabled: !supportsDPI }">
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

      <div v-else class="dpi-settings-content">
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
  </div>
</template>

<script setup lang="ts">
import { computed, watch, reactive } from 'vue'
import { useWebHID } from '../composables/useWebHID'
import { useI18n } from '../composables/useI18n'

const { setDPI, setDPILevelValue, isConnected, deviceStatus } = useWebHID()
const { t } = useI18n()

// DPI 范围配置
const dpiMin = 50
const dpiMax = 16000
const dpiStep = 50

// 本地 DPI 值（用于滑动条实时显示）
const localDpiValues = reactive<Record<number, number>>({})

// DPI 档位列表
const dpiLevels = computed(() => deviceStatus.value.dpiLevels || [])

// 当前 DPI 档位
const currentDpiLevel = computed(() => deviceStatus.value.dpiLevel || 0)

// 是否支持 DPI 设置
const supportsDPI = computed(() => isConnected.value && dpiLevels.value.length > 0)

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

// 切换 DPI 档位
async function handleSwitchDpiLevel(levelIndex: number) {
  if (!supportsDPI.value) return
  const result = await setDPI(levelIndex + 1, dpiLevels.value[levelIndex])
  if (!result.success) {
    console.error('切换 DPI 档位失败:', result.message)
  }
}

// 滑动条输入时实时更新本地值
function handleDpiSliderInput(levelIndex: number, event: Event) {
  const target = event.target as HTMLInputElement
  localDpiValues[levelIndex] = parseInt(target.value)
}

// 滑动条释放时发送命令
async function handleDpiSliderChange(levelIndex: number, event: Event) {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value)
  if (!supportsDPI.value) return
  const result = await setDPILevelValue(levelIndex, value)
  if (!result.success) {
    console.error('设置 DPI 值失败:', result.message)
    localDpiValues[levelIndex] = dpiLevels.value[levelIndex]
  }
}
</script>

<style scoped>
.dpi-settings {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.settings-card {
  background-color: var(--bg-primary);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-sm);
  padding: 1.25rem;
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

.icon-accent {
  color: var(--color-accent);
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

.dpi-settings-content {
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
</style>
