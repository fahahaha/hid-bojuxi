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
      <div class="mouse-diagram mouse-mode">
        <div class="mouse-body">
          <!-- 按键标记 -->
          <button
            v-for="(button, index) in buttons"
            :key="index"
            @click="selectButton(index)"
            class="mouse-key"
            :class="['key' + index, { active: selectedButton === index }]"
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
  {}, // 左键
  {}, // 右键
  {}, // 中键
  {}, // 后退
  {} // 前进
]

const buttonNames = [
  '左键(按键 1)',
  '右键(按键 2)',
  '中键(按键 3)',
  '后退(按键 4)',
  '前进(按键 5)'
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
  position: relative;
}

.mouse-body {
  width: 16rem;
  height: 24rem;
  background-image: url('../assets/mouse.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  padding: 1rem;
}

/* 鼠标按键基础样式 */
.mouse-mode .mouse-key {
  position: absolute;
  height: 32px;
  width: 80px;
  -moz-user-select: none;
  user-select: none;
  border-radius: 0.25rem;
  border-width: 2px;
  --tw-bg-opacity: 1;
  background-color: rgba(22, 93, 255, 0.2);
  text-align: center;
  line-height: 2rem;
  --tw-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  z-index: 1;
}

.mouse-mode .mouse-key:hover {
  background-color: rgba(22, 93, 255, 0.25);
}

.mouse-mode .mouse-key.active {
  background-color: rgba(22, 93, 255, 0.3);
}

.mouse-mode .mouse-key span {
  font-size: 0.75rem;
  font-weight: 500;
}

/* 连接线基础样式 */
.mouse-mode .mouse-key:before {
  content: "";
  position: absolute;
  top: 0.85rem;
  height: 1px;
  border-bottom-width: 1px;
  --tw-border-opacity: 1;
  border-color: rgb(2 132 199 / var(--tw-border-opacity));
  border-bottom-style: solid;
}

/* 连接线末端小圆圈 */
.mouse-mode .mouse-key:after {
  content: "";
  position: absolute;
  top: 11px;
  width: 8px;
  height: 8px;
  background-color: rgb(2 132 199);
  border-radius: 50%;
  z-index: 2;
}

/* 按键 1 - 左键 */
.mouse-mode .key0 {
  top: 5px;
  left: 0;
}

.mouse-mode .key0:before {
  left: 5rem;
  width: 86px;
}

.mouse-mode .key0:after {
  left: calc(5rem + 86px - 4px);
}

/* 按键 2 - 右键 */
.mouse-mode .key1 {
  top: 5px;
  right: 0;
}

.mouse-mode .key1:before {
  right: 5rem;
  width: 86px;
}

.mouse-mode .key1:after {
  right: calc(5rem + 86px - 4px);
}

/* 按键 3 - 中键 */
.mouse-mode .key2 {
  top: 55px;
  right: 0;
}

.mouse-mode .key2:before {
  right: 5rem;
  width: 118px;
}

.mouse-mode .key2:after {
  right: calc(5rem + 118px - 4px);
}

/* 按键 4 - 前进 */
.mouse-mode .key3 {
  top: 112px;
  left: 0;
}

.mouse-mode .key3:before {
  left: 5rem;
  width: 29px;
}

.mouse-mode .key3:after {
  left: calc(5rem + 29px - 4px);
}

/* 按键 5 - 后退 */
.mouse-mode .key4 {
  top: 180px;
  left: 0;
}

.mouse-mode .key4:before {
  left: 5rem;
  width: 29px;
}

.mouse-mode .key4:after {
  left: calc(5rem + 29px - 4px);
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
