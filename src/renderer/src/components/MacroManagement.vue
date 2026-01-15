<template>
  <div class="macro-management-container">
    <div class="section-header">
      <p class="section-description">{{ t('macroManagement.description') }}</p>
    </div>

    <div class="macro-layout">
      <!-- 左侧：宏列表和管理 -->
      <div class="macro-list-section">
        <div class="section-subtitle-contain">
          <h5 class="section-subtitle">{{ t('buttonMapping.macro.list') }}</h5>
          <button @click="goToButtonMapping" class="go-binding-btn">
            <i class="fa fa-link"></i>
            {{ t('buttonMapping.macro.goToBinding') }}
          </button>
        </div>
        <div class="macro-list">
          <div v-if="macros.length === 0" class="empty-macros">
            <i class="fa fa-info-circle"></i>
            {{ t('buttonMapping.macro.empty') }}
          </div>
          <button
            v-else
            v-for="(macro, index) in macros"
            :key="index"
            @click="selectMacroForEdit(index)"
            class="macro-list-item"
            :class="{ active: selectedMacroForEdit === index }"
            :disabled="isRecording"
          >
            <span class="macro-item-name">{{ macro.name }}</span>
            <span class="macro-item-count">{{
              t('buttonMapping.macro.eventCount', { count: String(macro.events.length) })
            }}</span>
          </button>
        </div>

        <div class="macro-list-actions">
          <button
            @click="createNewMacro"
            class="macro-action-btn"
            :disabled="macros.length >= MAX_MACRO_COUNT || isRecording"
          >
            <i class="fa fa-plus"></i>
            {{ t('buttonMapping.macro.newMacro') }} ({{ macros.length }}/{{
              MAX_MACRO_COUNT
            }})
          </button>
          <button
            @click="deleteSelectedMacro"
            class="macro-action-btn delete-macro-btn"
            :disabled="selectedMacroForEdit === null || isRecording"
          >
            <i class="fa fa-trash"></i>
            {{ t('buttonMapping.macro.deleteMacro') }}
          </button>
        </div>
      </div>

      <!-- 右侧：宏编辑和录制 -->
      <div class="macro-edit-section">
        <!-- 宏录制控制 -->
        <div class="macro-record-area">
          <h5 class="section-subtitle">
            <i class="fa fa-circle-notch"></i>
            {{ t('buttonMapping.macro.record') }}
          </h5>

          <button
            @click="toggleMacroRecord"
            :disabled="!isConnected || selectedMacroForEdit === null"
            :class="isRecording ? 'stop-record-btn' : 'start-record-btn'"
            class="record-control-btn"
          >
            <i :class="isRecording ? 'fa fa-stop' : 'fa fa-circle'"></i>
            {{
              isRecording
                ? t('buttonMapping.macro.stopRecord')
                : t('buttonMapping.macro.startRecord')
            }}
          </button>

          <div v-if="isRecording" class="recording-status">
            <i class="fa fa-circle recording-pulse"></i>
            <span>{{ t('buttonMapping.macro.recording') }}</span>
          </div>

          <div v-if="!isConnected" class="macro-notice">
            <i class="fa fa-info-circle"></i>
            {{ t('buttonMapping.macro.connectFirst') }}
          </div>

          <div v-if="isConnected && selectedMacroForEdit === null" class="macro-notice">
            <i class="fa fa-info-circle"></i>
            {{ t('buttonMapping.macro.selectFirst') }}
          </div>
        </div>

        <!-- 宏事件列表 -->
        <div class="macro-events-area">
          <div class="events-header">
            <h5 class="section-subtitle">
              {{ t('buttonMapping.macro.eventList') }}
              <span v-if="currentEditingMacro.name" class="macro-name-badge">
                {{ currentEditingMacro.name }}
              </span>
            </h5>
            <div class="events-actions">
              <button
                @click="clearAllMacroEvents"
                class="event-action-btn"
                :disabled="currentEditingMacro.events.length === 0 || isRecording"
                :title="t('buttonMapping.macro.clearAll')"
              >
                <i class="fa fa-trash"></i>
                {{ t('buttonMapping.macro.clearAll') }}
              </button>
            </div>
          </div>

          <div class="events-list">
            <div v-if="currentEditingMacro.events.length === 0" class="empty-events">
              {{ t('buttonMapping.macro.emptyEvents') }}
            </div>
            <div
              v-else
              v-for="(event, index) in currentEditingMacro.events"
              :key="index"
              class="event-item"
              :class="{ selected: selectedMacroEventIndex === index, editing: editingKeyIndex === index }"
            >
              <!-- 序号 -->
              <span class="event-number">{{ index + 1 }}</span>

              <!-- 按键编辑按钮 -->
              <button
                class="event-key-btn"
                :class="{ active: editingKeyIndex === index }"
                @click.stop="startEditKey(index)"
                :disabled="isRecording"
                :title="t('buttonMapping.macro.clickToEditKey')"
              >
                {{ event.key }}
              </button>

              <!-- 按下/抬起切换按钮 -->
              <button
                class="event-type-toggle"
                :class="{ 'is-down': event.type === 'keydown' || event.type === 'mousedown' }"
                @click.stop="toggleEventType(index)"
                :disabled="isRecording"
                :title="t('buttonMapping.macro.clickToToggleType')"
              >
                <span class="toggle-track">
                  <span class="toggle-thumb"></span>
                </span>
                <span class="toggle-label">
                  {{
                    (event.type === 'keydown' || event.type === 'mousedown')
                      ? t('buttonMapping.macro.keyDown')
                      : t('buttonMapping.macro.keyUp')
                  }}
                </span>
              </button>

              <!-- 延迟编辑 -->
              <div class="event-delay-wrapper">
                <span
                  v-if="editingDelayIndex !== index"
                  class="event-delay"
                  @click.stop="startEditDelay(index)"
                  :title="t('buttonMapping.macro.clickToEditDelay')"
                >
                  {{ t('buttonMapping.macro.delay', { ms: String(event.delay) }) }}
                </span>
                <div v-else class="delay-edit-input" @click.stop>
                  <input
                    type="number"
                    v-model.number="editingDelayValue"
                    min="0"
                    max="32768"
                    class="delay-input"
                    @keyup.enter="confirmEditDelay"
                    @keyup.escape="cancelEditDelay"
                    @blur="confirmEditDelay"
                    autofocus
                  />
                  <span class="delay-unit">ms</span>
                </div>
              </div>

              <!-- 添加事件按钮 -->
              <div class="add-event-wrapper">
                <button
                  class="add-event-btn"
                  @click.stop="toggleAddEventDropdown(index, $event)"
                  :disabled="isRecording"
                  :title="t('buttonMapping.macro.addEvent')"
                >
                  <i class="fa fa-plus-circle"></i>
                </button>
              </div>

              <!-- 删除按钮 -->
              <button
                class="event-delete-btn"
                @click.stop="removeEventAtIndex(index)"
                :disabled="isRecording"
                :title="t('buttonMapping.macro.deleteEvent')"
              >
                <i class="fa fa-minus-circle"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 循环模式设置 -->
