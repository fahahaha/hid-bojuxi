<template>
  <div class="macro-management">
    <!-- 宏列表 -->
    <div class="macro-list-card card-hover">
      <h3 class="card-title">
        <i class="fa fa-list-ol icon-primary"></i>宏列表
      </h3>
      <p class="card-description">管理您的宏,最多可保存10组宏</p>

      <div class="macro-buttons">
        <button
          v-for="(macro, index) in macros"
          :key="index"
          @click="selectMacro(index)"
          class="macro-button"
          :class="{ 'setting-active': selectedMacroIndex === index }"
        >
          <span class="macro-name">{{ macro.name }}</span>
          <span class="macro-count">{{ macro.actions.length }}个动作</span>
        </button>
      </div>

      <div class="macro-actions">
        <button @click="newMacro" class="btn-secondary action-btn">
          <i class="fa fa-plus"></i>新建宏
        </button>
        <button @click="deleteMacro" class="btn-secondary action-btn delete-btn">
          <i class="fa fa-trash"></i>删除选中宏
        </button>
      </div>
    </div>

    <!-- 宏录制和设置 -->
    <div class="macro-settings">
      <!-- 录制控制 -->
      <div class="record-card card-hover">
        <h3 class="card-title">
          <i class="fa fa-circle-o-notch icon-accent"></i>宏录制
        </h3>

        <div class="record-controls">
          <button @click="startRecord" :disabled="isRecording" class="btn-primary">
            <i class="fa fa-circle"></i>开始录制
          </button>
          <button @click="stopRecord" :disabled="!isRecording" class="btn-secondary">
            <i class="fa fa-stop"></i>停止录制
          </button>
          <button @click="cancelRecord" :disabled="!isRecording" class="btn-secondary">
            <i class="fa fa-times"></i>取消录制
          </button>
          <button @click="testMacro" class="btn-secondary">
            <i class="fa fa-play"></i>测试宏
          </button>
        </div>

        <div v-if="isRecording" class="recording-indicator">
          <i class="fa fa-circle recording-icon"></i>
          <span>正在录制... 请执行您的操作,完成后点击"停止录制"</span>
        </div>
      </div>

      <!-- 宏设置 -->
      <div class="settings-card card-hover">
        <div class="settings-header">
          <h3 class="card-title">
            <i class="fa fa-cog icon-primary"></i>宏设置
          </h3>
          <button @click="saveMacro" class="btn-primary">
            <i class="fa fa-save"></i>保存宏
          </button>
        </div>

        <div class="settings-form">
          <div class="form-group">
            <label class="form-label">宏名称</label>
            <input
              type="text"
              v-model="currentMacro.name"
              class="input-control"
              placeholder="输入宏名称"
            />
          </div>

          <div class="form-group">
            <label class="form-label">循环次数</label>
            <select v-model="currentMacro.loopCount" class="form-select">
              <option :value="1">1次</option>
              <option :value="2">2次</option>
              <option :value="3">3次</option>
              <option :value="5">5次</option>
              <option :value="10">10次</option>
              <option :value="0">无限循环</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">宏动作列表</label>
            <div class="actions-list">
              <div v-if="currentMacro.actions.length === 0" class="empty-actions">
                录制宏动作后将显示在这里
              </div>
              <div
                v-else
                v-for="(action, index) in currentMacro.actions"
                :key="index"
                class="action-item"
              >
                <div class="action-info">
                  <span class="action-number">{{ index + 1 }}</span>
                  <span class="action-text">{{ action.type }}：<strong>{{ action.key }}</strong></span>
                </div>
                <span class="action-delay">{{ action.delay }}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface MacroAction {
  type: string
  key: string
  state: string
  delay: number
}

interface Macro {
  name: string
  loopCount: number
  actions: MacroAction[]
}

const macros = ref<Macro[]>([
  { name: '宏 1', loopCount: 1, actions: [] },
  { name: '宏 2', loopCount: 1, actions: [] },
  { name: '宏 3', loopCount: 1, actions: [] },
  { name: '宏 4', loopCount: 1, actions: [] },
  { name: '宏 5', loopCount: 1, actions: [] }
])

