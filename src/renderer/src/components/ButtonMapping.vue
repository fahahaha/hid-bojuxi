<template>
  <div class="button-mapping-container">
<!--    <h3 class="section-title">-->
<!--      <i class="fa fa-keyboard"></i>{{ t('buttonMapping.title') }}-->
<!--    </h3>-->
    <p class="section-description">{{ t('buttonMapping.description') }}</p>

    <div class="mapping-layout">
      <!-- 鼠标按键示意图 -->
      <div class="mouse-diagram mouse-mode">
        <div class="mouse-body">
          <!-- 按键标记 -->
          <button
            v-for="(_, index) in buttonMappings.slice(0, 6)"
            :key="index"
            @click="selectButton(index)"
            class="mouse-key"
            :class="['key' + index, { active: selectedButton === index }]"
          >
            <span class="button-label">{{ getButtonLabel(index) }}</span>
          </button>
        </div>
        <!-- 重置所有按键按钮 -->
        <button @click="resetAllButtons" class="reset-all-button">
          <i class="fa fa-refresh"></i>
          {{ t('buttonMapping.resetAll') }}
        </button>
      </div>

      <!-- 按键功能设置 -->
      <div class="button-settings">
        <div class="settings-panel">
          <div class="panel-header">
            <h4 class="panel-title">{{ buttonNames[selectedButton] }}</h4>
            <button @click="resetButton" class="reset-button">
              <i class="fa fa-refresh"></i>{{ t('buttonMapping.restoreDefault') }}
            </button>
          </div>

          <div class="settings-form">
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
                  v-for="btn in filteredMouseButtons"
                  :key="btn.id"
                  @click="applyMapping(btn.code)"
                  class="function-button"
                  :class="{ active: isCurrentMapping(btn.code) }"
                >
                  {{ getButtonName(btn) }}
                </button>
              </div>
            </div>

            <!-- DPI功能标签页 -->
            <div v-if="activeTab === 'dpi'" class="tab-content">
              <div class="button-grid">
                <button
                  v-for="btn in dpiButtons"
                  :key="btn.id"
                  @click="applyMapping(btn.code)"
                  class="function-button"
                  :class="{ active: isCurrentMapping(btn.code) }"
                >
                  {{ t(btn.nameKey || '') || btn.name }}
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
                    {{ t(btn.nameKey || '') || btn.name }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 键盘按键标签页 -->
            <div v-if="activeTab === 'keyboard'" class="tab-content">
              <div class="keyboard-settings">
                <div class="form-group">
                  <label class="form-label">{{ t('buttonMapping.keyboard.modifiers') }}</label>
                  <div class="button-grid modifier-buttons">
                    <button
                      v-for="modifier in modifierKeys"
                      :key="modifier.id"
                      @click="toggleModifier(modifier.value)"
                      class="function-button"
                      :class="{ active: selectedModifiers.includes(modifier.value) }"
                    >
                      {{ modifier.name }}
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">{{ t('buttonMapping.keyboard.key1') }}</label>
                  <select v-model="selectedKey" class="form-select">
                    <option value="">{{ t('buttonMapping.keyboard.selectKeyPlaceholder') }}</option>
                    <optgroup :label="t('buttonMapping.keyboard.groups.alphabet')">
                      <option v-for="key in alphabetKeys" :key="key" :value="key">
                        {{ getKeyDisplayName(key) }}
                      </option>
                    </optgroup>
                    <optgroup :label="t('buttonMapping.keyboard.groups.number')">
                      <option v-for="key in numberKeys" :key="key" :value="key">
                        {{ getKeyDisplayName(key) }}
                      </option>
                    </optgroup>
                    <optgroup :label="t('buttonMapping.keyboard.groups.function')">
                      <option v-for="key in functionKeys" :key="key" :value="key">
                        {{ getKeyDisplayName(key) }}
                      </option>
                    </optgroup>
                    <optgroup :label="t('buttonMapping.keyboard.groups.extendedFunction')">
                      <option v-for="key in extendedFunctionKeys" :key="key" :value="key">
                        {{ getKeyDisplayName(key) }}
                      </option>
                    </optgroup>
                    <optgroup :label="t('buttonMapping.keyboard.groups.special')">
                      <option v-for="key in specialKeys" :key="key" :value="key">
                        {{ getKeyDisplayName(key) }}
                      </option>
                    </optgroup>
                    <optgroup :label="t('buttonMapping.keyboard.groups.punctuation')">
                      <option v-for="key in punctuationKeys" :key="key" :value="key">
                        {{ getKeyDisplayName(key) }}
                      </option>
                    </optgroup>
                    <optgroup :label="t('buttonMapping.keyboard.groups.numpad')">
                      <option v-for="key in numpadKeys" :key="key" :value="key">
                        {{ getKeyDisplayName(key) }}
                      </option>
                    </optgroup>
                    <optgroup :label="t('buttonMapping.keyboard.groups.modifier')">
                      <option v-for="key in modifierAsKeys" :key="key" :value="key">
                        {{ getKeyDisplayName(key) }}
                      </option>
                    </optgroup>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">{{ t('buttonMapping.keyboard.key2') }}</label>
                  <select v-model="selectedKey2" class="form-select">
                    <option value="">{{ t('buttonMapping.keyboard.key2Placeholder') }}</option>
                    <optgroup :label="t('buttonMapping.keyboard.groups.alphabet')">
                      <option v-for="key in alphabetKeys" :key="key" :value="key">
                        {{ getKeyDisplayName(key) }}
                      </option>
                    </optgroup>
                    <optgroup :label="t('buttonMapping.keyboard.groups.number')">
                      <option v-for="key in numberKeys" :key="key" :value="key">
                        {{ getKeyDisplayName(key) }}
                      </option>
                    </optgroup>
                    <optgroup :label="t('buttonMapping.keyboard.groups.function')">
                      <option v-for="key in functionKeys" :key="key" :value="key">
                        {{ getKeyDisplayName(key) }}
                      </option>
                    </optgroup>
                    <optgroup :label="t('buttonMapping.keyboard.groups.extendedFunction')">
                      <option v-for="key in extendedFunctionKeys" :key="key" :value="key">
                        {{ getKeyDisplayName(key) }}
                      </option>
                    </optgroup>
                    <optgroup :label="t('buttonMapping.keyboard.groups.special')">
                      <option v-for="key in specialKeys" :key="key" :value="key">
                        {{ getKeyDisplayName(key) }}
                      </option>
                    </optgroup>
                    <optgroup :label="t('buttonMapping.keyboard.groups.punctuation')">
                      <option v-for="key in punctuationKeys" :key="key" :value="key">
                        {{ getKeyDisplayName(key) }}
                      </option>
                    </optgroup>
                    <optgroup :label="t('buttonMapping.keyboard.groups.numpad')">
                      <option v-for="key in numpadKeys" :key="key" :value="key">
                        {{ getKeyDisplayName(key) }}
                      </option>
                    </optgroup>
                    <optgroup :label="t('buttonMapping.keyboard.groups.modifier')">
                      <option v-for="key in modifierAsKeys" :key="key" :value="key">
                        {{ getKeyDisplayName(key) }}
                      </option>
                    </optgroup>
                  </select>
                </div>

                <button @click="applyKeyboardMapping" class="apply-button" :disabled="!canSaveKeyboardMapping">
                  <i class="fa fa-check"></i>
                  {{ t('buttonMapping.keyboard.saveKey') }}
                </button>
              </div>
            </div>

            <!-- 宏标签页 -->
            <div v-if="activeTab === 'macro'" class="tab-content">
              <!-- 去添加/修改宏按钮 -->
              <button @click="goToMacroManagement" class="go-macro-btn">
                <i class="fa fa-plus"></i>
                {{ t('buttonMapping.macro.goToMacro') }}
              </button>

              <!-- 宏按钮列表 -->
              <div class="button-grid">
                <button
                  v-for="macro in availableMacros"
                  :key="macro.index"
                  @click="bindMacroToButton(macro.index)"
                  class="function-button"
                  :class="{ active: isCurrentMacroBinding(macro.index) }"
                >
                  {{ macro.name }}
                </button>
              </div>

              <!-- 无可用宏提示 -->
              <div v-if="availableMacros.length === 0" class="empty-macro-hint">
                {{ t('buttonMapping.macro.noAvailableMacro') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useWebHID } from '../composables/useWebHID'
import { useI18n } from '../composables/useI18n'
import { useMessageBox } from '../composables/useMessageBox'
import { useConfirmBox } from '../composables/useConfirmBox'
import {
  useMacroStorage
} from '../composables/useMacroStorage'

const props = defineProps<{
  initialSubTab?: string | null
}>()

const emit = defineEmits<{
  (e: 'switchTab', tab: string): void
}>()
import {
  mouseButtons,
  multimediaButtons,
  dpiButtons,
  modifierKeys,
  keyboardScancodes,
  createKeyboardMapping,
  getButtonDisplayName,
  defaultButtonMappings,
  getProfileButtons,
  type ButtonMapping
} from '../config/buttonMappings'

const {
  isConnected,
  getButtonMapping,
  setButtonMapping,
  deviceStatus
} = useWebHID()
const {
  macros,
  getMacro,
  validateMacro
} = useMacroStorage()
const { t, ta } = useI18n()
const { error: showError, success: showSuccess, warning: showWarning } = useMessageBox()
const { confirm: showConfirm } = useConfirmBox()

// 可用的宏列表（只显示有事件的宏）
const availableMacros = computed(() => {
  return macros.value
    .map((macro, index) => ({ ...macro, index }))
    .filter(macro => macro.events.length > 0)
})

/**
 * 跳转到宏管理页面
 */
function goToMacroManagement() {
  emit('switchTab', 'macro')
}

// 按键映射数据（8个按键）
// 博巨矽协议按键顺序: 左键(0), 中键(1), 右键(2), 前进(3), 后退(4), 滚轮前滚(5), 滚轮后滚(6), DPI键(7)
const buttonMappings = ref<number[][]>([...defaultButtonMappings])

// UI按键索引到设备数组索引的映射
// UI显示顺序: 左键(0), 右键(1), 中键(2), 前进(3), 后退(4), DPI键(5)
// 设备数组索引: 左键(0), 中键(1), 右键(2), 前进(3), 后退(4), 滚轮前滚(5), 滚轮后滚(6), DPI键(7)
const uiToDeviceIndex = [0, 2, 1, 3, 4, 7] // UI索引 → 设备索引

const buttonNames = computed(() => ta('buttonMapping.buttonNames'))

// 根据最大板载配置数动态生成鼠标按钮列表
const filteredMouseButtons = computed(() => {
  const maxProfiles = deviceStatus.value.maxProfiles || 1
  return [...mouseButtons, ...getProfileButtons(maxProfiles)]
})

/**
 * 获取按钮显示名称（处理动态参数）
 */
function getButtonName(btn: ButtonMapping): string {
  if (!btn.nameKey) return btn.name

  // 如果是板载配置按钮（profile_0, profile_1...），传递参数 n
  if (btn.id.startsWith('profile_') && btn.id !== 'profile_cycle') {
    const profileIndex = parseInt(btn.id.replace('profile_', ''))
    return t(btn.nameKey, { n: String(profileIndex + 1) })
  }

  return t(btn.nameKey) || btn.name
}

const selectedButton = ref(0)
const activeTab = ref('mouse')

// 监听 initialSubTab 变化，自动切换子标签页
watch(() => props.initialSubTab, (newVal) => {
  if (newVal) {
    activeTab.value = newVal
  }
}, { immediate: true })

// 标签页配置
const tabs = computed(() => [
  { id: 'mouse', name: t('buttonMapping.tabs.mouse'), icon: 'fa fa-mouse-pointer' },
  { id: 'dpi', name: t('buttonMapping.tabs.dpi'), icon: 'fa fa-tachometer' },
  { id: 'multimedia', name: t('buttonMapping.tabs.multimedia'), icon: 'fa fa-music' },
  { id: 'keyboard', name: t('buttonMapping.tabs.keyboard'), icon: 'fa fa-keyboard' },
  { id: 'macro', name: t('buttonMapping.tabs.macro'), icon: 'fa fa-code' }
])

// 多媒体分类
const multimediaCategories = computed(() => {
  const categories = new Set<string>()
  multimediaButtons.forEach((btn) => {
    if (btn.category) categories.add(btn.category)
  })
  return Array.from(categories)
})

function getMultimediaByCategory(category: string): ButtonMapping[] {
  return multimediaButtons.filter((btn) => btn.category === category)
}

// 键盘按键选项
const selectedModifiers = ref<number[]>([])
const selectedKey = ref('')
const selectedKey2 = ref('')

/**
 * 是否可以保存键盘映射（修饰键、按键1、按键2只要有一个选中即可）
 */
const canSaveKeyboardMapping = computed(() => {
  return selectedModifiers.value.length > 0 || selectedKey.value !== '' || selectedKey2.value !== ''
})

/**
 * 切换修饰键选中状态
 */
function toggleModifier(value: number) {
  const index = selectedModifiers.value.indexOf(value)
  if (index === -1) {
    selectedModifiers.value.push(value)
  } else {
    selectedModifiers.value.splice(index, 1)
  }
}

const alphabetKeys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
const functionKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']
const extendedFunctionKeys = [
  'F13',
  'F14',
  'F15',
  'F16',
  'F17',
  'F18',
  'F19',
  'F20',
  'F21',
  'F22',
  'F23',
  'F24'
]
const specialKeys = [
  'Enter',
  'Escape',
  'Backspace',
  'Tab',
  'Space',
  'CapsLock',
  'Insert',
  'Delete',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'Up',
  'Down',
  'Left',
  'Right',
  'PrintScreen',
  'ScrollLock',
  'Pause',
  'App'
]
const punctuationKeys = [
  'Minus',
  'Equal',
  'LeftBracket',
  'RightBracket',
  'Backslash',
  'Semicolon',
  'Quote',
  'Grave',
  'Comma',
  'Period',
  'Slash'
]
const numpadKeys = [
  'NumLock',
  'Numpad0',
  'Numpad1',
  'Numpad2',
  'Numpad3',
  'Numpad4',
  'Numpad5',
  'Numpad6',
  'Numpad7',
  'Numpad8',
  'Numpad9',
  'NumpadDecimal',
  'NumpadDivide',
  'NumpadMultiply',
  'NumpadMinus',
  'NumpadPlus',
  'NumpadEnter',
  'NumpadEqual'
]
const modifierAsKeys = [
  'LeftControl',
  'LeftShift',
  'LeftAlt',
  'LeftGUI',
  'RightControl',
  'RightShift',
  'RightAlt',
  'RightGUI'
]

/**
 * 键盘按键显示名称映射表
 */
const keyDisplayNameMap: Record<string, string> = {
  // 特殊键
  'Escape': 'Esc',
  'Enter': 'Enter',
  'Backspace': 'Backspace',
  'Tab': 'Tab',
  'Space': 'Space',
  'CapsLock': 'Caps Lock',
  'Insert': 'Insert',
  'Delete': 'Delete',
  'Home': 'Home',
  'End': 'End',
  'PageUp': 'Page Up',
  'PageDown': 'Page Down',
  'Up': 'Up',
  'Down': 'Down',
  'Left': 'Left',
  'Right': 'Right',
  'PrintScreen': 'Print Screen',
  'ScrollLock': 'Scroll Lock',
  'Pause': 'Pause',
  'App': 'Menu',

  // 标点符号
  'Minus': '-',
  'Equal': '=',
  'LeftBracket': '[',
  'RightBracket': ']',
  'Backslash': '\\',
  'Semicolon': ';',
  'Quote': "'",
  'Grave': '`',
  'Comma': ',',
  'Period': '.',
  'Slash': '/',

  // 小键盘
  'NumLock': 'Num Lock',
  'Numpad0': 'Num 0',
  'Numpad1': 'Num 1',
  'Numpad2': 'Num 2',
  'Numpad3': 'Num 3',
  'Numpad4': 'Num 4',
  'Numpad5': 'Num 5',
  'Numpad6': 'Num 6',
  'Numpad7': 'Num 7',
  'Numpad8': 'Num 8',
  'Numpad9': 'Num 9',
  'NumpadDecimal': 'Num Del',
  'NumpadDivide': 'Num /',
  'NumpadMultiply': 'Num *',
  'NumpadMinus': 'Num -',
  'NumpadPlus': 'Num +',
  'NumpadEnter': 'Num Enter',
  'NumpadEqual': 'Num =',

  // 修饰键
  'LeftControl': 'Left Ctrl',
  'LeftShift': 'Left Shift',
  'LeftAlt': 'Left Alt',
  'LeftGUI': 'Left Windows',
  'RightControl': 'Right Ctrl',
  'RightShift': 'Right Shift',
  'RightAlt': 'Right Alt',
  'RightGUI': 'Right Windows'
}

/**
 * 获取按键的显示名称
 */
function getKeyDisplayName(key: string): string {
  return keyDisplayNameMap[key] || key
}

/**
 * 选择按键
 */
function selectButton(index: number) {
  selectedButton.value = index
}

/**
 * 获取按键显示标签
 */
function getButtonLabel(index: number): string {
  const deviceIndex = uiToDeviceIndex[index]
  const mapping = buttonMappings.value[deviceIndex]
  if (!mapping) return `${index + 1}`

  return getButtonDisplayName(mapping, t)
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
  const deviceIndex = uiToDeviceIndex[selectedButton.value]

  // 检查当前按键是否是唯一的左键，如果是且新映射不是左键则不允许修改
  const currentMapping = buttonMappings.value[deviceIndex]
  const isCurrentLeftClick = currentMapping && currentMapping.every((byte, i) => byte === LEFT_CLICK_CODE[i])
  const isNewLeftClick = code.every((byte, i) => byte === LEFT_CLICK_CODE[i])

  if (isCurrentLeftClick && !isNewLeftClick && !willHaveLeftClickAfterChange(selectedButton.value)) {
    showError(t('buttonMapping.saveFailedNoLeftClick'))
    return
  }

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
  // 只要修饰键、按键1、按键2有一个选中即可
  if (!canSaveKeyboardMapping.value) return

  // 获取按键1的扫描码（如果有）
  let scancode = 0
  if (selectedKey.value) {
    scancode = keyboardScancodes[selectedKey.value]
    if (scancode === undefined) {
      console.error('未知的按键:', selectedKey.value)
      scancode = 0
    }
  }

  // 获取按键2的扫描码（如果有）
  let scancode2 = 0
  if (selectedKey2.value) {
    scancode2 = keyboardScancodes[selectedKey2.value]
    if (scancode2 === undefined) {
      console.error('未知的第二按键:', selectedKey2.value)
      scancode2 = 0
    }
  }

  // 计算修饰键组合
  const modifiers = selectedModifiers.value.reduce((acc, val) => acc | val, 0)

  const code = createKeyboardMapping(modifiers, scancode, scancode2)
  const deviceIndex = uiToDeviceIndex[selectedButton.value]

  // 检查当前按键是否是唯一的左键，如果是则不允许修改为键盘映射
  const currentMapping = buttonMappings.value[deviceIndex]
  const isCurrentLeftClick = currentMapping && currentMapping.every((byte, i) => byte === LEFT_CLICK_CODE[i])

  if (isCurrentLeftClick && !willHaveLeftClickAfterChange(selectedButton.value)) {
    showError(t('buttonMapping.saveFailedNoLeftClick'))
    return
  }

  buttonMappings.value[deviceIndex] = code

  // 发送到设备
  await saveToDevice()

  // 重置选择
  selectedModifiers.value = []
  selectedKey.value = ''
  selectedKey2.value = ''
}

/**
 * 恢复默认
 */
async function resetButton() {
  const deviceIndex = uiToDeviceIndex[selectedButton.value]
  buttonMappings.value[deviceIndex] = [...defaultButtonMappings[deviceIndex]]

  // 发送到设备
  await saveToDevice()
}

// ==================== 宏绑定相关函数 ====================

/**
 * 检查当前按键是否绑定了指定的宏
 */
function isCurrentMacroBinding(macroIndex: number): boolean {
  const deviceIndex = uiToDeviceIndex[selectedButton.value]
  const current = buttonMappings.value[deviceIndex]
  if (!current) return false
  // 博巨矽协议格式: [0x07, 0x00, 宏ID, 0x00]
  return current[0] === 0x07 && current[2] === macroIndex
}

/**
 * 检查如果将指定按键设置为非左键后，是否还有至少一个左键
 * @param uiIndex 要修改的UI按键索引
 * @returns true 如果修改后仍有左键
 */
function willHaveLeftClickAfterChange(uiIndex: number): boolean {
  // 检查所有 UI 显示的按键（6个按键），排除当前要修改的按键
  for (let i = 0; i < 6; i++) {
    if (i === uiIndex) continue // 跳过当前要修改的按键
    const deviceIndex = uiToDeviceIndex[i]
    const mapping = buttonMappings.value[deviceIndex]
    if (mapping && mapping.every((byte, idx) => byte === LEFT_CLICK_CODE[idx])) {
      return true
    }
  }
  return false
}

/**
 * 绑定宏到当前按键（只绑定宏ID，不发送宏配置）
 */
async function bindMacroToButton(macroIndex: number) {
  // 获取宏数据
  const macro = getMacro(macroIndex)
  if (!macro || macro.events.length === 0) {
    showWarning(t('buttonMapping.macro.eventEmpty'))
    return
  }

  // 验证宏数据
  const validation = validateMacro(macro)
  if (!validation.valid) {
    showError(validation.message)
    return
  }

  // 检查当前按键是否是唯一的左键，如果是则不允许绑定宏
  const deviceIndex = uiToDeviceIndex[selectedButton.value]
  const currentMapping = buttonMappings.value[deviceIndex]
  const isCurrentLeftClick = currentMapping && currentMapping.every((byte, i) => byte === LEFT_CLICK_CODE[i])

  if (isCurrentLeftClick && !willHaveLeftClickAfterChange(selectedButton.value)) {
    showError(t('buttonMapping.saveFailedNoLeftClick'))
    return
  }

  // 构建宏映射代码并绑定到按键
  // 博巨矽协议格式: [0x07, 0x00, 宏ID, 0x00]
  const code = [0x07, 0x00, macroIndex, 0x00]

  console.log(
    `[宏映射] UI按键${selectedButton.value + 1} (设备索引${deviceIndex}) 设置为宏${macroIndex + 1}:`,
    code
  )
  buttonMappings.value[deviceIndex] = code

  // 发送按键映射到设备
  await saveToDevice()

  // showSuccess(t('buttonMapping.macro.bindSuccess', { name: macro.name }))
}

/**
 * 重置所有按键
 */
async function resetAllButtons() {
  const confirmed = await showConfirm(t('buttonMapping.resetAllConfirm'), {
    type: 'warning',
    confirmText: t('common.confirm'),
    cancelText: t('common.cancel')
  })
  if (!confirmed) {
    return
  }

  // 重置所有按键映射
  buttonMappings.value = [...defaultButtonMappings]

  // 发送到设备
  await saveToDevice()

  console.log('[按键映射] 已重置所有按键')
  showSuccess(t('buttonMapping.resetAllSuccess'))
}

// 左键映射编码: [0x02, 0x00, 0x01, 0x00]
const LEFT_CLICK_CODE = [0x02, 0x00, 0x01, 0x00]

/**
 * 检查按键映射中是否至少有一个左键
 * @returns true 如果至少有一个左键映射
 */
function hasLeftClickMapping(): boolean {
  // 检查所有 UI 显示的按键（6个按键）
  for (let uiIndex = 0; uiIndex < 6; uiIndex++) {
    const deviceIndex = uiToDeviceIndex[uiIndex]
    const mapping = buttonMappings.value[deviceIndex]
    if (mapping && mapping.every((byte, i) => byte === LEFT_CLICK_CODE[i])) {
      return true
    }
  }
  return false
}

/**
 * 保存到设备
 */
async function saveToDevice() {
  if (!isConnected.value) {
    console.warn('设备未连接')
    return
  }

  // 检查是否至少有一个左键映射
  if (!hasLeftClickMapping()) {
    showError(t('buttonMapping.saveFailedNoLeftClick'))
    // 重新加载设备映射以恢复原状态
    await loadFromDevice()
    return
  }

  const result = await setButtonMapping(buttonMappings.value)
  if (result.success) {
    console.log('按键映射已保存:', result.message)
  } else {
    console.error('保存失败:', result.message)
  }
  loadFromDevice();
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
  background-color: var(--bg-primary);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-sm);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  color: var(--text-primary);
}

.section-title i {
  margin-right: 0.5rem;
}

.icon-primary {
  color: var(--color-primary);
}

.section-description {
  color: var(--text-tertiary);
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
    grid-template-columns: 450px 1fr;
  }
}