<!--        <div v-if="selectedMacroForEdit !== null" class="macro-loop-settings">-->
<!--          <div class="form-group">-->
<!--            <label class="form-label">{{-->
<!--              t('buttonMapping.macro.binding.loopMode')-->
<!--            }}</label>-->
<!--            <div class="radio-group horizontal">-->
<!--              <label class="radio-label">-->
<!--                <input type="radio" v-model="currentEditingMacro.loopMode" value="release" :disabled="isRecording" @change="saveMacroLoopSettings" />-->
<!--                <span>{{ t('buttonMapping.macro.binding.loopRelease') }}</span>-->
<!--              </label>-->
<!--              <label class="radio-label">-->
<!--                <input type="radio" v-model="currentEditingMacro.loopMode" value="toggle" :disabled="isRecording" @change="saveMacroLoopSettings" />-->
<!--                <span>{{ t('buttonMapping.macro.binding.loopToggle') }}</span>-->
<!--              </label>-->
<!--              <label class="radio-label">-->
<!--                <input type="radio" v-model="currentEditingMacro.loopMode" value="anykey" :disabled="isRecording" @change="saveMacroLoopSettings" />-->
<!--                <span>{{ t('buttonMapping.macro.binding.loopAnykey') }}</span>-->
<!--              </label>-->
<!--              <label class="radio-label">-->
<!--                <input type="radio" v-model="currentEditingMacro.loopMode" value="count" :disabled="isRecording" @change="saveMacroLoopSettings" />-->
<!--                <span>{{ t('buttonMapping.macro.binding.loopCount') }}</span>-->
<!--              </label>-->
<!--            </div>-->
<!--          </div>-->