const selectedMacroIndex = ref(0)
const currentMacro = ref<Macro>({ ...macros.value[0] })
const isRecording = ref(false)
const lastActionTime = ref(0)

function selectMacro(index: number) {
  selectedMacroIndex.value = index
  currentMacro.value = { ...macros.value[index] }
}

function newMacro() {
  currentMacro.value = {
    name: `宏 ${selectedMacroIndex.value + 1}`,
    loopCount: 1,
    actions: []
  }
}

function deleteMacro() {
  if (confirm(`确定要删除${currentMacro.value.name}吗?此操作不可撤销。`)) {
    macros.value[selectedMacroIndex.value] = {
      name: `宏 ${selectedMacroIndex.value + 1}`,
      loopCount: 1,
      actions: []
    }
    currentMacro.value = { ...macros.value[selectedMacroIndex.value] }
  }
}

function startRecord() {
  isRecording.value = true
  currentMacro.value.actions = []
  lastActionTime.value = Date.now()
}

function stopRecord() {
  isRecording.value = false
}

function cancelRecord() {
  isRecording.value = false
  currentMacro.value.actions = []
}

function testMacro() {
  if (currentMacro.value.actions.length === 0) {
    alert('请先录制宏动作')
    return
  }
  console.log('测试宏:', currentMacro.value)
}

function saveMacro() {
  if (currentMacro.value.actions.length === 0) {
    alert('宏动作不能为空')
    return
  }
  macros.value[selectedMacroIndex.value] = { ...currentMacro.value }
  console.log('保存宏:', currentMacro.value)
}

function handleKeyDown(e: KeyboardEvent) {
  if (!isRecording.value) return

  const now = Date.now()
  const delay = now - lastActionTime.value
  lastActionTime.value = now

  currentMacro.value.actions.push({
    type: '按键按下',
    key: e.key,
    state: 'down',
    delay
  })
}

function handleKeyUp(e: KeyboardEvent) {
  if (!isRecording.value) return

  const now = Date.now()
  const delay = now - lastActionTime.value
  lastActionTime.value = now

  currentMacro.value.actions.push({
    type: '按键弹起',
    key: e.key,
    state: 'up',
    delay
  })
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('keyup', handleKeyUp)
})
</script>

<style scoped>
.macro-management {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .macro-management {
    grid-template-columns: 1fr 2fr;
  }
}

.macro-list-card,
.record-card,
.settings-card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 1.25rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.card-title i {
  margin-right: 0.5rem;
}

.icon-primary {
  color: var(--color-primary);
}

.icon-accent {
  color: var(--color-accent);
}

.card-description {
  color: var(--color-gray-medium);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.macro-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.macro-button {
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid var(--color-gray-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  background-color: white;
  cursor: pointer;
}

.macro-button:hover {
  border-color: var(--color-primary);
}

.macro-name {
  font-weight: 500;
}

.macro-count {
  font-size: 0.75rem;
  color: var(--color-gray-medium);
}

.macro-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  width: 100%;
}

.action-btn i {
  margin-right: 0.25rem;
}

.delete-btn {
  color: var(--color-danger);
  border-color: rgba(245, 63, 63, 0.3);
}

.macro-settings {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.record-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.record-controls button i {
  margin-right: 0.25rem;
}

.recording-indicator {
  padding: 0.75rem;
  background-color: rgba(114, 46, 209, 0.1);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.recording-icon {
  color: var(--color-accent);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.settings-header .card-title {
  margin-bottom: 0;
}

.settings-header button i {
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

.actions-list {
  border: 1px solid var(--color-gray-light);
  border-radius: 0.375rem;
  max-height: 15rem;
  overflow-y: auto;
}

.empty-actions {
  padding: 1rem;
  text-align: center;
  color: var(--color-gray-medium);
  font-size: 0.875rem;
}

.action-item {
  padding: 0.75rem;
  border-bottom: 1px solid var(--color-gray-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
}

.action-item:last-child {
  border-bottom: none;
}

.action-item:hover {
  background-color: rgb(249, 250, 251);
}

.action-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.action-number {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  background-color: rgb(229, 231, 235);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.action-text {
  font-size: 0.875rem;
}

.action-delay {
  font-size: 0.75rem;
  color: var(--color-gray-medium);
}
</style>
