<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- 背光模式 -->
    <div class="bg-white rounded-xl shadow-sm p-5 card-hover md:col-span-1" :class="{ 'opacity-60': !supportsRGB }">
      <h3 class="text-lg font-semibold mb-4 flex items-center">
        <i class="fa fa-lightbulb-o text-warning mr-2"></i>背光模式
        <span v-if="!supportsRGB" class="ml-2 text-xs text-red-500 font-normal">
          (不支持)
        </span>
      </h3>
      <p class="text-gray-medium text-sm mb-4">选择鼠标的LED背光效果模式</p>

      <div v-if="!supportsRGB" class="text-center py-8 text-gray-400">
        <i class="fa fa-exclamation-circle text-3xl mb-2"></i>
        <p class="text-sm">当前设备不支持背光功能</p>
      </div>

      <div v-else class="space-y-3">
        <button
          v-for="mode in backlightModes"
          :key="mode.value"
          @click="handleSetBacklightMode(mode.value)"
          class="w-full text-left px-4 py-3 rounded border flex items-center transition-all duration-200"
          :class="
            selectedMode === mode.value
              ? 'setting-active'
              : 'border-gray-light hover:border-primary'
          "
        >
          <span class="w-3 h-3 rounded-full mr-3" :class="mode.iconClass"></span>
          <span>{{ mode.label }}</span>
        </button>
      </div>
    </div>

    <!-- 背光颜色和亮度 -->
    <div class="bg-white rounded-xl shadow-sm p-5 card-hover md:col-span-2" :class="{ 'opacity-60': !supportsRGB }">
      <h3 class="text-lg font-semibold mb-4 flex items-center">
        <i class="fa fa-paint-brush text-primary mr-2"></i>背光颜色与亮度
        <span v-if="!supportsRGB" class="ml-2 text-xs text-red-500 font-normal">
          (不支持)
        </span>
      </h3>
      <p class="text-gray-medium text-sm mb-4">自定义鼠标背光的颜色和亮度</p>

      <div v-if="!supportsRGB" class="text-center py-12 text-gray-400">
        <i class="fa fa-exclamation-circle text-3xl mb-2"></i>
        <p class="text-sm">当前设备不支持背光颜色和亮度设置</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 颜色选择 -->
        <div>
          <label class="block text-sm text-gray-dark mb-2">背光颜色</label>
          <div class="grid grid-cols-6 gap-3 mb-4">
            <button
              v-for="color in presetColors"
              :key="color"
              @click="handleSetColor(color)"
              class="w-full aspect-square rounded-full transition-transform duration-200 hover:scale-110"
              :style="{ backgroundColor: color }"
            ></button>
          </div>

          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full" :style="{ backgroundColor: selectedColor }"></div>
            <input
              type="text"
              v-model="selectedColor"
              @change="handleSetColor(selectedColor)"
              class="input-control flex-1"
              placeholder="十六进制颜色值"
            />
            <input
              type="color"
              v-model="selectedColor"
              @change="handleSetColor(selectedColor)"
              class="w-10 h-10 p-0 border-0 rounded"
            />
          </div>
        </div>

        <!-- 亮度和频率 -->
        <div>
          <div class="mb-6">
            <div class="flex justify-between items-center mb-2">
              <label class="text-sm text-gray-dark">亮度</label>
              <span class="text-sm font-medium">{{ brightness }}%</span>
            </div>
            <input
              type="range"
              v-model.number="brightness"
              min="0"
              max="100"
              step="5"
              @change="handleSetBrightness"
              class="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="text-sm text-gray-dark">呼吸频率</label>
              <span class="text-sm font-medium">{{ frequencyLabels[frequency - 1] }}</span>
            </div>
            <input
              type="range"
              v-model.number="frequency"
              min="1"
              max="5"
              step="1"
              @change="handleSetFrequency"
              class="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div class="flex justify-between mt-1 text-xs text-gray-medium">
              <span v-for="label in frequencyLabels" :key="label">{{ label }}</span>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button @click="resetBacklight" class="btn-secondary">
            <i class="fa fa-refresh mr-1"></i>重置
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
  { value: 0, label: '常灭', iconClass: 'bg-gray-medium' },
  { value: 1, label: '常亮', iconClass: 'bg-white border border-gray-light' },
  { value: 2, label: '呼吸', iconClass: 'bg-primary animate-pulse' },
  { value: 3, label: 'APM模式', iconClass: 'bg-secondary' },
  {
    value: 4,
    label: '全光谱',
    iconClass: 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500'
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