<!--          <div v-if="currentEditingMacro.loopMode === 'count'" class="form-group loop-count-group">-->
<!--            <label class="form-label">{{-->
<!--              t('buttonMapping.macro.binding.loopCountLabel')-->
<!--            }}</label>-->
<!--            <input-->
<!--              type="number"-->
<!--              v-model.number="currentEditingMacro.loopCount"-->
<!--              class="form-input loop-count-input"-->
<!--              min="1"-->
<!--              max="65532"-->
<!--              :placeholder="t('buttonMapping.macro.binding.loopCountPlaceholder')"-->
<!--              :disabled="isRecording"-->
<!--              @change="saveMacroLoopSettings"-->
<!--            />-->
<!--          </div>-->
<!--        </div>-->

        <!-- 添加事件下拉框 -->
        <Teleport to="body">
          <div
            v-if="showAddEventDropdown !== null"
            class="add-event-dropdown"
            :style="{ top: dropdownPosition.top + 'px', left: dropdownPosition.left + 'px' }"
          >
            <button
              class="dropdown-option"
              @click.stop="addKeyboardEventAfter(showAddEventDropdown)"
            >
              <i class="fa fa-keyboard"></i>
              {{ t('buttonMapping.macro.addKeyboard') }}
            </button>
            <button
              class="dropdown-option"
              @click.stop="addMouseEventAfter(showAddEventDropdown)"
            >
              <i class="fa fa-mouse-pointer"></i>
              {{ t('buttonMapping.macro.addMouse') }}
            </button>
            <button
              class="dropdown-option disabled"
              @click.stop="addXYEventAfter(showAddEventDropdown)"
            >
              <i class="fa fa-crosshairs"></i>
              {{ t('buttonMapping.macro.addXY') }}
            </button>
          </div>
        </Teleport>
      </div>
      <!-- 循环模式设置 -->
      <div  class="macro-loop-settings">
        <div class="form-group">
          <label class="form-label">{{
              t('buttonMapping.macro.binding.loopMode')
            }}</label>
          <div class="radio-group horizontal">
            <label class="radio-label">
              <input type="radio" v-model="currentEditingMacro.loopMode" value="release" :disabled="isRecording || selectedMacroForEdit === null" @change="saveMacroLoopSettings" />
              <span>{{ t('buttonMapping.macro.binding.loopRelease') }}</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="currentEditingMacro.loopMode" value="toggle" :disabled="isRecording|| selectedMacroForEdit === null" @change="saveMacroLoopSettings" />
              <span>{{ t('buttonMapping.macro.binding.loopToggle') }}</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="currentEditingMacro.loopMode" value="anykey" :disabled="isRecording|| selectedMacroForEdit === null" @change="saveMacroLoopSettings" />
              <span>{{ t('buttonMapping.macro.binding.loopAnykey') }}</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="currentEditingMacro.loopMode" value="count" :disabled="isRecording|| selectedMacroForEdit === null" @change="saveMacroLoopSettings" />
              <span>{{ t('buttonMapping.macro.binding.loopCount') }}</span>
            </label>
          </div>
        </div>

        <div v-if="currentEditingMacro.loopMode === 'count'" class="form-group loop-count-group">
          <label class="form-label">{{
              t('buttonMapping.macro.binding.loopCountLabel')
            }}</label>
          <input
            type="number"
            v-model.number="currentEditingMacro.loopCount"
            class="form-input loop-count-input"
            min="1"
            max="65532"
            :placeholder="t('buttonMapping.macro.binding.loopCountPlaceholder')"
            :disabled="isRecording"
            @change="saveMacroLoopSettings"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useWebHID } from '../composables/useWebHID'
import { useI18n } from '../composables/useI18n'
import { useMessageBox } from '../composables/useMessageBox'
import { useConfirmBox } from '../composables/useConfirmBox'
import {
  useMacroStorage,
  type MacroEvent,
  type Macro
} from '../composables/useMacroStorage'

const emit = defineEmits<{
  (e: 'switchTab', tab: string, subTab?: string): void
}>()

/**
 * 跳转到按键映射页面并打开宏子标签页
 */
function goToButtonMapping() {
  emit('switchTab', 'buttons', 'macro')
}

const {
  isConnected,
  setMacro: setDeviceMacro,
  deleteMacro: deleteDeviceMacro
} = useWebHID()
const {
  macros,
  getMacro,
  addMacro,
  updateMacro,
  deleteMacro: deleteStoredMacro,
  getNextMacroName,
  encodeMacroForDevice,
  getMacroCodeFromKeyName,
  validateMacro,
  MAX_MACRO_COUNT
} = useMacroStorage()
const { t } = useI18n()
const { error: showError, warning: showWarning } = useMessageBox()
const { confirm: showConfirm } = useConfirmBox()

