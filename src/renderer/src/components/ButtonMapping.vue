<template>
  <div class="button-mapping-container">
    <h3 class="section-title">
      <i class="fa fa-keyboard-o icon-primary"></i>鼠标按键自定义
    </h3>
    <p class="section-description">
      自定义鼠标各按键的功能,可设置为鼠标功能、多媒体键或键盘组合键
    </p>

    <div class="mapping-layout">
      <!-- 鼠标按键示意图 -->
      <div class="mouse-diagram mouse-mode">
        <div class="mouse-body">
          <!-- 按键标记 -->
          <button
            v-for="(_, index) in buttonMappings.slice(0, 5)"
            :key="index"
            @click="selectButton(index)"
            class="mouse-key"
            :class="['key' + index, { active: selectedButton === index, disabled: index === 0 }]"
            :disabled="index === 0"
          >
            <span class="button-label">{{ getButtonLabel(index) }}</span>
          </button>
        </div>
      </div>

      <!-- 按键功能设置 -->
      <div class="button-settings">
        <div class="settings-panel">
          <div class="panel-header">
            <h4 class="panel-title">{{ buttonNames[selectedButton] }}</h4>
            <button @click="resetButton" class="reset-button" :disabled="selectedButton === 0">
              <i class="fa fa-refresh"></i>恢复默认
            </button>
          </div>

          <div v-if="selectedButton === 0" class="disabled-notice">
            <i class="fa fa-info-circle"></i>
            左键不允许修改
          </div>

          <div v-else class="settings-form">
            <!-- 标签页切换 -->
            <div class="tab-buttons">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                class="tab-button"
                :class="{ active: activeTab === tab.id }"
              >
                <i :class="tab.icon"></i>
                {{ tab.name }}
              </button>
            </div>

            <!-- 鼠标功能标签页 -->
            <div v-if="activeTab === 'mouse'" class="tab-content">
              <div class="button-grid">
                <button
                  v-for="btn in mouseButtons"
                  :key="btn.id"
                  @click="applyMapping(btn.code)"
                  class="function-button"
                  :class="{ active: isCurrentMapping(btn.code) }"
                >
                  {{ btn.name }}
                </button>
              </div>
            </div>

            <!-- 多媒体标签页 -->
            <div v-if="activeTab === 'multimedia'" class="tab-content">
              <div
                v-for="category in multimediaCategories"
                :key="category"
                class="category-section"
              >
                <h5 class="category-title">{{ category }}</h5>
                <div class="button-grid">
                  <button
                    v-for="btn in getMultimediaByCategory(category)"
                    :key="btn.id"
                    @click="applyMapping(btn.code)"
                    class="function-button"
                    :class="{ active: isCurrentMapping(btn.code) }"
                  >
                    {{ btn.name }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 键盘按键标签页 -->
            <div v-if="activeTab === 'keyboard'" class="tab-content">
              <div class="keyboard-settings">
                <div class="form-group">
                  <label class="form-label">修饰键（可多选）</label>
                  <div class="modifier-group">
                    <label
                      v-for="modifier in modifierKeys"
                      :key="modifier.id"
                      class="modifier-checkbox"
                    >
                      <input
                        type="checkbox"
                        v-model="selectedModifiers"
                        :value="modifier.value"
                      />
                      <span>{{ modifier.name }}</span>
                    </label>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">选择按键</label>
                  <select v-model="selectedKey" class="form-select">
                    <option value="">-- 请选择按键 --</option>
                    <optgroup label="字母键">
                      <option v-for="key in alphabetKeys" :key="key" :value="key">
                        {{ key }}
                      </option>
                    </optgroup>
                    <optgroup label="数字键">
                      <option v-for="key in numberKeys" :key="key" :value="key">
                        {{ key }}
                      </option>
                    </optgroup>
                    <optgroup label="功能键">
                      <option v-for="key in functionKeys" :key="key" :value="key">
                        {{ key }}
                      </option>
                    </optgroup>
                    <optgroup label="特殊键">
                      <option v-for="key in specialKeys" :key="key" :value="key">
                        {{ key }}
                      </option>
                    </optgroup>
                  </select>
                </div>

                <button
                  @click="applyKeyboardMapping"
                  class="apply-button"
                  :disabled="!selectedKey"
                >
                  <i class="fa fa-check"></i>
                  保存按键
                </button>
              </div>
            </div>

            <!-- 宏标签页 -->
            <div v-if="activeTab === 'macro'" class="tab-content">
              <div class="macro-settings">
                <div class="form-group">
                  <label class="form-label">选择宏</label>
                  <select v-model="selectedMacroIndex" class="form-select">
                    <option value="">-- 请选择宏 --</option>
                    <option v-for="(macro, index) in availableMacros" :key="index" :value="index">
                      {{ macro.name }} ({{ macro.events.length }}个事件)
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">循环模式</label>
                  <div class="radio-group">
                    <label class="radio-label">
                      <input type="radio" v-model="macroLoopMode" value="release" />
                      <span>循环直到按键松开</span>
                    </label>
                    <label class="radio-label">
                      <input type="radio" v-model="macroLoopMode" value="anykey" />
                      <span>循环直到任意键按下</span>
                    </label>
                    <label class="radio-label">
                      <input type="radio" v-model="macroLoopMode" value="count" />
                      <span>循环指定次数</span>
                    </label>
                  </div>
                </div>

                <div v-if="macroLoopMode === 'count'" class="form-group">
                  <label class="form-label">循环次数 (1-65535)</label>
                  <input
                    type="number"
                    v-model.number="macroLoopCount"
                    class="form-input"
                    min="1"
                    max="65535"
                    placeholder="输入循环次数"
                  />
                </div>

                <button
                  @click="applyMacroMapping"
                  class="apply-button"
                  :disabled="selectedMacroIndex === ''"
                >
                  <i class="fa fa-check"></i>
                  保存到按键
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 重置所有按键按钮 -->
    <div class="reset-all-container">
      <button @click="resetAllButtons" class="reset-all-button">
        <i class="fa fa-refresh"></i>
        重置所有按键
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useWebHID } from '../composables/useWebHID'
import { useMacroStorage } from '../composables/useMacroStorage'
import {
  mouseButtons,
  multimediaButtons,
  modifierKeys,
  keyboardScancodes,
  createKeyboardMapping,
  getButtonDisplayName,
  defaultButtonMappings,
  type ButtonMapping
} from '../config/buttonMappings'

