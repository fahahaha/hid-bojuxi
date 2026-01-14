<template>
  <div class="performance-settings">
    <!-- 模块 A: 移动修正设置 -->
    <div class="settings-card">
      <h3 class="card-title">
        <i class="fa fa-crosshairs icon-primary"></i>{{ t('performanceSettings.tracking.title') }}
      </h3>
      <p class="card-description">{{ t('performanceSettings.tracking.description') }}</p>

      <div class="settings-list">
        <!-- 移动同步 -->
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-title">{{ t('performanceSettings.tracking.motionSync.title') }}</span>
            <span class="setting-desc">{{ t('performanceSettings.tracking.motionSync.description') }}</span>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="motionSync" @change="handleMotionSyncChange" />
            <span class="slider"></span>
          </label>
        </div>

        <!-- 直线修正 -->
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-title">{{ t('performanceSettings.tracking.angleSnapping.title') }}</span>
            <span class="setting-desc">{{ t('performanceSettings.tracking.angleSnapping.description') }}</span>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="angleSnapping" @change="handleAngleSnappingChange" />
            <span class="slider"></span>
          </label>
        </div>

        <!-- 波纹修正 -->
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-title">{{ t('performanceSettings.tracking.rippleControl.title') }}</span>
            <span class="setting-desc">{{ t('performanceSettings.tracking.rippleControl.description') }}</span>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="rippleControl" @change="handleRippleControlChange" />
            <span class="slider"></span>
          </label>
        </div>

        <!-- 超远距离模式 -->
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-title">{{ t('performanceSettings.tracking.longRangeMode.title') }}</span>
            <span class="setting-desc">{{ t('performanceSettings.tracking.longRangeMode.description') }}</span>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="longRangeMode" @change="handleLongRangeModeChange" />
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </div>

    <!-- 模块 B: LOD静默高度 + 按键防抖延迟 -->
    <div class="combined-card">
      <div class="settings-card">
        <!-- LOD 静默高度 -->
        <div class="combined-section">
          <h3 class="card-title">
            <i class="fa fa-arrows-v icon-warning"></i>{{ t('performanceSettings.lod.title') }}
          </h3>
          <p class="card-description">{{ t('performanceSettings.lod.description') }}</p>

          <div class="lod-content">
            <div class="lod-buttons">
              <button
                class="lod-button"
                :class="{ active: lodHeight === 1 }"
                @click="handleLodChange(1)"
              >
                1mm
              </button>
              <button
                class="lod-button"
                :class="{ active: lodHeight === 2 }"
                @click="handleLodChange(2)"
              >
                2mm
              </button>
            </div>

            <div class="lod-illustration">
              <svg viewBox="0 0 140 70" class="lod-svg">
                <path
                  d="M 25 45 Q 25 20 50 15 Q 80 12 100 20 Q 115 28 115 45 L 115 48 Q 115 52 100 52 L 30 52 Q 25 52 25 48 Z"
                  fill="var(--bg-tertiary)"
                  stroke="var(--text-secondary)"
                  stroke-width="2"
                />
                <path
                  d="M 30 45 Q 30 25 55 18 Q 75 15 90 20"
                  fill="none"
                  stroke="var(--text-tertiary)"
                  stroke-width="1"
                />
                <circle cx="70" cy="52" r="3" fill="var(--color-primary)" class="sensor-glow" />
                <line
                  x1="70"
                  y1="55"
                  x2="70"
                  :y2="lodHeight === 1 ? 60 : 65"
                  stroke="var(--color-primary)"
                  stroke-width="2"
                  stroke-dasharray="3,2"
                  class="lod-line"
                />
                <g class="lod-marker">
                  <line x1="125" y1="55" x2="125" :y2="lodHeight === 1 ? 60 : 65" stroke="var(--color-primary)" stroke-width="1" />
                  <line x1="122" y1="55" x2="128" y2="55" stroke="var(--color-primary)" stroke-width="1" />
                  <line x1="122" :y1="lodHeight === 1 ? 60 : 65" x2="128" :y2="lodHeight === 1 ? 60 : 65" stroke="var(--color-primary)" stroke-width="1" />
                  <text x="132" :y="lodHeight === 1 ? 59 : 62" class="lod-text-right">{{ lodHeight }}mm</text>
                </g>
                <line
                  x1="10"
                  :y1="lodHeight === 1 ? 60 : 65"
                  x2="120"
                  :y2="lodHeight === 1 ? 60 : 65"
                  stroke="var(--text-secondary)"
                  stroke-width="2"
                />
                <line x1="15" :y1="lodHeight === 1 ? 63 : 68" x2="30" :y2="lodHeight === 1 ? 63 : 68" stroke="var(--text-tertiary)" stroke-width="1" opacity="0.4" />
                <line x1="40" :y1="lodHeight === 1 ? 63 : 68" x2="65" :y2="lodHeight === 1 ? 63 : 68" stroke="var(--text-tertiary)" stroke-width="1" opacity="0.4" />
                <line x1="75" :y1="lodHeight === 1 ? 63 : 68" x2="95" :y2="lodHeight === 1 ? 63 : 68" stroke="var(--text-tertiary)" stroke-width="1" opacity="0.4" />
                <line x1="105" :y1="lodHeight === 1 ? 63 : 68" x2="115" :y2="lodHeight === 1 ? 63 : 68" stroke="var(--text-tertiary)" stroke-width="1" opacity="0.4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div class="settings-card">
        <!-- 按键防抖延迟 -->
        <div class="combined-section">
          <h3 class="card-title">
            <i class="fa-solid fa-hand-pointer icon-secondary"></i>{{ t('performanceSettings.debounce.title') }}
          </h3>
          <p class="card-description">{{ t('performanceSettings.debounce.description') }}</p>

          <div class="segmented-buttons">
            <button
              v-for="delay in debounceDelays"
              :key="delay.value"
              @click="handleDebounceChange(delay.value)"
              class="segment-button"
              :class="{ active: debounceDelay === delay.value }"
            >
              {{ delay.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 模块 C: 休眠时间设置 -->
    <div class="settings-card sleep-card">
      <h3 class="card-title">
        <i class="fa-solid fa-moon icon-accent"></i>{{ t('performanceSettings.sleep.title') }}
      </h3>
      <p class="card-description">{{ t('performanceSettings.sleep.description') }}</p>

      <div class="sleep-slider-container">
        <!-- 当前值显示 -->
        <div class="sleep-value-display">
          <span class="sleep-value">{{ formatSleepTime(sleepTime) }}</span>
        </div>

        <!-- 滑块轨道 -->
        <div class="sleep-slider-wrapper">
          <div class="sleep-slider-track">
            <!-- 进度条填充 -->
            <div class="sleep-slider-fill" :style="{ width: sleepProgress + '%' }"></div>
            <!-- 刻度点 -->
            <div
              v-for="(time, index) in sleepTimes"
              :key="time.value"
              class="sleep-tick"
              :class="{ active: sleepTimeIndex >= index }"
              :style="{ left: (index / (sleepTimes.length - 1)) * 100 + '%' }"
              @click="handleSleepTimeChange(time.value)"
            ></div>
          </div>
          <!-- 滑块 -->
          <input
            type="range"
            class="sleep-slider"
            :min="0"
            :max="sleepTimes.length - 1"
            :value="sleepTimeIndex"
            @input="handleSleepSliderInput"
          />
        </div>

        <!-- 刻度标签 -->
        <div class="sleep-labels">
          <span
            v-for="(time, index) in sleepTimes"
            :key="time.value"
            class="sleep-label"
            :class="{ active: sleepTimeIndex === index }"
            :style="{ left: (index / (sleepTimes.length - 1)) * 100 + '%' }"
            @click="handleSleepTimeChange(time.value)"
          >
            {{ time.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- 模块 D: 传感器旋转 -->
    <div class="settings-card sensor-rotation-card">
      <h3 class="card-title">
        <i class="fa fa-compass icon-primary"></i>{{ t('performanceSettings.sensorRotation.title') }}
      </h3>
      <p class="card-description">{{ t('performanceSettings.sensorRotation.description') }}</p>

      <div class="sensor-rotation-content">
        <!-- 开关 -->
        <div class="setting-item rotation-toggle">
          <div class="setting-info">
            <span class="setting-title">{{ t('performanceSettings.sensorRotation.enable') }}</span>
            <span class="setting-desc">{{ t('performanceSettings.sensorRotation.enableDesc') }}</span>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="sensorRotationEnabled" @change="handleSensorRotationToggle" />
            <span class="slider"></span>
          </label>
        </div>

        <!-- 角度旋转表盘 -->
        <div class="rotation-dial-container" :class="{ disabled: !sensorRotationEnabled }">
          <div class="dial-wrapper">
            <!-- 左箭头 -->
            <button
              class="dial-arrow dial-arrow-left"
              @click="decreaseAngle"
              :disabled="!sensorRotationEnabled || rotationAngle <= -30"
            >
              <i class="fa fa-chevron-left"></i>
            </button>

            <!-- 表盘 -->
            <div class="dial">
              <svg viewBox="0 0 200 120" class="dial-svg">
                <!-- 背景弧线 -->
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="var(--bg-tertiary)"
                  stroke-width="8"
                  stroke-linecap="round"
                />
                <!-- 刻度线 -->
                <g class="dial-ticks">
                  <!-- -30° -->
                  <line x1="28" y1="85" x2="35" y2="78" stroke="var(--text-tertiary)" stroke-width="2" />
                  <!-- -20° -->
                  <line x1="40" y1="60" x2="48" y2="56" stroke="var(--text-tertiary)" stroke-width="2" />
                  <!-- -10° -->
                  <line x1="62" y1="40" x2="70" y2="38" stroke="var(--text-tertiary)" stroke-width="2" />
                  <!-- 0° -->
                  <line x1="100" y1="28" x2="100" y2="38" stroke="var(--color-primary)" stroke-width="3" />
                  <!-- +10° -->
                  <line x1="138" y1="40" x2="130" y2="38" stroke="var(--text-tertiary)" stroke-width="2" />
                  <!-- +20° -->
                  <line x1="160" y1="60" x2="152" y2="56" stroke="var(--text-tertiary)" stroke-width="2" />
                  <!-- +30° -->
                  <line x1="172" y1="85" x2="165" y2="78" stroke="var(--text-tertiary)" stroke-width="2" />
                </g>
                <!-- 刻度标签 -->
                <text x="15" y="105" class="dial-label">-30°</text>
                <text x="100" y="18" class="dial-label dial-label-center">0°</text>
                <text x="175" y="105" class="dial-label">+30°</text>
                <!-- 指示球 -->
                <circle
                  :cx="indicatorX"
                  :cy="indicatorY"
                  r="10"
                  class="dial-indicator"
                  :class="{ active: sensorRotationEnabled }"
                />
              </svg>
              <!-- 当前角度显示 -->
              <div class="dial-value">
                <span class="angle-value">{{ rotationAngle > 0 ? '+' : '' }}{{ rotationAngle }}°</span>
              </div>
            </div>

            <!-- 右箭头 -->
            <button
              class="dial-arrow dial-arrow-right"
              @click="increaseAngle"
              :disabled="!sensorRotationEnabled || rotationAngle >= 30"
            >
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../composables/useI18n'

const { t } = useI18n()

// 模块 A: 移动修正设置
const motionSync = ref(false)
const angleSnapping = ref(false)
const rippleControl = ref(false)
const longRangeMode = ref(false)

// 模块 B: 按键防抖延迟
const debounceDelay = ref(4)
const debounceDelays = computed(() => [
  { value: 0, label: '0ms' },
  { value: 1, label: '1ms' },
  { value: 2, label: '2ms' },
  { value: 4, label: '4ms' },
  { value: 8, label: '8ms' },
  { value: 15, label: '15ms' },
  { value: 20, label: '20ms' }
])

// 模块 C: 休眠时间设置
const sleepTime = ref(180) // 默认 3min = 180s
const sleepTimes = computed(() => [
  { value: 30, label: '30s' },
  { value: 60, label: '1min' },
  { value: 120, label: '2min' },
  { value: 180, label: '3min' },
  { value: 300, label: '5min' },
  { value: 600, label: '10min' },
  { value: 1200, label: '20min' },
  { value: 1800, label: '30min' }
])

// 当前休眠时间在数组中的索引
const sleepTimeIndex = computed(() => {
  const index = sleepTimes.value.findIndex((t) => t.value === sleepTime.value)
  return index >= 0 ? index : 0
})

// 进度条百分比
const sleepProgress = computed(() => {
  return (sleepTimeIndex.value / (sleepTimes.value.length - 1)) * 100
})

// 格式化休眠时间显示
function formatSleepTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}${t('performanceSettings.sleep.seconds')}`
  } else {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}${t('performanceSettings.sleep.minutes')}`
  }
}

// 模块 D: LOD 静默高度
const lodHeight = ref(1)

// 模块 E: 传感器旋转
const sensorRotationEnabled = ref(false)
const rotationAngle = ref(0)

// 计算指示球位置
const indicatorX = computed(() => {
  // 角度范围 -30 到 +30，映射到弧线上
  // 弧线从 (20, 100) 到 (180, 100)，圆心在 (100, 100)，半径 80
  const angleRad = ((rotationAngle.value + 30) / 60) * Math.PI // 0 到 PI
  const x = 100 - 80 * Math.cos(angleRad)
  return x
})

const indicatorY = computed(() => {
  const angleRad = ((rotationAngle.value + 30) / 60) * Math.PI
  const y = 100 - 80 * Math.sin(angleRad)
  return y
})

// 处理函数 - 模块 A
function handleMotionSyncChange() {
  console.log('Motion Sync:', motionSync.value)
  // TODO: 发送命令到设备
}

function handleAngleSnappingChange() {
  console.log('Angle Snapping:', angleSnapping.value)
  // TODO: 发送命令到设备
}

function handleRippleControlChange() {
  console.log('Ripple Control:', rippleControl.value)
  // TODO: 发送命令到设备
}

function handleLongRangeModeChange() {
  console.log('Long Range Mode:', longRangeMode.value)
  // TODO: 发送命令到设备
}

// 处理函数 - 模块 B
function handleDebounceChange(value: number) {
  debounceDelay.value = value
  console.log('Debounce Delay:', value)
  // TODO: 发送命令到设备
}

// 处理函数 - 模块 C
function handleSleepTimeChange(value: number) {
  sleepTime.value = value
  console.log('Sleep Time:', value)
  // TODO: 发送命令到设备
}

function handleSleepSliderInput(event: Event) {
  const target = event.target as HTMLInputElement
  const index = parseInt(target.value)
  sleepTime.value = sleepTimes.value[index].value
  console.log('Sleep Time:', sleepTime.value)
  // TODO: 发送命令到设备
}

// 处理函数 - 模块 D
function handleLodChange(value: number) {
  lodHeight.value = value
  console.log('LOD Height:', lodHeight.value)
  // TODO: 发送命令到设备
}

// 处理函数 - 模块 E
function handleSensorRotationToggle() {
  console.log('Sensor Rotation Enabled:', sensorRotationEnabled.value)
  if (!sensorRotationEnabled.value) {
    rotationAngle.value = 0
  }
  // TODO: 发送命令到设备
}

function decreaseAngle() {
  if (rotationAngle.value > -30) {
    rotationAngle.value -= 1
    handleRotationAngleChange()
  }
}

function increaseAngle() {
  if (rotationAngle.value < 30) {
    rotationAngle.value += 1
    handleRotationAngleChange()
  }
}

function handleRotationAngleChange() {
  console.log('Rotation Angle:', rotationAngle.value)
  // TODO: 发送命令到设备
}
</script>

<style scoped>
.performance-settings {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .performance-settings {
    grid-template-columns: repeat(2, 1fr);
  }
}

.settings-card {
  background-color: var(--bg-primary);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-sm);
  padding: 1.25rem;
}

