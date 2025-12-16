<template>
  <div class="basic-settings">
    <!-- 回报率设置 -->
    <div class="settings-card" :class="{ disabled: !supportsReportRate }">
      <h3 class="card-title">
        <i class="fa fa-refresh icon-secondary"></i>回报率设置
        <span v-if="!supportsReportRate" class="unsupported-badge"> (不支持) </span>
      </h3>
      <p class="card-description">调整鼠标的回报率,更高的回报率提供更流畅的光标移动</p>

      <div v-if="!supportsReportRate" class="empty-state">
        <i class="fa fa-exclamation-circle"></i>
        <p>当前设备不支持回报率设置功能</p>
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
    <div class="settings-card" :class="{ disabled: !supportsDPI }">
      <h3 class="card-title">
        <i class="fa fa-tachometer icon-accent"></i>DPI 设置
        <span v-if="!supportsDPI" class="unsupported-badge"> (不支持) </span>
      </h3>
      <p class="card-description">
        调整鼠标的灵敏度,DPI 值越高,光标移动速度越快
        <span v-if="supportedDPI.length > 0" class="dpi-count">
          (支持 {{ supportedDPI.length }} 档)
        </span>
      </p>

      <div v-if="!supportsDPI" class="empty-state">
        <i class="fa fa-exclamation-circle"></i>
        <p>当前设备不支持 DPI 设置功能</p>
      </div>

      <div v-else class="dpi-settings">
        <!-- DPI 档位选择 -->
        <div class="dpi-selector">
          <div class="selector-header">
            <label class="selector-label">DPI 档位</label>
            <span class="selector-value">{{ selectedDPI }} DPI</span>
          </div>

          <select v-model.number="selectedDPI" @change="handleSetDPI" class="dpi-select">
            <option v-for="option in dpiOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- 当前状态显示 -->
        <div class="current-status">
          <div class="status-row">
            <div class="status-left">
              <i class="fa fa-info-circle icon-primary"></i>
              <span>当前 DPI</span>
            </div>
            <span class="status-dpi">{{ deviceStatus.dpi }} DPI</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 滚轮方向设置 -->
    <div class="settings-card" :class="{ disabled: !supportedScrollDirection }">
      <h3 class="card-title">
        <i class="fa fa-arrows-v icon-primary"></i>滚轮方向设置
        <span v-if="!supportedScrollDirection" class="unsupported-badge"> (不支持) </span>
      </h3>
      <p class="card-description">设置鼠标滚轮的滚动方向</p>

      <div v-if="!supportedScrollDirection" class="empty-state">
        <i class="fa fa-exclamation-circle"></i>
        <p>当前设备不支持滚轮方向设置功能</p>
      </div>

      <div v-else class="scroll-direction-settings">
        <label class="checkbox-label" :class="{ active: !isReverseScroll }">
          <input
            type="checkbox"
            :checked="!isReverseScroll"
            @change="handleSetNormalScroll"
            class="checkbox-input"
          />
          <span class="checkbox-text">正向</span>
        </label>
        <label class="checkbox-label" :class="{ active: isReverseScroll }">
          <input
            type="checkbox"
            :checked="isReverseScroll"
            @change="handleSetReverseScroll"
            class="checkbox-input"
          />
          <span class="checkbox-text">反向</span>
        </label>
        <p class="scroll-hint">
          {{ isReverseScroll ? '滚轮向下滚动时页面向上移动' : '滚轮向下滚动时页面向下移动' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useWebHID } from '../composables/useWebHID'

const { setReportRate, setDPI, setScrollDirection, getCurrentProtocol, isConnected, deviceStatus } =
  useWebHID()

// 获取设备特性
const deviceFeatures = computed(() => {
  const protocol = getCurrentProtocol()
  return protocol?.features || null
})

// 支持的回报率列表(根据设备特性动态调整)
const reportRates = computed(() => {
  return deviceFeatures.value?.supportedReportRates || [125, 250, 500, 1000]
})

// 支持的 DPI 档位列表
const supportedDPI = computed(() => {
  return deviceFeatures.value?.supportedDPI || []
})

// DPI 选项列表(用于下拉选择)
const dpiOptions = computed(() => {
  return supportedDPI.value.map((dpi, index) => ({
    label: `档位 ${index + 1} - ${dpi} DPI`,
    value: dpi,
    level: index + 1
  }))
})

// 是否支持回报率设置
const supportsReportRate = computed(() => {
  return isConnected.value && reportRates.value.length > 0
})

// 是否支持 DPI 设置
const supportsDPI = computed(() => {
  return isConnected.value && supportedDPI.value.length > 0
})

// 是否支持滚轮方向设置
const supportedScrollDirection = computed(() => {
  return isConnected.value && deviceFeatures.value?.hasScrollDirection !== false
})

const selectedReportRate = ref(1000)
const selectedDPI = ref(2000)
const isReverseScroll = ref(false)

// 监听设备状态变化,回显当前 DPI
watch(
  () => deviceStatus.value.dpi,
  (newDPI) => {
    if (newDPI && newDPI !== '--') {
      selectedDPI.value = parseInt(newDPI)
    }
  },
  { immediate: true }
)

// 监听设备连接状态,初始化选中值
watch(isConnected, (connected) => {
  if (connected && deviceStatus.value.dpi !== '--') {
    selectedDPI.value = parseInt(deviceStatus.value.dpi)
  }
})

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

async function handleSetDPI() {
  if (!supportsDPI.value) {
    console.warn('当前设备不支持 DPI 设置')
    return
  }

  // 找到对应的档位
  const dpiIndex = supportedDPI.value.indexOf(selectedDPI.value)
  if (dpiIndex === -1) {
    console.error('无效的 DPI 值')
    return
  }

  const level = dpiIndex + 1
  const result = await setDPI(level, selectedDPI.value)
  if (!result.success) {
    console.error('设置 DPI 失败:', result.message)
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
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
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
  color: var(--color-gray-medium);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.dpi-count {
  font-size: 0.75rem;
  color: #86909c;
}

.empty-state {
  text-align: center;
  padding: 1rem 0;
  color: #86909c;
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
  justify-content: space-between;
  gap: 0.5rem;
}

.rate-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid var(--color-gray-light);
  transition: all 0.2s;
  background-color: white;
  cursor: pointer;
}

.rate-button:hover {
  border-color: var(--color-primary);
}

.dpi-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dpi-selector {
  flex: 1;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.selector-label {
  font-size: 0.875rem;
  color: var(--color-gray-dark);
}

.selector-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-accent);
}

.dpi-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-gray-light);
  border-radius: 0.5rem;
  outline: none;
  transition: all 0.2s;
  cursor: pointer;
}

.dpi-select:focus {
  border-color: var(--color-primary);
}

.dpi-select:hover {
  border-color: var(--color-primary);
}

.current-status {
  background-color: rgb(249, 250, 251);
  border-radius: 0.5rem;
  padding: 1rem;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-left span {
  font-size: 0.875rem;
  color: var(--color-gray-dark);
}

.status-dpi {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-primary);
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
  border: 2px solid var(--color-gray-light);
  transition: all 0.2s;
  background-color: white;
}

.checkbox-label:hover {
  border-color: var(--color-primary);
  background-color: rgb(249, 250, 251);
}

.checkbox-label.active {
  border-color: var(--color-primary);
  background-color: rgba(22, 93, 255, 0.05);
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
  color: var(--color-dark);
}

.checkbox-label.active .checkbox-text {
  color: var(--color-primary);
  font-weight: 600;
}

.scroll-hint {
  font-size: 0.875rem;
  color: var(--color-gray-medium);
  margin: 0;
  padding-left: 0.5rem;
}
</style>
