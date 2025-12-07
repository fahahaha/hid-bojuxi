<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- 宏列表 -->
    <div class="bg-white rounded-xl shadow-sm p-5 card-hover">
      <h3 class="text-lg font-semibold mb-4 flex items-center">
        <i class="fa fa-list-ol text-primary mr-2"></i>宏列表
      </h3>
      <p class="text-gray-medium text-sm mb-4">管理您的宏，最多可保存10组宏</p>

      <div class="space-y-2 mb-4">
        <button
          v-for="(macro, index) in macros"
          :key="index"
          @click="selectMacro(index)"
          class="w-full text-left px-4 py-3 rounded border flex justify-between items-center transition-all duration-200"
          :class="selectedMacroIndex === index ? 'setting-active' : 'border-gray-light hover:border-primary'"
        >
          <span>{{ macro.name }}</span>
          <span class="text-xs text-gray-medium">{{ macro.actions.length }}个动作</span>
        </button>
      </div>

      <div class="space-y-3">
        <button @click="newMacro" class="btn-secondary w-full">
          <i class="fa fa-plus mr-1"></i>新建宏
        </button>
        <button @click="deleteMacro" class="btn-secondary w-full text-danger border-danger/30">
          <i class="fa fa-trash mr-1"></i>删除选中宏
        </button>
      </div>
    </div>

    <!-- 宏录制和设置 -->
    <div class="lg:col-span-2 space-y-6">
      <!-- 录制控制 -->
      <div class="bg-white rounded-xl shadow-sm p-5 card-hover">
        <h3 class="text-lg font-semibold mb-4 flex items-center">
          <i class="fa fa-circle-o-notch text-accent mr-2"></i>宏录制
        </h3>

        <div class="flex flex-wrap gap-3 mb-4">
          <button @click="startRecord" :disabled="isRecording" class="btn-primary">
            <i class="fa fa-circle mr-1"></i>开始录制
          </button>
          <button @click="stopRecord" :disabled="!isRecording" class="btn-secondary">
            <i class="fa fa-stop mr-1"></i>停止录制
          </button>
          <button @click="cancelRecord" :disabled="!isRecording" class="btn-secondary">
            <i class="fa fa-times mr-1"></i>取消录制
          </button>
          <button @click="testMacro" class="btn-secondary">
            <i class="fa fa-play mr-1"></i>测试宏
          </button>
        </div>

        <div v-if="isRecording" class="p-3 bg-accent/10 rounded-md text-sm flex items-center">
          <i class="fa fa-circle text-accent animate-pulse mr-2"></i>
          <span>正在录制... 请执行您的操作，完成后点击"停止录制"</span>
        </div>
      </div>

      <!-- 宏设置 -->
      <div class="bg-white rounded-xl shadow-sm p-5 card-hover">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold flex items-center">
            <i class="fa fa-cog text-primary mr-2"></i>宏设置
          </h3>
          <div>
            <button @click="saveMacro" class="btn-primary">
              <i class="fa fa-save mr-1"></i>保存宏
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-dark mb-2">宏名称</label>
            <input
              type="text"
              v-model="currentMacro.name"
              class="input-control w-full"
              placeholder="输入宏名称"
            />
          </div>

          <div>
            <label class="block text-sm text-gray-dark mb-2">循环次数</label>
            <select v-model="currentMacro.loopCount" class="input-control w-full">
              <option :value="1">1次</option>
              <option :value="2">2次</option>
              <option :value="3">3次</option>
              <option :value="5">5次</option>
              <option :value="10">10次</option>
              <option :value="0">无限循环</option>
            </select>
          </div>

          <div>
            <label class="block text-sm text-gray-dark mb-2">宏动作列表</label>
            <div class="border rounded-md max-h-60 overflow-y-auto">
              <div v-if="currentMacro.actions.length === 0" class="p-4 text-center text-gray-medium text-sm">
                录制宏动作后将显示在这里
              </div>
              <div
                v-else
                v-for="(action, index) in currentMacro.actions"
                :key="index"
                class="p-3 border-b last:border-0 flex justify-between items-center hover:bg-gray-50"
              >
                <div class="flex items-center">
                  <span class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-3">
                    {{ index + 1 }}
                  </span>
                  <span>{{ action.type }}：<strong>{{ action.key }}</strong></span>
                </div>
                <span class="text-xs text-gray-medium">{{ action.delay }}ms</span>
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
  if (confirm(`确定要删除${currentMacro.value.name}吗？此操作不可撤销。`)) {
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