.settings-card.sensor-rotation-card {
  grid-column: 1 / -1;
}

.settings-card.sleep-card {
  grid-column: 1 / -1;
}

/* 合并卡片样式 */
.combined-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
}
.combined-card .settings-card{
  flex: 1;
}
.combined-section {
  flex: 1;
}

.combined-divider {
  height: 1px;
  background-color: var(--border-primary);
  margin: 1rem 0;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  color: var(--text-primary);
}

.card-title i {
  margin-right: 0.5rem;
}

.icon-primary {
  color: var(--color-primary);
}

.icon-secondary {
  color: var(--color-secondary);
}

.icon-accent {
  color: var(--color-accent);
}

.icon-warning {
  color: var(--color-warning);
}

.card-description {
  color: var(--text-tertiary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

/* 设置列表样式 */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: var(--bg-secondary);
  border-radius: 0.5rem;
  border: 1px solid var(--border-primary);
  transition: all 0.2s;
}

.setting-item:hover {
  border-color: var(--color-primary);
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  margin-right: 1rem;
}

.setting-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
}

.setting-desc {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  line-height: 1.4;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-tertiary);
  transition: 0.3s;
  border-radius: 26px;
}

.switch .slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switch input:checked + .slider {
  background-color: var(--color-primary);
}