// 宏管理相关变量
const selectedMacroForEdit = ref<number | null>(null)
const currentEditingMacro = ref<Macro>({
  name: '',
  events: [],
  loopMode: 'release',
  loopCount: 1
})
const isRecording = ref(false)
const lastActionTime = ref(0)
const recordedEvents = ref<MacroEvent[]>([])
const pressedKeys = ref<Map<string, { eventIndex: number; startTime: number }>>(new Map())
const selectedMacroEventIndex = ref<number | null>(null)

// 宏事件编辑相关变量
const editingKeyIndex = ref<number | null>(null)
const editingDelayIndex = ref<number | null>(null)
const editingDelayValue = ref<number>(0)
const showAddEventDropdown = ref<number | null>(null)
const dropdownPosition = ref({ top: 0, left: 0 })

/**
 * 选择宏进行编辑
 */
function selectMacroForEdit(index: number) {
  selectedMacroForEdit.value = index
  const macro = getMacro(index)
  if (macro) {
    currentEditingMacro.value = { ...macro }
  }
}

/**
 * 新建宏
 */
function createNewMacro() {
  if (macros.value.length >= MAX_MACRO_COUNT) {
    showWarning(t('buttonMapping.macro.maxReached', { max: String(MAX_MACRO_COUNT) }))
    return
  }

  const newMacroName = getNextMacroName()
  const newMacroData: Macro = {
    name: newMacroName,
    events: [],
    loopMode: 'release',
    loopCount: 1
  }

  if (addMacro(newMacroData)) {
    selectedMacroForEdit.value = macros.value.length - 1
    currentEditingMacro.value = { ...newMacroData }
    console.log('[宏管理] 已创建新宏:', newMacroName)
  } else {
    showError(t('buttonMapping.macro.saveError', { message: 'Failed to add macro' }))
  }
}

/**
 * 删除选中的宏
 */
async function deleteSelectedMacro() {
  if (selectedMacroForEdit.value === null) {
    showWarning(t('buttonMapping.macro.selectMacro'))
    return
  }

  const confirmed = await showConfirm(t('buttonMapping.macro.deleteConfirm', { name: currentEditingMacro.value.name }), {
    type: 'danger',
    confirmText: t('common.delete'),
    cancelText: t('common.cancel')
  })
  if (!confirmed) {
    return
  }

  const macroIndexToDelete = selectedMacroForEdit.value

  // 从设备删除宏
  if (isConnected.value && currentEditingMacro.value.events.length > 0) {
    const result = await deleteDeviceMacro(macroIndexToDelete)
    if (!result.success) {
      showError(t('buttonMapping.macro.saveError', { message: result.message }))
    }
  }

  // 从本地存储删除宏
  if (deleteStoredMacro(macroIndexToDelete)) {
    if (macros.value.length > 0) {
      selectedMacroForEdit.value = 0
      currentEditingMacro.value = { ...macros.value[0] }
    } else {
      selectedMacroForEdit.value = null
      currentEditingMacro.value = {
        name: '',
        events: [],
        loopMode: 'release',
        loopCount: 1
      }
    }
    console.log('[宏管理] 宏已删除')
  } else {
    showError(t('buttonMapping.macro.saveError', { message: 'Failed to delete macro' }))
  }
}

/**
 * 保存当前编辑的宏到设备
 */
async function saveMacroToDevice() {
  if (selectedMacroForEdit.value === null) {
    showWarning(t('buttonMapping.macro.selectMacro'))
    return
  }

  const macro = currentEditingMacro.value
  if (macro.events.length === 0) {
    showWarning(t('buttonMapping.macro.eventEmpty'))
    return
  }

  const validation = validateMacro(macro)
  if (!validation.valid) {
    showError(validation.message)
    return
  }

  updateMacro(selectedMacroForEdit.value, macro)

  const { data: encodedMacroData } = encodeMacroForDevice(
    macro.events,
    macro.loopMode,
    macro.loopCount
  )

  if (isConnected.value) {
    const result = await setDeviceMacro(selectedMacroForEdit.value, encodedMacroData)
    if (!result.success) {
      showError(t('buttonMapping.macro.saveError', { message: result.message }))
      return
    }
  }
}

/**
 * 保存宏的循环模式设置
 */
