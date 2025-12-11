<template>
  <div class="backlight-settings">
    <!-- 背光模式 -->
    <div class="mode-card" :class="{ disabled: !supportsRGB }">
      <h3 class="card-title">
        <i class="fa fa-lightbulb-o icon-warning"></i>背光模式
        <span v-if="!supportsRGB" class="unsupported-badge">
          (不支持)
        </span>
      </h3>
      <p class="card-description">选择鼠标的LED背光效果模式</p>

      <div v-if="!supportsRGB" class="empty-state">
        <i class="fa fa-exclamation-circle"></i>
        <p>当前设备不支持背光功能</p>
      </div>

      <div v-else class="mode-list">
        <button
          v-for="mode in backlightModes"
          :key="mode.value"
          @click="handleSetBacklightMode(mode.value)"
          class="mode-button"
          :class="{ 'setting-active': selectedMode === mode.value }"
        >
          <span class="mode-indicator" :class="mode.iconClass"></span>
          <span>{{ mode.label }}</span>
        </button>
      </div>
    </div>

    <!-- 背光颜色和亮度 -->
    <div class="color-card" :class="{ disabled: !supportsRGB }">
      <h3 class="card-title">
        <i class="fa fa-paint-brush icon-primary"></i>背光颜色与亮度
        <span v-if="!supportsRGB" class="unsupported-badge">
          (不支持)
        </span>
      </h3>
      <p class="card-description">自定义鼠标背光的颜色和亮度</p>

      <div v-if="!supportsRGB" class="empty-state large">
        <i class="fa fa-exclamation-circle"></i>
        <p>当前设备不支持背光颜色和亮度设置</p>
      </div>

      <div v-else class="color-settings">
        <!-- 颜色选择 -->
        <div class="color-section">
          <label class="section-label">背光颜色</label>
          <div class="color-presets">
            <button
              v-for="color in presetColors"
              :key="color"
              @click="handleSetColor(color)"
              class="color-preset"
              :style="{ backgroundColor: color }"
            ></button>
          </div>

          <div class="color-input-group">
            <div class="color-preview" :style="{ backgroundColor: selectedColor }"></div>
            <input
              type="text"
              v-model="selectedColor"
              @change="handleSetColor(selectedColor)"
              class="input-control color-text"
              placeholder="十六进制颜色值"
            />
            <input
              type="color"
              v-model="selectedColor"
              @change="handleSetColor(selectedColor)"
              class="color-picker"
            />
          </div>
        </div>

        <!-- 亮度和频率 -->
        <div class="brightness-section">
          <div class="slider-group">
            <div class="slider-header">
              <label class="section-label">亮度</label>
              <span class="slider-value">{{ brightness }}%</span>
            </div>
            <input
              type="range"
              v-model.number="brightness"
              min="0"
              max="100"
              step="5"
              @change="handleSetBrightness"
              class="range-slider"
            />
          </div>

          <div class="slider-group">
            <div class="slider-header">
              <label class="section-label">呼吸频率</label>
              <span class="slider-value">{{ frequencyLabels[frequency - 1] }}</span>
            </div>
            <input
              type="range"
              v-model.number="frequency"
              min="1"
              max="5"
              step="1"
              @change="handleSetFrequency"
              class="range-slider"
            />
            <div class="frequency-labels">
              <span v-for="label in frequencyLabels" :key="label">{{ label }}</span>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="resetBacklight" class="btn-secondary">
            <i class="fa fa-refresh"></i>重置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWebHID } from '../composables/useWebHID'

const { setBacklightMode, setBacklightBrightness, setBacklightFrequency, setBacklightColor, getCurrentProtocol, isConnected } =
  useWebHID()

// 获取设备特性
const deviceFeatures = computed(() => {
  const protocol = getCurrentProtocol()
  return protocol?.features || null
})

// 是否支持 RGB 背光
const supportsRGB = computed(() => {
  return isConnected.value && (deviceFeatures.value?.hasRGB !== false)
})

const backlightModes = [
  { value: 0, label: '常灭', iconClass: 'mode-off' },
  { value: 1, label: '常亮', iconClass: 'mode-on' },
  { value: 2, label: '呼吸', iconClass: 'mode-breathing' },
  { value: 3, label: 'APM模式', iconClass: 'mode-apm' },
  {
    value: 4,
    label: '全光谱',
    iconClass: 'mode-spectrum'
  }
]

