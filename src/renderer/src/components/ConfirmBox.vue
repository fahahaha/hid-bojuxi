<template>
  <Teleport to="body">
    <Transition name="confirm-box">
      <div v-if="state.visible" class="confirm-box-overlay" @click.self="handleOverlayClick">
        <div class="confirm-box" :class="state.type">
          <div class="confirm-icon">
            <i :class="iconClass"></i>
          </div>
          <div class="confirm-content">
            <h3 v-if="state.title" class="confirm-title">{{ state.title }}</h3>
            <p class="confirm-message">{{ state.message }}</p>
          </div>
          <div class="confirm-actions">
            <button class="btn-cancel" @click="handleCancel">
              {{ state.cancelText }}
            </button>
            <button class="btn-confirm" :class="state.type" @click="handleConfirm">
              {{ state.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConfirmBox } from '../composables/useConfirmBox'

const { state, handleConfirm, handleCancel, handleOverlayClick } = useConfirmBox()

const iconClass = computed(() => {
  switch (state.type) {
    case 'warning':
      return 'fa fa-exclamation-triangle'
    case 'danger':
      return 'fa fa-exclamation-circle'
    case 'info':
    default:
      return 'fa fa-question-circle'
  }
})
</script>

<style scoped>
.confirm-box-overlay {
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

.confirm-box {
  background-color: var(--bg-primary);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-xl);
  padding: 1.5rem 2rem;
  min-width: 320px;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--border-primary);
}

.confirm-icon {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.confirm-box.info .confirm-icon {
  background-color: var(--notify-info-bg);
  color: var(--color-primary);
}

.confirm-box.warning .confirm-icon {
  background-color: var(--notify-warning-bg);
  color: var(--color-warning);
}

.confirm-box.danger .confirm-icon {
  background-color: var(--notify-error-bg);
  color: var(--color-danger);
}

.confirm-content {
  text-align: center;
}

.confirm-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.confirm-message {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--text-secondary);
  word-break: break-word;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  width: 100%;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
}

.btn-cancel:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--bg-hover);
}

.btn-confirm {
  border: none;
  color: white;
}

.btn-confirm.info {
  background-color: var(--color-primary);
}

.btn-confirm.info:hover {
  background-color: #1557cc;
}

.btn-confirm.warning {
  background-color: var(--color-warning);
}

.btn-confirm.warning:hover {
  background-color: #e66a00;
}

.btn-confirm.danger {
  background-color: var(--color-danger);
}

.btn-confirm.danger:hover {
  background-color: #d93636;
}

/* 过渡动画 */
.confirm-box-enter-active,
.confirm-box-leave-active {
  transition: all 0.3s ease;
}

.confirm-box-enter-active .confirm-box,
.confirm-box-leave-active .confirm-box {
  transition: all 0.3s ease;
}

.confirm-box-enter-from,
.confirm-box-leave-to {
  opacity: 0;
}

.confirm-box-enter-from .confirm-box,
.confirm-box-leave-to .confirm-box {
  transform: scale(0.9);
  opacity: 0;
}
</style>