.mouse-diagram {
  display: flex;
  align-items: center;
  position: relative;
  flex-direction: column;
}

.mouse-body {
  width: 16rem;
  height: 24rem;
  background-image: url('../assets/basicSettings/mouse.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  padding: 1rem;
  position: relative;
}

/* 鼠标按键基础样式 */
.mouse-mode .mouse-key {
  position: absolute;
  width: 110px;
  min-height: 32px;
  padding: 0.25rem 0.5rem;
  user-select: none;
  border-radius: 0.5rem;
  background-color: var(--bg-primary);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--border-primary);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;

  /* 默认颜色变量 */
  --mouse-key-line: var(--border-primary);
  --mouse-key-dot: var(--border-primary);
}

.mouse-mode .mouse-key:hover {
  border-color: var(--color-primary);
  background-color: var(--bg-hover);
  --mouse-key-line: var(--color-primary);
  --mouse-key-dot: var(--color-primary);
}

.mouse-mode .mouse-key:hover .button-label {
  color: var(--color-primary);
}

.mouse-mode .mouse-key.active {
  border-color: var(--color-primary);
  background-color: var(--bg-active);
  --mouse-key-line: var(--color-primary);
  --mouse-key-dot: var(--color-primary);
}

.mouse-mode .mouse-key .button-label {
  font-size: 0.7rem;
  font-weight: 500;
  word-break: break-word;
  line-height: 1.2;
  color: var(--text-primary);
}