async function saveMacroLoopSettings() {
  if (selectedMacroForEdit.value !== null) {
    updateMacro(selectedMacroForEdit.value, currentEditingMacro.value)
    console.log('[宏管理] 已保存循环模式设置')
    await saveMacroToDevice()
  }
}

/**
 * 切换录制状态
 */
async function toggleMacroRecord() {
  if (isRecording.value) {
    isRecording.value = false
    console.log('[宏录制] 结束录制，共录制', recordedEvents.value.length, '个事件')

    if (selectedMacroForEdit.value !== null) {
      updateMacro(selectedMacroForEdit.value, currentEditingMacro.value)
      console.log('[宏录制] 已保存宏数据到本地存储')
      await saveMacroToDevice()
    }
  } else {
    isRecording.value = true
    recordedEvents.value = [...currentEditingMacro.value.events]
    pressedKeys.value.clear()
    selectedMacroEventIndex.value = null
    lastActionTime.value = Date.now()
    console.log('[宏录制] 开始录制，当前已有', currentEditingMacro.value.events.length, '个事件')
  }
}

/**
 * 清空所有宏事件
 */
async function clearAllMacroEvents() {
  const confirmed = await showConfirm(t('buttonMapping.macro.clearAllConfirm'), {
    type: 'warning',
    confirmText: t('common.confirm'),
    cancelText: t('common.cancel')
  })
  if (!confirmed) return
  currentEditingMacro.value.events = []
  recordedEvents.value = []
  selectedMacroEventIndex.value = null

  if (selectedMacroForEdit.value !== null) {
    updateMacro(selectedMacroForEdit.value, currentEditingMacro.value)
    await saveMacroToDevice()
  }
  console.log('[宏管理] 已清空所有事件')
}

// ==================== 宏事件编辑功能 ====================

function startEditKey(index: number) {
  if (isRecording.value) return
  editingKeyIndex.value = index
  document.addEventListener('keydown', handleEditKeyDown)
  document.addEventListener('mousedown', handleEditMouseDown)
}

function cancelEditKey() {
  editingKeyIndex.value = null
  document.removeEventListener('keydown', handleEditKeyDown)
  document.removeEventListener('mousedown', handleEditMouseDown)
}

function getDisplayKeyName(key: string): string {
  const specialKeyMap: Record<string, string> = {
    ' ': 'Space',
    'ArrowUp': 'Up',
    'ArrowDown': 'Down',
    'ArrowLeft': 'Left',
    'ArrowRight': 'Right'
  }

  if (specialKeyMap[key]) {
    return specialKeyMap[key]
  }

  if (key.length === 1) {
    return key.toUpperCase()
  }

  return key
}

async function handleEditKeyDown(e: KeyboardEvent) {
  if (editingKeyIndex.value === null) return
  e.preventDefault()
  e.stopPropagation()

  const macroCode = getMacroCodeFromKeyName(e.key)
  if (macroCode === 0x00) {
    console.warn('[宏编辑] 未知按键:', e.key)
    return
  }

  const event = currentEditingMacro.value.events[editingKeyIndex.value]
  if (event) {
    event.key = getDisplayKeyName(e.key)
    event.macroCode = macroCode
    if (selectedMacroForEdit.value !== null) {
      updateMacro(selectedMacroForEdit.value, currentEditingMacro.value)
      await saveMacroToDevice()
    }
  }

  cancelEditKey()
}

async function handleEditMouseDown(e: MouseEvent) {
  if (editingKeyIndex.value === null) return

  const target = e.target as HTMLElement
  if (target.closest('.event-key-btn')) {
    return
  }

  let macroCode = 0
  let keyName = ''
  switch (e.button) {
    case 0:
      macroCode = 0xf0
      keyName = 'MouseLeft'
      break
    case 1:
      macroCode = 0xf2
      keyName = 'MouseMiddle'
      break
    case 2:
      macroCode = 0xf1
      keyName = 'MouseRight'
      break
    case 3:
      macroCode = 0xf4
      keyName = 'MouseBack'
      break
    case 4:
      macroCode = 0xf3
      keyName = 'MouseForward'
      break
  }

  if (macroCode === 0) {
    cancelEditKey()
    return
  }

  e.preventDefault()
  e.stopPropagation()

  const event = currentEditingMacro.value.events[editingKeyIndex.value]
  if (event) {
    event.key = keyName
    event.macroCode = macroCode
    if (selectedMacroForEdit.value !== null) {
      updateMacro(selectedMacroForEdit.value, currentEditingMacro.value)
      await saveMacroToDevice()
    }
  }

  cancelEditKey()
}

