<template>
  <Teleport to="body">
    <Transition name="message-box">
      <div v-if="state.visible" class="message-box-overlay" @click.self="handleOverlayClick">
        <div class="message-box" :class="state.type">
          <div class="message-icon">
            <i :class="iconClass"></i>
          </div>
          <div class="message-content">
            <p class="message-text">{{ state.message }}</p>
          </div>
          <button class="message-close" @click="closeMessage">
            <i class="fa fa-times"></i>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMessageBox } from '../composables/useMessageBox'

const { state, closeMessage } = useMessageBox()

const iconClass = computed(() => {
  switch (state.type) {
    case 'success':
      return 'fa fa-check-circle'
    case 'error':
      return 'fa fa-times-circle'
    case 'warning':
      return 'fa fa-exclamation-triangle'
    case 'info':
    default:
      return 'fa fa-info-circle'
  }
})

// 点击遮罩层关闭（根据 closeOnClickOverlay 配置）
function handleOverlayClick() {
  if (state.closeOnClickOverlay) {
    closeMessage()
  }
}
</script>

<style scoped>
.message-box-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.message-box {
  background-color: var(--bg-primary);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-xl);
  padding: 1.5rem 2rem;
  min-width: 320px;
  max-width: 480px;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  border: 1px solid var(--border-primary);
}

.message-icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.message-box.success .message-icon {
  background-color: var(--notify-success-bg);
  color: var(--color-success);
}

.message-box.error .message-icon {
  background-color: var(--notify-error-bg);
  color: var(--color-danger);
}

.message-box.warning .message-icon {
  background-color: var(--notify-warning-bg);
  color: var(--color-warning);
}

.message-box.info .message-icon {
  background-color: var(--notify-info-bg);
  color: var(--color-primary);
}

.message-content {
  flex: 1;
  padding-top: 0.5rem;
}

.message-text {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--text-primary);
  word-break: break-word;
}

.message-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  background: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.message-close:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

/* 过渡动画 */
.message-box-enter-active,
.message-box-leave-active {
  transition: all 0.3s ease;
}

.message-box-enter-active .message-box,
.message-box-leave-active .message-box {
  transition: all 0.3s ease;
}

.message-box-enter-from,
.message-box-leave-to {
  opacity: 0;
}

.message-box-enter-from .message-box,
.message-box-leave-to .message-box {
  transform: scale(0.9);
  opacity: 0;
}
</style>