const { isConnected, getButtonMapping, setButtonMapping } = useWebHID()
const { macros } = useMacroStorage()

// 按键映射数据（8个按键，但只显示前5个）
const buttonMappings = ref<number[][]>([...defaultButtonMappings])

// UI按键索引到设备数组索引的映射
// 根据实际测试，按键4和按键5在设备中的位置是对调的
const uiToDeviceIndex = [0, 1, 2, 4, 3]  // UI索引 → 设备索引

const buttonNames = [
  '左键(按键 1)',
  '右键(按键 2)',
  '中键(按键 3)',
  '前进(按键 4)',
  '后退(按键 5)'
]

const selectedButton = ref(0)
const activeTab = ref('mouse')

// 标签页配置
const tabs = [
  { id: 'mouse', name: '鼠标功能', icon: 'fa fa-mouse-pointer' },
  { id: 'multimedia', name: '多媒体', icon: 'fa fa-music' },
  { id: 'keyboard', name: '键盘按键', icon: 'fa fa-keyboard-o' },
  { id: 'macro', name: '宏', icon: 'fa fa-code' }
]

// 多媒体分类
const multimediaCategories = computed(() => {
  const categories = new Set<string>()
  multimediaButtons.forEach(btn => {
    if (btn.category) categories.add(btn.category)
  })
  return Array.from(categories)
})

function getMultimediaByCategory(category: string): ButtonMapping[] {
  return multimediaButtons.filter(btn => btn.category === category)
}

// 键盘按键选项
const selectedModifiers = ref<number[]>([])
const selectedKey = ref('')

const alphabetKeys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
const functionKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']
const specialKeys = ['Enter', 'Escape', 'Backspace', 'Tab', 'Space', 'Insert', 'Delete', 'Home', 'End', 'PageUp', 'PageDown', 'Up', 'Down', 'Left', 'Right']

// 宏相关变量
const selectedMacroIndex = ref<string>('')
const macroLoopMode = ref<'release' | 'anykey' | 'count'>('release')
const macroLoopCount = ref(1)

// 可用的宏列表 (只显示有事件的宏)
const availableMacros = computed(() => {
  return macros.value.filter(macro => macro.events.length > 0)
})

/**
 * 选择按键
 */
function selectButton(index: number) {
  if (index === 0) return // 左键不允许选择
  selectedButton.value = index
}

/**
 * 获取按键显示标签
 */
