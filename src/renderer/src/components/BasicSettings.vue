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
import { ref, computed, watch } from 'vue'
import { useWebHID } from '../composables/useWebHID'
import { useI18n } from '../composables/useI18n'

const {
  setReportRate,
  setScrollDirection,
  getCurrentProtocol,
  isConnected,
  deviceStatus,
  connectionMode
} = useWebHID()
const { t } = useI18n()

// 获取设备特性
const deviceFeatures = computed(() => {
  const protocol = getCurrentProtocol()
  return protocol?.features || null
})

// 支持的回报率列表(根据设备特性和连接模式动态调整)
const reportRates = computed(() => {
  const allRates = deviceFeatures.value?.supportedReportRates || [125, 250, 500, 1000]
  return allRates
})

// 是否支持回报率设置
const supportsReportRate = computed(() => {
  return isConnected.value && reportRates.value.length > 0
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

// 监听设备状态变化,回显当前滚轮方向
watch(
  () => deviceStatus.value.scrollDirection,
  (newScroll) => {
    isReverseScroll.value = Number(newScroll) == 0 ? false : true
  },
  { immediate: true }
)

// 监听设备连接状态,初始化选中值,回显当前滚轮方向
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

.icon-secondary {
  color: var(--color-secondary);
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