async function toggleEventType(index: number) {
  if (isRecording.value) return
  const event = currentEditingMacro.value.events[index]
  if (event) {
    if (event.type === 'keydown' || event.type === 'mousedown') {
      event.type = event.key.startsWith('Mouse') ? 'mouseup' : 'keyup'
    } else {
      event.type = event.key.startsWith('Mouse') ? 'mousedown' : 'keydown'
    }
    if (selectedMacroForEdit.value !== null) {
      updateMacro(selectedMacroForEdit.value, currentEditingMacro.value)
      await saveMacroToDevice()
    }
  }
}

async function removeEventAtIndex(index: number) {
  if (isRecording.value) return
  currentEditingMacro.value.events.splice(index, 1)
  recordedEvents.value.splice(index, 1)
  if (selectedMacroEventIndex.value === index) {
    selectedMacroEventIndex.value = null
  }
  if (selectedMacroForEdit.value !== null) {
    updateMacro(selectedMacroForEdit.value, currentEditingMacro.value)
    await saveMacroToDevice()
  }
  console.log('[宏管理] 已删除事件:', index)
}

function startEditDelay(index: number) {
  if (isRecording.value) return
  editingDelayIndex.value = index
  editingDelayValue.value = currentEditingMacro.value.events[index]?.delay || 0
}

async function confirmEditDelay() {
  if (editingDelayIndex.value === null) return
  const event = currentEditingMacro.value.events[editingDelayIndex.value]
  if (event) {
    let delay = Math.round(editingDelayValue.value)
    if (delay < 0) delay = 0
    if (delay > 32768) delay = 32768
    event.delay = delay
    if (selectedMacroForEdit.value !== null) {
      updateMacro(selectedMacroForEdit.value, currentEditingMacro.value)
      await saveMacroToDevice()
    }
  }
  editingDelayIndex.value = null
}

function cancelEditDelay() {
  editingDelayIndex.value = null
}

function toggleAddEventDropdown(index: number, event: MouseEvent) {
  if (isRecording.value) return
  if (showAddEventDropdown.value === index) {
    showAddEventDropdown.value = null
  } else {
    const button = event.currentTarget as HTMLElement
    const rect = button.getBoundingClientRect()
    dropdownPosition.value = {
      top: rect.bottom + 4,
      left: rect.right - 140
    }
    showAddEventDropdown.value = index
  }
}

function closeAddEventDropdown() {
  showAddEventDropdown.value = null
}

async function addKeyboardEventAfter(index: number) {
  const newEvent: MacroEvent = {
    type: 'keydown',
    key: 'A',
    macroCode: 0x04,
    delay: 30
  }
  currentEditingMacro.value.events.splice(index + 1, 0, newEvent)
  recordedEvents.value.splice(index + 1, 0, newEvent)
  if (selectedMacroForEdit.value !== null) {
    updateMacro(selectedMacroForEdit.value, currentEditingMacro.value)
    await saveMacroToDevice()
  }
  closeAddEventDropdown()
  console.log('[宏管理] 已添加键盘按键事件')
}

async function addMouseEventAfter(index: number) {
  const newEvent: MacroEvent = {
    type: 'mousedown',
    key: 'MouseLeft',
    macroCode: 0xf0,
    delay: 30
  }
  currentEditingMacro.value.events.splice(index + 1, 0, newEvent)
  recordedEvents.value.splice(index + 1, 0, newEvent)
  if (selectedMacroForEdit.value !== null) {
    updateMacro(selectedMacroForEdit.value, currentEditingMacro.value)
    await saveMacroToDevice()
  }
  closeAddEventDropdown()
  console.log('[宏管理] 已添加鼠标按键事件')
}

function addXYEventAfter(_index: number) {
  showWarning(t('buttonMapping.macro.xyNotSupported'))
  closeAddEventDropdown()
}

function handleClickOutsideDropdown(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.add-event-dropdown') && !target.closest('.add-event-btn')) {
    closeAddEventDropdown()
  }
}

// ==================== 键盘录制事件处理 ====================