.mouse-mode .mouse-key.active .button-label {
  color: var(--color-primary);
}

/* 连接线基础样式 */
.mouse-mode .mouse-key:before {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 0;
  border-bottom: 1px solid var(--mouse-key-line);
  z-index: -1;
  pointer-events: none;
}

/* 连接线末端小圆圈 */
.mouse-mode .mouse-key:after {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background-color: var(--mouse-key-dot);
  border-radius: 50%;
  z-index: -1;
  pointer-events: none;
}

/* 按键 1 - 左键 */
.mouse-mode .key0 {
  top: 5px;
  left: -90px;
}

.mouse-mode .key0:before {
  left: 100%;
  width: 86px;
}

.mouse-mode .key0:after {
  left: calc(100% + 86px - 4px);
}

/* 按键 2 - 右键 */
.mouse-mode .key1 {
  top: 5px;
  right: -82px;
}

.mouse-mode .key1:before {
  right: 100%;
  width: 76px;
}

.mouse-mode .key1:after {
  right: calc(100% + 76px - 4px);
}

/* 按键 3 - 中键 */
.mouse-mode .key2 {
  top: 65px;
  right: -82px;
}

.mouse-mode .key2:before {
  right: 100%;
  width: 98px;
}

.mouse-mode .key2:after {
  right: calc(100% + 98px - 4px);
}