const presetColors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#AF52DE']

const frequencyLabels = ['极慢', '慢', '中等', '快', '极快']

const selectedMode = ref(2)
const selectedColor = ref('#165DFF')
const brightness = ref(80)
const frequency = ref(3)

async function handleSetBacklightMode(mode: number) {
  if (!supportsRGB.value) {
    console.warn('当前设备不支持背光设置')
    return
  }

  selectedMode.value = mode
  const result = await setBacklightMode(mode)
  if (!result.success) {
    console.error('设置背光模式失败:', result.message)
  }
}

async function handleSetColor(color: string) {
  if (!supportsRGB.value) {
    console.warn('当前设备不支持背光颜色设置')
    return
  }

  selectedColor.value = color
  const result = await setBacklightColor(color)
  if (!result.success) {
    console.error('设置背光颜色失败:', result.message)
  }
}

async function handleSetBrightness() {
  if (!supportsRGB.value) {
    console.warn('当前设备不支持背光亮度设置')
    return
  }

  const result = await setBacklightBrightness(brightness.value)
  if (!result.success) {
    console.error('设置背光亮度失败:', result.message)
  }
}

async function handleSetFrequency() {
  if (!supportsRGB.value) {
    console.warn('当前设备不支持背光频率设置')
    return
  }

  const result = await setBacklightFrequency(frequency.value)
  if (!result.success) {
    console.error('设置背光频率失败:', result.message)
  }
}

function resetBacklight() {
  brightness.value = 80
  frequency.value = 3
  selectedColor.value = '#165DFF'
  handleSetBrightness()
  handleSetFrequency()
  handleSetColor(selectedColor.value)
}
</script>

<style scoped>
.backlight-settings {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .backlight-settings {
    grid-template-columns: 1fr 2fr;
  }
}

.mode-card,
.color-card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 1.25rem;
}

.mode-card.disabled,
.color-card.disabled {
  opacity: 0.6;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.card-title i {
  margin-right: 0.5rem;
}

.icon-warning {
  color: var(--color-warning);
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
  color: var(--color-gray-medium);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem 0;
  color: #86909c;
}

.empty-state.large {
  padding: 3rem 0;
}

.empty-state i {
  font-size: 1.875rem;
  margin-bottom: 0.5rem;
  display: block;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0;
}

.mode-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mode-button {
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid var(--color-gray-light);
  display: flex;
  align-items: center;
  transition: all 0.2s;
  background-color: white;
  cursor: pointer;
}

.mode-button:hover {
  border-color: var(--color-primary);
}

.mode-indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
  margin-right: 0.75rem;
}

.mode-off {
  background-color: var(--color-gray-medium);
}

.mode-on {
  background-color: white;
  border: 1px solid var(--color-gray-light);
}

.mode-breathing {
  background-color: var(--color-primary);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.mode-apm {
  background-color: var(--color-secondary);
}

.mode-spectrum {
  background: linear-gradient(to right, #ef4444, #34c759, #3b82f6);
}

.color-settings {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .color-settings {
    grid-template-columns: repeat(2, 1fr);
  }
}

.color-section,
.brightness-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-label {
  display: block;
  font-size: 0.875rem;
  color: var(--color-gray-dark);
  margin-bottom: 0.5rem;
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.color-preset {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 9999px;
  transition: transform 0.2s;
  border: none;
  cursor: pointer;
}

.color-preset:hover {
  transform: scale(1.1);
}

.color-input-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.color-preview {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  flex-shrink: 0;
}

.color-text {
  flex: 1;
}

.color-picker {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 0;
  border-radius: 0.375rem;
  cursor: pointer;
}

.slider-group {
  margin-bottom: 1.5rem;
}

.slider-group:last-child {
  margin-bottom: 0;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.slider-value {
  font-size: 0.875rem;
  font-weight: 500;
}

.range-slider {
  width: 100%;
  height: 0.5rem;
  background-color: rgb(243, 244, 246);
  border-radius: 0.5rem;
  appearance: none;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.range-slider::-webkit-slider-thumb {
  appearance: none;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
}

.range-slider::-moz-range-thumb {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  border: none;
}

.frequency-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-gray-medium);
}

.action-buttons {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  grid-column: 1 / -1;
}

.action-buttons button i {
  margin-right: 0.25rem;
}
</style>