function handleKeyDown(e: KeyboardEvent) {
  if (!isRecording.value) return

  e.preventDefault()

  if (pressedKeys.value.has(e.key)) {
    return
  }

  const now = Date.now()
  const macroCode = getMacroCodeFromKeyName(e.key)

  if (macroCode === 0x00) {
    console.warn('[宏录制] 未知按键:', e.key)
    return
  }

  const event: MacroEvent = {
    type: 'keydown',
    key: getDisplayKeyName(e.key),
    macroCode,
    delay: 0
  }

  const eventIndex = recordedEvents.value.length
  pressedKeys.value.set(e.key, { eventIndex, startTime: now })

  recordedEvents.value.push(event)
  currentEditingMacro.value.events.push(event)
  console.log('[宏录制] 按键按下:', event)
}

function handleKeyUp(e: KeyboardEvent) {
  if (!isRecording.value) return

  e.preventDefault()

  const pressedKey = pressedKeys.value.get(e.key)
  if (!pressedKey) {
    console.warn('[宏录制] 按键未按下就抬起:', e.key)
    return
  }

  const now = Date.now()
  const holdDuration = now - pressedKey.startTime
  const macroCode = getMacroCodeFromKeyName(e.key)

  if (macroCode === 0x00) {
    console.warn('[宏录制] 未知按键:', e.key)
    return
  }

  if (recordedEvents.value[pressedKey.eventIndex]) {
    recordedEvents.value[pressedKey.eventIndex].delay = holdDuration
    if (currentEditingMacro.value.events[pressedKey.eventIndex]) {
      currentEditingMacro.value.events[pressedKey.eventIndex].delay = holdDuration
    }
  }

  const event: MacroEvent = {
    type: 'keyup',
    key: getDisplayKeyName(e.key),
    macroCode,
    delay: 0
  }

  recordedEvents.value.push(event)
  currentEditingMacro.value.events.push(event)

  lastActionTime.value = now
  pressedKeys.value.delete(e.key)

  console.log('[宏录制] 按键抬起:', event, '持续时间:', holdDuration, 'ms')
}

onMounted(() => {
  document.addEventListener('click', handleClickOutsideDropdown)
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutsideDropdown)
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('keyup', handleKeyUp)
  document.removeEventListener('keydown', handleEditKeyDown)
  document.removeEventListener('mousedown', handleEditMouseDown)
})
</script>

<style scoped>
.macro-management-container {
  background-color: var(--bg-primary);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-sm);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-description {
  color: var(--text-tertiary);
  font-size: 0.875rem;
  margin: 0;
}

/* 去绑定到按键按钮 */
.go-binding-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px dashed var(--color-primary);
  border-radius: 0.5rem;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.go-binding-btn:hover {
  background-color: var(--bg-active);
}

.macro-layout {
  display: flex;
  gap: 1.5rem;
  justify-content: space-between;
}


/* 宏列表区域 */
.macro-list-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}
.section-subtitle-contain{
  display: flex;
  flex-direction: row;
  gap: 15px;
}
.section-subtitle {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-hint {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin: 0;
}

.macro-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 150px;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  background-color: var(--bg-tertiary);
}

.empty-macros {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.875rem;
  gap: 0.5rem;
}

.empty-macros i {
  font-size: 2rem;
  opacity: 0.5;
}

.macro-list-item {
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
}

.macro-list-item:hover:not(:disabled) {
  border-color: var(--color-primary);
  background-color: var(--bg-hover);
}

.macro-list-item.active {
  border-color: var(--color-primary);
  background-color: var(--bg-active);
}

.macro-list-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.macro-item-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.macro-item-count {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.macro-list-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.macro-action-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.macro-action-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.macro-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-macro-btn {
  color: var(--color-danger);
  border-color: rgba(245, 63, 63, 0.3);
}

.delete-macro-btn:hover:not(:disabled) {
  background-color: rgba(245, 63, 63, 0.05);
  border-color: var(--color-danger);
}

/* 宏编辑区域 */
.macro-edit-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.macro-record-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.record-control-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.start-record-btn {
  background-color: var(--color-primary);
  color: white;
}

.start-record-btn:hover:not(:disabled) {
  background-color: #1557cc;
}

.stop-record-btn {
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
}

.stop-record-btn:hover:not(:disabled) {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.record-control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recording-status {
  padding: 0.75rem;
  background-color: rgba(114, 46, 209, 0.1);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-accent);
}

.recording-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.macro-notice {
  padding: 0.75rem;
  background-color: var(--bg-tertiary);
  border-radius: 0.375rem;
  color: var(--text-tertiary);
  text-align: center;
  font-size: 0.875rem;
}

.macro-notice i {
  margin-right: 0.5rem;
}

/* 宏事件列表 */
.macro-events-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.macro-name-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: var(--bg-active);
  color: var(--color-primary);
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 0.5rem;
}