/* 按键 4 - 前进 */
.mouse-mode .key3 {
  top: 112px;
  left: -90px;
}

.mouse-mode .key3:before {
  left: 100%;
  width: 29px;
}

.mouse-mode .key3:after {
  left: calc(100% + 29px - 4px);
}

/* 按键 5 - 后退 */
.mouse-mode .key4 {
  top: 180px;
  left: -90px;
}

.mouse-mode .key4:before {
  left: 100%;
  width: 29px;
}

.mouse-mode .key4:after {
  left: calc(100% + 29px - 4px);
}

/* 按键 6 - DPI键 */
.mouse-mode .key5 {
  top: 125px;
  right: -82px;
}

.mouse-mode .key5:before {
  right: 100%;
  width: 97px;
}

.mouse-mode .key5:after {
  right: calc(100% + 97px - 4px);
}

.button-settings {
  flex: 1;
}

.settings-panel {
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1.25rem;
  background-color: var(--bg-primary);
}

.panel-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 10px;
}

.panel-title {
  font-weight: 500;
  margin: 0;
  color: var(--text-primary);
}

.reset-button {
  padding: 0.3rem 0.8rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.reset-button:hover:not(:disabled) {
  background-color: #1557cc;
}

.reset-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-button i {
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
  border-bottom: 2px solid var(--border-primary);
  margin-bottom: 1rem;
}

.tab-button {
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-tertiary);
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
  max-height: 300px;
  overflow-y: auto;
}

