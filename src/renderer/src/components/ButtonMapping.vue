<template>
  <div class="button-mapping-container">
    <h3 class="section-title">
      <i class="fa fa-keyboard-o icon-primary"></i>鼠标按键自定义
    </h3>
    <p class="section-description">
      自定义鼠标各按键的功能,可设置为单键、组合键、宏或其他功能
    </p>

    <div class="mapping-layout">
      <!-- 鼠标按键示意图 -->
      <div class="mouse-diagram">
        <div class="mouse-body">
          <!-- 按键标记 -->
          <button
            v-for="(button, index) in buttons"
            :key="index"
            @click="selectButton(index)"
            class="button-marker"
            :class="{ active: selectedButton === index }"
            :style="button.style"
          >
            <span>{{ index + 1 }}</span>
          </button>
        </div>
      </div>

      <!-- 按键功能设置 -->
      <div class="button-settings">
        <div class="settings-panel">
          <div class="panel-header">
            <h4 class="panel-title">{{ buttonNames[selectedButton] }}</h4>
            <button @click="resetButton" class="reset-button">
              <i class="fa fa-refresh"></i>恢复默认
            </button>
          </div>

          <div class="settings-form">
            <div class="form-group">
              <label class="form-label">功能类型</label>
              <select v-model="functionType" class="form-select">
                <option value="normal">默认功能</option>
                <option value="single">单键</option>
                <option value="combination">组合键</option>
                <option value="macro">宏</option>
                <option value="media">媒体控制</option>
                <option value="windows">Windows功能</option>
              </select>
            </div>

            <!-- 单键设置 -->
            <div v-if="functionType === 'single'" class="form-group">
              <label class="form-label">选择按键</label>
              <input
                type="text"
                v-model="singleKey"
                class="input-control"
                placeholder="按下要设置的键"
              />
            </div>

            <!-- 组合键设置 -->
            <div v-if="functionType === 'combination'">
              <label class="form-label">组合键</label>
              <div class="modifier-group">
                <label
                  v-for="modifier in modifiers"
                  :key="modifier.value"
                  class="modifier-checkbox"
                >
                  <input
                    type="checkbox"
                    v-model="selectedModifiers"
                    :value="modifier.value"
                  />
                  <span>{{ modifier.label }}</span>
                </label>
              </div>
              <input
                type="text"
                v-model="combinationKey"
                class="input-control"
                placeholder="按下要设置的键"
              />
            </div>

            <!-- 宏设置 -->
            <div v-if="functionType === 'macro'" class="form-group">
              <label class="form-label">选择宏</label>
              <select v-model="selectedMacro" class="form-select">
                <option v-for="i in 5" :key="i" :value="i - 1">宏 {{ i }}</option>
              </select>
            </div>

            <!-- 媒体控制设置 -->
            <div v-if="functionType === 'media'" class="form-group">
              <label class="form-label">媒体功能</label>
              <select v-model="selectedMedia" class="form-select">
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
            <div v-if="functionType === 'windows'" class="form-group">
              <label class="form-label">Windows功能</label>
              <select v-model="selectedWindows" class="form-select">
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
  '左键(按键 1)',
  '中键(按键 2)',
  '右键(按键 3)',
  '侧键前(按键 4)',
  '侧键后(按键 5)',
  '滚轮上(按键 6)',
  '滚轮下(按键 7)'
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

<style scoped>
.button-mapping-container {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.section-title i {
  margin-right: 0.5rem;
}

.icon-primary {
  color: var(--color-primary);
}

.section-description {
  color: var(--color-gray-medium);
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.mapping-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .mapping-layout {
    grid-template-columns: 1fr 2fr;
  }
}

.mouse-diagram {
  display: flex;
  justify-content: center;
  align-items: center;
}

.mouse-body {
  position: relative;
  width: 16rem;
  height: 24rem;
  background-color: rgb(243, 244, 246);
  border-radius: 9999px;
  padding: 1rem;
}

.mouse-body::before {
  content: '';
  position: absolute;
  inset: 1rem;
  background-color: rgb(229, 231, 235);
  border-radius: 9999px;
  overflow: hidden;
}

.button-marker {
  position: absolute;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background-color: rgba(22, 93, 255, 0.2);
  border: none;
  z-index: 1;
}

.button-marker:hover {
  background-color: rgba(22, 93, 255, 0.25);
}

.button-marker.active {
  background-color: rgba(22, 93, 255, 0.3);
}

.button-marker span {
  font-size: 0.75rem;
  font-weight: 500;
}

.button-settings {
  flex: 1;
}

.settings-panel {
  border: 1px solid var(--color-gray-light);
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.panel-title {
  font-weight: 500;
  margin: 0;
}

.reset-button {
  font-size: 0.875rem;
  color: var(--color-gray-medium);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.reset-button:hover {
  color: var(--color-primary);
}

.reset-button i {
  margin-right: 0.25rem;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  color: var(--color-gray-dark);
}

.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-gray-light);
  border-radius: 0.5rem;
  outline: none;
  transition: all 0.2s;
  cursor: pointer;
}

.form-select:focus {
  border-color: var(--color-primary);
}

.modifier-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.modifier-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
}

.modifier-checkbox input[type="checkbox"] {
  accent-color: var(--color-primary);
  cursor: pointer;
}

.modifier-checkbox span {
  font-size: 0.875rem;
}
</style>