function getButtonLabel(index: number): string {
  const deviceIndex = uiToDeviceIndex[index]
  const mapping = buttonMappings.value[deviceIndex]
  if (!mapping) return `${index + 1}`

  return getButtonDisplayName(mapping)
}

/**
 * 检查是否是当前映射
 */
function isCurrentMapping(code: number[]): boolean {
  const deviceIndex = uiToDeviceIndex[selectedButton.value]
  const current = buttonMappings.value[deviceIndex]
  if (!current) return false
  return code.every((byte, i) => byte === current[i])
}

/**
 * 应用映射
 */
async function applyMapping(code: number[]) {
  if (selectedButton.value === 0) return // 左键不允许修改

  const deviceIndex = uiToDeviceIndex[selectedButton.value]
  console.log(`[按键映射] UI按键${selectedButton.value + 1} (设备索引${deviceIndex}) 设置为:`, code)
  buttonMappings.value[deviceIndex] = [...code]
  console.log('[按键映射] 完整映射数组:', buttonMappings.value)

  // 发送到设备
  await saveToDevice()
}

/**
 * 应用键盘映射
 */
async function applyKeyboardMapping() {
  if (!selectedKey.value || selectedButton.value === 0) return

  const scancode = keyboardScancodes[selectedKey.value]
  if (scancode === undefined) {
    console.error('未知的按键:', selectedKey.value)
    return
  }

  // 计算修饰键组合
  const modifiers = selectedModifiers.value.reduce((acc, val) => acc | val, 0)

  const code = createKeyboardMapping(modifiers, scancode)
  const deviceIndex = uiToDeviceIndex[selectedButton.value]
  buttonMappings.value[deviceIndex] = code

  // 发送到设备
  await saveToDevice()

  // 重置选择
  selectedModifiers.value = []
  selectedKey.value = ''
}

/**
 * 恢复默认
 */
async function resetButton() {
  if (selectedButton.value === 0) return // 左键不允许修改

  const deviceIndex = uiToDeviceIndex[selectedButton.value]
  buttonMappings.value[deviceIndex] = [...defaultButtonMappings[deviceIndex]]

  // 发送到设备
  await saveToDevice()
}

/**
 * 应用宏映射
 */
async function applyMacroMapping() {
  if (selectedButton.value === 0) return // 左键不允许修改
  if (selectedMacroIndex.value === '') return

  const macroIndex = parseInt(selectedMacroIndex.value)

  // 构建宏映射代码
  // 格式: [0x70, 宏索引, 循环模式/次数低字节, 循环次数高字节]
  let code: number[]

  if (macroLoopMode.value === 'release') {
    // 循环直到按键松开: [0x70, macroIndex, 0x02, 0x00]
    code = [0x70, macroIndex, 0x02, 0x00]
  } else if (macroLoopMode.value === 'anykey') {
    // 循环直到任意键按下: [0x70, macroIndex, 0x03, 0x00]
    code = [0x70, macroIndex, 0x03, 0x00]
  } else {
    // 循环指定次数: [0x70, macroIndex, 次数低字节, 次数高字节]
    const count = Math.min(65535, Math.max(1, macroLoopCount.value))
    code = [0x70, macroIndex, count & 0xFF, (count >> 8) & 0xFF]
  }

  const deviceIndex = uiToDeviceIndex[selectedButton.value]
  console.log(`[宏映射] UI按键${selectedButton.value + 1} (设备索引${deviceIndex}) 设置为宏${macroIndex + 1}:`, code)
  buttonMappings.value[deviceIndex] = code

  // 发送到设备
  await saveToDevice()

  // 重置选择
  selectedMacroIndex.value = ''
  macroLoopMode.value = 'release'
  macroLoopCount.value = 1
}

/**
 * 重置所有按键
 */
async function resetAllButtons() {
  if (!confirm('确定要重置所有按键为默认设置吗?')) {
    return
  }

  // 重置所有按键映射
  buttonMappings.value = [...defaultButtonMappings]

  // 发送到设备
  await saveToDevice()

  console.log('[按键映射] 已重置所有按键')
  alert('所有按键已重置为默认设置')
}

/**
 * 保存到设备
 */
async function saveToDevice() {
  if (!isConnected.value) {
    console.warn('设备未连接')
    return
  }

  const result = await setButtonMapping(buttonMappings.value)
  if (result.success) {
    console.log('按键映射已保存:', result.message)
  } else {
    console.error('保存失败:', result.message)
  }
}

