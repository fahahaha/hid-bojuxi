<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- 回报率设置 -->
    <div class="bg-white rounded-xl shadow-sm p-5 card-hover" :class="{ 'opacity-60': !supportsReportRate }">
      <h3 class="text-lg font-semibold mb-4 flex items-center">
        <i class="fa fa-refresh text-secondary mr-2"></i>回报率设置
        <span v-if="!supportsReportRate" class="ml-2 text-xs text-red-500 font-normal">
          (不支持)
        </span>
      </h3>
      <p class="text-gray-medium text-sm mb-4">
        调整鼠标的回报率，更高的回报率提供更流畅的光标移动
      </p>

      <div v-if="!supportsReportRate" class="text-center py-4 text-gray-400">
        <i class="fa fa-exclamation-circle text-2xl mb-2"></i>
        <p class="text-sm">当前设备不支持回报率设置功能</p>
      </div>

      <div v-else class="flex items-center justify-between">
        <div class="flex space-x-2">
          <button
            v-for="rate in reportRates"
            :key="rate"
            @click="handleSetReportRate(rate)"
            class="px-4 py-2 rounded border transition-all duration-200"
            :class="
              selectedReportRate === rate
                ? 'setting-active'
                : 'border-gray-light hover:border-primary'
            "
          >
            {{ rate }} Hz
          </button>
        </div>
      </div>
    </div>

    <!-- DPI设置 -->
    <div class="bg-white rounded-xl shadow-sm p-5 card-hover" :class="{ 'opacity-60': !supportsDPI }">
      <h3 class="text-lg font-semibold mb-4 flex items-center">
        <i class="fa fa-tachometer text-accent mr-2"></i>DPI 设置
        <span v-if="!supportsDPI" class="ml-2 text-xs text-red-500 font-normal">
          (不支持)
        </span>
      </h3>
      <p class="text-gray-medium text-sm mb-4">
        调整鼠标的灵敏度，DPI 值越高，光标移动速度越快
        <span v-if="supportedDPI.length > 0" class="text-xs text-gray-400">
          (支持 {{ supportedDPI.length }} 档)
        </span>
      </p>

      <div v-if="!supportsDPI" class="text-center py-4 text-gray-400">
        <i class="fa fa-exclamation-circle text-2xl mb-2"></i>
        <p class="text-sm">当前设备不支持 DPI 设置功能</p>
      </div>

      <div v-else class="space-y-4">
        <!-- DPI 档位选择 -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="text-sm text-gray-dark">DPI 档位</label>
            <span class="text-sm font-medium text-accent">{{ selectedDPI }} DPI</span>
          </div>

          <select
            v-model.number="selectedDPI"
            @change="handleSetDPI"
            class="w-full px-4 py-3 border border-gray-light rounded-lg focus:outline-none focus:border-primary transition-colors duration-200 cursor-pointer hover:border-primary"
          >
            <option
              v-for="option in dpiOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- 当前状态显示 -->
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <i class="fa fa-info-circle text-primary mr-2"></i>
              <span class="text-sm text-gray-dark">当前 DPI</span>
            </div>
            <span class="text-lg font-semibold text-primary">{{ deviceStatus.dpi }} DPI</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useWebHID } from '../composables/useWebHID'

const { setReportRate, setDPI, getCurrentProtocol, isConnected, deviceStatus } = useWebHID()

// 获取设备特性
const deviceFeatures = computed(() => {
  const protocol = getCurrentProtocol()
  return protocol?.features || null
})

// 支持的回报率列表（根据设备特性动态调整）
const reportRates = computed(() => {
  return deviceFeatures.value?.supportedReportRates || [125, 250, 500, 1000]
})

// 支持的 DPI 档位列表
const supportedDPI = computed(() => {
  return deviceFeatures.value?.supportedDPI || []
})

// DPI 选项列表（用于下拉选择）
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

const selectedReportRate = ref(1000)
const selectedDPI = ref(2000)

// 监听设备状态变化，回显当前 DPI
watch(() => deviceStatus.value.dpi, (newDPI) => {
  if (newDPI && newDPI !== '--') {
    selectedDPI.value = parseInt(newDPI)
  }
}, { immediate: true })

// 监听设备连接状态，初始化选中值
watch(isConnected, (connected) => {
  if (connected && deviceStatus.value.dpi !== '--') {
    selectedDPI.value = parseInt(deviceStatus.value.dpi)
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
</script>
