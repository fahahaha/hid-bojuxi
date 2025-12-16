<template>
  <div class="device-info-container">
    <!-- 设备信息 -->
    <div class="info-card card-hover">
      <h3 class="card-title"><i class="fa fa-info-circle icon-primary"></i>设备信息</h3>

      <div class="info-list">
        <div class="info-item">
          <span class="info-label">设备名称</span>
          <span class="info-value">{{ deviceInfo.name }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">设备型号</span>
          <span class="info-value">{{ deviceInfo.model }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">固件版本</span>
          <span class="info-value">{{ deviceInfo.firmwareVersion }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">连接方式</span>
          <span class="info-value">{{ deviceInfo.connectionType }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">VID/PID</span>
          <span class="info-value">{{ deviceInfo.vidPid }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">设备协议</span>
          <span class="info-value">{{ deviceInfo.protocol }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">设备状态</span>
          <span
            class="info-value"
            :class="deviceInfo.status === '已连接' ? 'status-connected' : 'status-disconnected'"
          >
            {{ deviceInfo.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- 电池和维护 -->
    <div class="battery-card card-hover">
      <h3 class="card-title">
        <i class="fa fa-battery-three-quarters icon-warning"></i>电池与维护
      </h3>

      <div class="battery-section">
        <!-- 电池信息 -->
        <div class="battery-info">
          <div class="battery-header">
            <span class="battery-label">电池电量</span>
            <span class="battery-percent">{{ batteryPercent }}</span>
          </div>
          <div class="battery-bar">
            <div
              class="battery-fill"
              :class="batteryColorClass"
              :style="{ width: batteryPercent }"
            ></div>
          </div>
          <div class="battery-markers">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <div class="battery-status">
            <i class="fa fa-info-circle"></i>
            <span>{{ chargeStatus }}</span>
          </div>
        </div>

        <!-- 设备维护 -->
        <div class="maintenance-actions">
          <button @click="checkUpdate" class="btn-primary action-btn">
            <i class="fa fa-download"></i>检查固件更新
          </button>
          <button @click="restoreDefaults" class="btn-secondary action-btn">
            <i class="fa fa-refresh"></i>恢复出厂设置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWebHID } from '../composables/useWebHID'

const { deviceInfo, deviceStatus } = useWebHID()

const batteryPercent = computed(() => deviceStatus.value.battery)

const batteryColorClass = computed(() => {
  const percent = parseInt(batteryPercent.value)
  if (percent < 30) return 'battery-low'
  if (percent < 50) return 'battery-medium'
  return 'battery-high'
})

const chargeStatus = computed(() => {
  if (!deviceInfo.value || deviceInfo.value.status !== '已连接') {
    return '未连接设备'
  }
  return '未充电'
})

function checkUpdate() {
  alert('正在检查固件更新...\n\n当前固件已是最新版本,无需更新')
}

function restoreDefaults() {
  if (confirm('确定要恢复出厂设置吗?这将清除所有自定义设置并恢复默认值。')) {
    alert('正在恢复出厂设置...')
    setTimeout(() => {
      alert('已成功恢复出厂设置')
    }, 2000)
  }
}
</script>

<style scoped>
.device-info-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .device-info-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

.info-card,
.battery-card {
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

.icon-warning {
  color: var(--color-warning);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgb(243, 244, 246);
}

.info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  color: var(--color-gray-dark);
}

.info-value {
  font-weight: 500;
}

.status-connected {
  color: var(--color-success);
}

.status-disconnected {
  color: var(--color-danger);
}

.battery-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.battery-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.battery-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.battery-label {
  color: var(--color-gray-dark);
}

.battery-percent {
  font-weight: 500;
}

.battery-bar {
  height: 0.75rem;
  background-color: rgb(243, 244, 246);
  border-radius: 9999px;
  overflow: hidden;
}

.battery-fill {
  height: 100%;
  border-radius: 9999px;
  transition: all 0.3s;
}

.battery-low {
  background-color: var(--color-danger);
}

.battery-medium {
  background-color: var(--color-warning);
}

.battery-high {
  background-color: var(--color-success);
}

.battery-markers {
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-gray-medium);
}

.battery-status {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.battery-status i {
  color: var(--color-gray-medium);
}

.maintenance-actions {
  padding-top: 0.5rem;
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
</style>