.switch input:checked + .slider:before {
  transform: translateX(22px);
}

/* 分段按钮样式 */
.segmented-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.segment-button {
  padding: 0.5rem 0.875rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border-primary);
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.segment-button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.segment-button.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

/* 休眠时间滑块样式 */
.sleep-slider-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 80%;
}

.sleep-value-display {
  text-align: start;
}

.sleep-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-accent);
}

.sleep-slider-wrapper {
  position: relative;
  height: 24px;
  padding: 0 8px;
}

.sleep-slider-track {
  position: absolute;
  top: 50%;
  left: 8px;
  right: 8px;
  height: 6px;
  background-color: var(--bg-tertiary);
  border-radius: 3px;
  transform: translateY(-50%);
}

.sleep-slider-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: var(--color-accent);
  border-radius: 3px;
  transition: width 0.15s ease;
}

.sleep-tick {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background-color: var(--bg-tertiary);
  border: 2px solid var(--border-primary);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.2s;
  z-index: 1;
}

.sleep-tick:hover {
  border-color: var(--color-accent);
  transform: translate(-50%, -50%) scale(1.2);
}

.sleep-tick.active {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
}

.sleep-slider {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
  -webkit-appearance: none;
  appearance: none;
}

.sleep-labels {
  position: relative;
  height: 20px;
  margin: 0 8px;
}