/**
 * 从设备加载按键映射
 */
async function loadFromDevice() {
  if (!isConnected.value) {
    console.warn('设备未连接，使用默认映射')
    return
  }

  const mappings = await getButtonMapping()
  if (mappings && mappings.length >= 5) {
    // 只使用前5个按键的映射
    buttonMappings.value = mappings
    console.log('已加载按键映射:', mappings)
  } else {
    console.warn('无法加载按键映射，使用默认值')
  }
}

// 组件挂载时加载按键映射
onMounted(() => {
  loadFromDevice()
})
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
  position: relative;
}

/* 鼠标按键基础样式 */
.mouse-mode .mouse-key {
  position: absolute;
  min-height: 32px;
  min-width: 80px;
  padding: 0.25rem 0.5rem;
  user-select: none;
  border-radius: 0.25rem;
  border-width: 2px;
  background-color: rgba(22, 93, 255, 0.2);
  text-align: center;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mouse-mode .mouse-key:hover:not(.disabled) {
  background-color: rgba(22, 93, 255, 0.25);
}

.mouse-mode .mouse-key.active {
  background-color: rgba(22, 93, 255, 0.3);
  border: 2px solid rgba(22, 93, 255, 0.6);
}

.mouse-mode .mouse-key.disabled {
  background-color: rgba(128, 128, 128, 0.2);
  cursor: not-allowed;
  opacity: 0.6;
}

.mouse-mode .mouse-key .button-label {
  font-size: 0.7rem;
  font-weight: 500;
  word-break: break-word;
  line-height: 1.2;
}

/* 连接线基础样式 */
.mouse-mode .mouse-key:before {
  content: "";
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 1px;
  border-bottom-width: 1px;
  border-color: rgb(2 132 199);
  border-bottom-style: solid;
}

/* 连接线末端小圆圈 */
.mouse-mode .mouse-key:after {
  content: "";
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background-color: rgb(2 132 199);
  border-radius: 50%;
  z-index: 2;
}

/* 按键 1 - 左键 */
.mouse-mode .key0 {
  top: 5px;
  left: -70px;
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
  right: -65px;
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
  right: -70px;
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
  left: -70px;
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
  left: -70px;
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

.reset-button:hover:not(:disabled) {
  color: var(--color-primary);
}

.reset-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-button i {
  margin-right: 0.25rem;
}

.disabled-notice {
  padding: 1rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  color: var(--color-gray-medium);
  text-align: center;
}

.disabled-notice i {
  margin-right: 0.5rem;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 标签页 */
.tab-buttons {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid var(--color-gray-light);
  margin-bottom: 1rem;
}

.tab-button {
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-gray-medium);
  font-size: 0.875rem;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: var(--color-primary);
}

.tab-button.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-button i {
  margin-right: 0.25rem;
}

.tab-content {
  min-height: 200px;
}

/* 按钮网格 */
.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
}

.function-button {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-gray-light);
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.function-button:hover {
  border-color: var(--color-primary);
  background-color: rgba(22, 93, 255, 0.05);
}

.function-button.active {
  border-color: var(--color-primary);
  background-color: rgba(22, 93, 255, 0.1);
  color: var(--color-primary);
  font-weight: 500;
}

/* 分类 */
.category-section {
  margin-bottom: 1.5rem;
}

.category-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gray-dark);
  margin-bottom: 0.75rem;
}

/* 键盘设置 */
.keyboard-settings {
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
  font-weight: 500;
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
  gap: 1rem;
}

.modifier-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.modifier-checkbox input[type="checkbox"] {
  accent-color: var(--color-primary);
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.modifier-checkbox span {
  font-size: 0.875rem;
}

.apply-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.apply-button:hover:not(:disabled) {
  background-color: #1557cc;
}

.apply-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.apply-button i {
  margin-right: 0.5rem;
}

/* 宏设置 */
.macro-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.radio-label input[type="radio"] {
  accent-color: var(--color-primary);
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-gray-light);
  border-radius: 0.5rem;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: var(--color-primary);
}

/* 重置所有按键按钮 */
.reset-all-container {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.reset-all-button {
  padding: 0.75rem 2rem;
  background-color: white;
  color: var(--color-danger);
  border: 2px solid var(--color-danger);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.reset-all-button:hover {
  background-color: var(--color-danger);
  color: white;
}

.reset-all-button i {
  margin-right: 0.5rem;
}
</style>
