<template>
  <div class="bg-white rounded-xl shadow-sm p-5 mb-6">
    <h3 class="text-lg font-semibold mb-4 flex items-center">
      <i class="fa fa-keyboard-o text-primary mr-2"></i>鼠标按键自定义
    </h3>
    <p class="text-gray-medium text-sm mb-6">自定义鼠标各按键的功能，可设置为单键、组合键、宏或其他功能</p>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 鼠标按键示意图 -->
      <div class="lg:col-span-1 flex justify-center items-center">
        <div class="relative w-64 h-96 bg-gray-100 rounded-full p-4">
          <!-- 鼠标主体 -->
          <div class="absolute inset-4 bg-gray-200 rounded-full overflow-hidden">
            <!-- 按键标记 -->
            <button
              v-for="(button, index) in buttons"
              :key="index"
              @click="selectButton(index)"
              class="button-marker absolute rounded-md flex items-center justify-center cursor-pointer transition-colors"
              :class="selectedButton === index ? 'bg-primary/30' : 'bg-primary/20 hover:bg-primary/25'"
              :style="button.style"
            >
              <span class="text-xs font-medium">{{ index + 1 }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 按键功能设置 -->
      <div class="lg:col-span-2">
        <div class="border rounded-xl p-5">
          <div class="flex justify-between items-center mb-4">
            <h4 class="font-medium">{{ buttonNames[selectedButton] }}</h4>
            <button @click="resetButton" class="text-sm text-gray-medium hover:text-primary transition-colors">
              <i class="fa fa-refresh mr-1"></i>恢复默认
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-dark mb-2">功能类型</label>
              <select v-model="functionType" class="input-control w-full">
                <option value="normal">默认功能</option>
                <option value="single">单键</option>
                <option value="combination">组合键</option>
                <option value="macro">宏</option>
                <option value="media">媒体控制</option>
                <option value="windows">Windows功能</option>
              </select>
            </div>

            <!-- 单键设置 -->
            <div v-if="functionType === 'single'">
              <label class="block text-sm text-gray-dark mb-2">选择按键</label>
              <input
                type="text"
                v-model="singleKey"
                class="input-control w-full"
                placeholder="按下要设置的键"
              />
            </div>

            <!-- 组合键设置 -->
            <div v-if="functionType === 'combination'">
              <label class="block text-sm text-gray-dark mb-2">组合键</label>
              <div class="flex flex-wrap gap-2 mb-2">
                <label v-for="modifier in modifiers" :key="modifier.value" class="inline-flex items-center">
                  <input
                    type="checkbox"
                    v-model="selectedModifiers"
                    :value="modifier.value"
                    class="form-checkbox text-primary"
                  />
                  <span class="ml-1 text-sm">{{ modifier.label }}</span>
                </label>
              </div>
              <input
                type="text"
                v-model="combinationKey"
                class="input-control w-full"
                placeholder="按下要设置的键"
              />
            </div>

            <!-- 宏设置 -->
            <div v-if="functionType === 'macro'">
              <label class="block text-sm text-gray-dark mb-2">选择宏</label>
              <select v-model="selectedMacro" class="input-control w-full">
                <option v-for="i in 5" :key="i" :value="i - 1">宏 {{ i }}</option>
              </select>
            </div>

            <!-- 媒体控制设置 -->
            <div v-if="functionType === 'media'">
              <label class="block text-sm text-gray-dark mb-2">媒体功能</label>
              <select v-model="selectedMedia" class="input-control w-full">
                <option value="play">播放/暂停</option>
                <option value="stop">停止</option>
                <option value="next">下一曲</option>
                <option value="prev">上一曲</option>
                <option value="volup">音量+</option>
                <option value="voldown">音量-</option>
                <option value="mute">静音</option>
              </select>
            </div>

            <!-- Windows功能设置 -->
            <div v-if="functionType === 'windows'">
              <label class="block text-sm text-gray-dark mb-2">Windows功能</label>
              <select v-model="selectedWindows" class="input-control w-full">
                <option value="task">任务视图</option>
                <option value="search">搜索</option>
                <option value="lock">锁定</option>
                <option value="menu">开始菜单</option>
                <option value="desktop">显示桌面</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const buttons = [
  { style: 'width: 48px; height: 32px; left: 0px; top: 8px;' },
  { style: 'width: 48px; height: 32px; left: 56px; top: 8px;' },
  { style: 'width: 48px; height: 32px; left: 112px; top: 0px;' },
  { style: 'width: 24px; height: 64px; left: 110px; top: 80px;' },
  { style: 'width: 24px; height: 64px; left: 130px; top: 80px;' },
  { style: 'width: 80px; height: 24px; left: 40px; top: 160px;' },
  { style: 'width: 80px; height: 24px; left: 40px; top: 180px;' }
]

const buttonNames = [
  '左键（按键 1）',
  '中键（按键 2）',
  '右键（按键 3）',
  '侧键前（按键 4）',
  '侧键后（按键 5）',
  '滚轮上（按键 6）',
  '滚轮下（按键 7）'
]

const modifiers = [
  { value: 'ctrl', label: 'Ctrl' },
  { value: 'shift', label: 'Shift' },
  { value: 'alt', label: 'Alt' },
  { value: 'win', label: 'Win' }
]

const selectedButton = ref(0)
const functionType = ref('normal')
const singleKey = ref('')
const selectedModifiers = ref<string[]>([])
const combinationKey = ref('')
const selectedMacro = ref(0)
const selectedMedia = ref('play')
const selectedWindows = ref('task')

function selectButton(index: number) {
  selectedButton.value = index
}

function resetButton() {
  functionType.value = 'normal'
  singleKey.value = ''
  selectedModifiers.value = []
  combinationKey.value = ''
  selectedMacro.value = 0
  selectedMedia.value = 'play'
  selectedWindows.value = 'task'
}
</script>
