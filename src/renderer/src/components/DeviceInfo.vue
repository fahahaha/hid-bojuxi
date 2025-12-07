<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- 设备信息 -->
    <div class="bg-white rounded-xl shadow-sm p-5 card-hover">
      <h3 class="text-lg font-semibold mb-4 flex items-center">
        <i class="fa fa-info-circle text-primary mr-2"></i>设备信息
      </h3>

      <div class="space-y-4">
        <div class="flex justify-between pb-3 border-b border-gray-100">
          <span class="text-gray-dark">设备名称</span>
          <span class="font-medium">{{ deviceInfo.name }}</span>
        </div>
        <div class="flex justify-between pb-3 border-b border-gray-100">
          <span class="text-gray-dark">设备型号</span>
          <span class="font-medium">{{ deviceInfo.model }}</span>
        </div>
        <div class="flex justify-between pb-3 border-b border-gray-100">
          <span class="text-gray-dark">固件版本</span>
          <span class="font-medium">{{ deviceInfo.firmwareVersion }}</span>
        </div>
        <div class="flex justify-between pb-3 border-b border-gray-100">
          <span class="text-gray-dark">连接方式</span>
          <span class="font-medium">{{ deviceInfo.connectionType }}</span>
        </div>
        <div class="flex justify-between pb-3 border-b border-gray-100">
          <span class="text-gray-dark">VID/PID</span>
          <span class="font-medium">{{ deviceInfo.vidPid }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-dark">设备协议</span>
          <span class="font-medium">{{ deviceInfo.protocol }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-dark">设备状态</span>
          <span
            class="font-medium"
            :class="deviceInfo.status === '已连接' ? 'text-success' : 'text-danger'"
          >
            {{ deviceInfo.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- 电池和维护 -->
    <div class="bg-white rounded-xl shadow-sm p-5 card-hover">
      <h3 class="text-lg font-semibold mb-4 flex items-center">
        <i class="fa fa-battery-three-quarters text-warning mr-2"></i>电池与维护
      </h3>

      <div class="space-y-6">
        <!-- 电池信息 -->
        <div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-dark">电池电量</span>
            <span class="font-medium">{{ batteryPercent }}</span>
          </div>
          <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="batteryColorClass"
              :style="{ width: batteryPercent }"
            ></div>
          </div>
          <div class="flex justify-between mt-1 text-xs text-gray-medium">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <div class="mt-2 text-sm">
            <i class="fa fa-info-circle text-gray-medium mr-1"></i>
            <span>{{ chargeStatus }}</span>
          </div>
        </div>

        <!-- 设备维护 -->
        <div class="pt-2">
          <button @click="checkUpdate" class="btn-primary w-full mb-3">
            <i class="fa fa-download mr-1"></i>检查固件更新
          </button>
          <button @click="restoreDefaults" class="btn-secondary w-full">
            <i class="fa fa-refresh mr-1"></i>恢复出厂设置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWebUSB } from '../composables/useWebUSB'

const { deviceInfo, deviceStatus } = useWebUSB()

const batteryPercent = computed(() => deviceStatus.value.battery)

const batteryColorClass = computed(() => {
  const percent = parseInt(batteryPercent.value)
  if (percent < 30) return 'bg-danger'
  if (percent < 50) return 'bg-warning'
  return 'bg-success'
})

const chargeStatus = computed(() => {
  if (!deviceInfo.value || deviceInfo.value.status !== '已连接') {
    return '未连接设备'
  }
  return '未充电'
})

function checkUpdate() {
  alert('正在检查固件更新...\n\n当前固件已是最新版本，无需更新')
}

function restoreDefaults() {
  if (confirm('确定要恢复出厂设置吗？这将清除所有自定义设置并恢复默认值。')) {
    alert('正在恢复出厂设置...')
    setTimeout(() => {
      alert('已成功恢复出厂设置')
    }, 2000)
  }
}
</script>
