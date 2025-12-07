<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- 回报率设置 -->
    <div class="bg-white rounded-xl shadow-sm p-5 card-hover">
      <h3 class="text-lg font-semibold mb-4 flex items-center">
        <i class="fa fa-refresh text-secondary mr-2"></i>回报率设置
      </h3>
      <p class="text-gray-medium text-sm mb-4">调整鼠标的回报率，更高的回报率提供更流畅的光标移动</p>

      <div class="flex items-center justify-between">
        <div class="flex space-x-2">
          <button
            v-for="rate in reportRates"
            :key="rate"
            @click="handleSetReportRate(rate)"
            class="px-4 py-2 rounded border transition-all duration-200"
            :class="selectedReportRate === rate ? 'setting-active' : 'border-gray-light hover:border-primary'"
          >
            {{ rate }} Hz
          </button>
        </div>
      </div>
    </div>

    <!-- CPI设置 -->
    <div class="bg-white rounded-xl shadow-sm p-5 card-hover">
      <h3 class="text-lg font-semibold mb-4 flex items-center">
        <i class="fa fa-tachometer text-accent mr-2"></i>CPI设置
      </h3>
      <p class="text-gray-medium text-sm mb-4">调整鼠标的灵敏度，CPI值越高，光标移动速度越快</p>

      <div class="space-y-6">
        <!-- 当前CPI档位 -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="text-sm text-gray-dark">当前CPI档位</label>
            <span class="text-sm font-medium">档位 {{ currentCpiLevel }}</span>
          </div>
          <div class="flex items-center">
            <button
              @click="decrementCpiLevel"
              class="btn-secondary w-10 h-10 p-0 flex items-center justify-center"
              :disabled="currentCpiLevel <= 1"
            >
              <i class="fa fa-minus"></i>
            </button>

            <div class="mx-4 flex-1">
              <div class="h-2 bg-gray-100 rounded-full relative">
                <div
                  class="absolute top-0 bottom-0 w-1/7 bg-accent rounded-full transition-all duration-300"
                  :style="{ left: `${((currentCpiLevel - 1) / 6) * 85.7}%` }"
                ></div>
                <div class="absolute top-0 left-0 w-full flex justify-between px-[-8px]">
                  <span
                    v-for="level in 7"
                    :key="level"
                    class="w-3 h-3 rounded-full -mt-0.5"
                    :class="level <= currentCpiLevel ? 'bg-accent' : 'bg-gray-light'"
                  ></span>
                </div>
              </div>
              <div class="flex justify-between mt-1 text-xs text-gray-medium">
                <span v-for="level in 7" :key="level">{{ level }}</span>
              </div>
            </div>

            <button
              @click="incrementCpiLevel"
              class="btn-secondary w-10 h-10 p-0 flex items-center justify-center"
              :disabled="currentCpiLevel >= 7"
            >
              <i class="fa fa-plus"></i>
            </button>
          </div>
        </div>

        <!-- 自定义CPI值 -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="text-sm text-gray-dark">CPI值设置</label>
            <span class="text-sm font-medium">{{ cpiValue }}</span>
          </div>
          <div class="space-y-2">
            <input
              type="range"
              v-model.number="cpiValue"
              min="50"
              max="16000"
              step="50"
              @change="handleSetCPI"
              class="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div class="flex items-center">
              <input
                type="number"
                v-model.number="cpiValue"
                min="50"
                max="16000"
                step="50"
                @change="handleSetCPI"
                class="input-control w-24"
              />
              <span class="mx-2 text-gray-medium">CPI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWebUSB } from '../composables/useWebUSB'

const { setReportRate, setCPI } = useWebUSB()

const reportRates = [125, 250, 500, 1000]
const selectedReportRate = ref(1000)
const currentCpiLevel = ref(4)
const cpiValue = ref(2000)

async function handleSetReportRate(rate: number) {
  selectedReportRate.value = rate
  const result = await setReportRate(rate)
  if (!result.success) {
    console.error('设置回报率失败:', result.message)
  }
}

function incrementCpiLevel() {
  if (currentCpiLevel.value < 7) {
    currentCpiLevel.value++
    handleSetCPI()
  }
}

function decrementCpiLevel() {
  if (currentCpiLevel.value > 1) {
    currentCpiLevel.value--
    handleSetCPI()
  }
}

async function handleSetCPI() {
  const result = await setCPI(currentCpiLevel.value, cpiValue.value)
  if (!result.success) {
    console.error('设置CPI失败:', result.message)
  }
}
</script>