.events-actions {
  display: flex;
  gap: 0.5rem;
}

.event-action-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.event-action-btn:hover:not(:disabled) {
  color: var(--color-primary);
}

.event-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.events-list {
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  max-height: 250px;
  overflow-y: auto;
  background-color: var(--bg-primary);
}

.empty-events {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

/* 事件项布局 */
.event-item {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  cursor: default;
}

.event-item:last-child {
  border-bottom: none;
}

.event-item:hover {
  background-color: var(--bg-tertiary);
}

.event-item.editing {
  background-color: var(--bg-active);
}

.event-number {
  min-width: 28px;
}

/* 按键编辑按钮 */
.event-key-btn {
  min-width: 95px;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: 0.375rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.event-key-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  background-color: var(--bg-hover);
}

.event-key-btn.active {
  border-color: var(--color-primary);
  background-color: var(--bg-active);
  color: var(--color-primary);
  animation: pulse-border 1.5s ease-in-out infinite;
}

@keyframes pulse-border {
  0%, 100% { box-shadow: 0 0 0 0 rgba(22, 93, 255, 0.4); }
  50% { box-shadow: 0 0 0 4px rgba(22, 93, 255, 0.1); }
}

.event-key-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 按下/抬起切换按钮 */
.event-type-toggle {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s;
}

.event-type-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-track {
  width: 28px;
  height: 16px;
  border-radius: 8px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  position: relative;
  transition: all 0.2s;
}

.event-type-toggle.is-down .toggle-track {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--text-tertiary);
  transition: all 0.2s;
}

.event-type-toggle.is-down .toggle-thumb {
  left: 14px;
  background-color: white;
}

.toggle-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  min-width: 28px;
}

.event-type-toggle.is-down .toggle-label {
  color: var(--color-primary);
}

/* 删除按钮 */
.event-delete-btn {
  padding: 0.25rem;
  border: none;
  background: none;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.event-delete-btn:hover:not(:disabled) {
  color: var(--color-danger);
}

.event-delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 延迟编辑 */
.event-delay-wrapper {
  display: flex;
  align-items: center;
  min-width: 96px;
}

.event-delay {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.event-delay:hover {
  background-color: var(--bg-hover);
  color: var(--color-primary);
}

.delay-edit-input {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.delay-input {
  width: 60px;
  padding: 0.25rem 0.375rem;
  border: 1px solid var(--color-primary);
  border-radius: 0.25rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.75rem;
  text-align: right;
  outline: none;
}

.delay-input:focus {
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.2);
}

.delay-unit {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

/* 添加事件按钮 */
.add-event-wrapper {
  position: relative;
}

.add-event-btn {
  padding: 0.25rem;
  border: none;
  background: none;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.add-event-btn:hover:not(:disabled) {
  color: var(--color-primary);
}

.add-event-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 循环模式设置区域 */
.macro-loop-settings {
  padding: 1rem;
  background-color: var(--bg-tertiary);
  border-radius: 0.5rem;
  border: 1px solid var(--border-primary);
  width: 100%;
  height: max-content;
}

.macro-loop-settings .form-group {
  margin-bottom: 0.75rem;
}

.macro-loop-settings .form-group:last-child {
  margin-bottom: 0;
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

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-group.horizontal {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.radio-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.8125rem;
  color: var(--text-primary);
}

.radio-label input[type='radio'] {
  accent-color: var(--color-primary);
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.loop-count-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.loop-count-group .form-label {
  margin-bottom: 0;
  white-space: nowrap;
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

.loop-count-input {
  max-width: 150px;
}
</style>

<!-- 全局样式 (用于 Teleport 到 body 的元素) -->
<style>
/* 添加事件下拉框 */
.add-event-dropdown {
  position: fixed;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.375rem;
  box-shadow: var(--shadow-md);
  min-width: 140px;
  z-index: 9999;
  overflow: hidden;
}

.add-event-dropdown .dropdown-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  text-align: left;
}

.add-event-dropdown .dropdown-option:hover {
  background-color: var(--bg-hover);
  color: var(--color-primary);
}

.add-event-dropdown .dropdown-option.disabled {
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.add-event-dropdown .dropdown-option.disabled:hover {
  background-color: transparent;
  color: var(--text-tertiary);
}

.add-event-dropdown .dropdown-option i {
  font-size: 0.875rem;
  width: 1rem;
  text-align: center;
}
</style>