/* 按钮网格 */
.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
}

.function-button {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.function-button:hover {
  border-color: var(--color-primary);
  background-color: var(--bg-hover);
}

.function-button.active {
  border-color: var(--color-primary);
  background-color: var(--bg-active);
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
  color: var(--text-secondary);
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
  color: var(--text-secondary);
  font-weight: 500;
}

.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  outline: none;
  transition: all 0.2s;
  cursor: pointer;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.form-select:focus {
  border-color: var(--color-primary);
}

.modifier-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

/* 修饰键按钮样式 */
.modifier-buttons {
  grid-template-columns: repeat(4, 1fr);
  max-width: 400px;
}

.modifier-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.modifier-checkbox input[type='checkbox'] {
  accent-color: var(--color-primary);
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.modifier-checkbox span {
  font-size: 0.875rem;
  color: var(--text-primary);
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
  color: var(--text-primary);
}

.radio-label input[type='radio'] {
  accent-color: var(--color-primary);
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  outline: none;
  transition: all 0.2s;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.form-input:focus {
  border-color: var(--color-primary);
}

/* 重置所有按键按钮 */
.mouse-diagram .reset-all-button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.mouse-diagram .reset-all-button:hover {
  background-color: #1557cc;
}

.mouse-diagram .reset-all-button i {
  margin-right: 0.5rem;
}

/* 去添加/修改宏按钮 */
.go-macro-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  border: 1px dashed var(--color-primary);
  border-radius: 0.5rem;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.go-macro-btn:hover {
  background-color: var(--bg-active);
}

/* 无可用宏提示 */
.empty-macro-hint {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.875rem;
}
</style>