.sleep-label {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.sleep-label:hover {
  color: var(--color-accent);
}

.sleep-label.active {
  color: var(--color-accent);
  font-weight: 600;
}

/* LOD 静默高度样式 */
.lod-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.lod-buttons {
  display: flex;
  gap: 0.5rem;
}

.lod-button {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border-primary);
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.lod-button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.lod-button.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.lod-illustration {
  flex: 1;
  display: flex;
  justify-content: center;
}

.lod-svg {
  width: 160px;
  height: auto;
}

.lod-text {
  font-size: 8px;
  fill: var(--text-tertiary);
  text-anchor: end;
}

.lod-text-right {
  font-size: 9px;
  fill: var(--color-primary);
  text-anchor: start;
  font-weight: 500;
}

.sensor-glow {
  filter: drop-shadow(0 0 3px var(--color-primary));
}

.lod-line {
  transition: all 0.3s ease;
}

/* 传感器旋转样式 */
.sensor-rotation-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .sensor-rotation-content {
    flex-direction: row;
    align-items: flex-start;
  }
}

.rotation-toggle {
  flex: 1;
  max-width: 400px;
}

.rotation-dial-container {
  flex: 1;
  display: flex;
  justify-content: center;
  transition: opacity 0.3s;
}

.rotation-dial-container.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.dial-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dial-arrow {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-primary);
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.dial-arrow:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--bg-hover);
}

.dial-arrow:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dial {
  position: relative;
  width: 200px;
  height: 140px;
}

.dial-svg {
  width: 100%;
  height: 100%;
}

.dial-label {
  font-size: 12px;
  fill: var(--text-tertiary);
  text-anchor: middle;
}

.dial-label-center {
  fill: var(--color-primary);
  font-weight: 600;
}

.dial-indicator {
  fill: var(--bg-tertiary);
  stroke: var(--border-primary);
  stroke-width: 2;
  transition: all 0.2s;
}

.dial-indicator.active {
  fill: var(--color-primary);
  stroke: var(--color-primary);
}

.dial-value {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.angle-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}
</style>
