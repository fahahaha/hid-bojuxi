import { reactive } from 'vue'

export type MessageType = 'success' | 'error' | 'warning' | 'info'

export interface MessageOptions {
  type: MessageType
  message: string
  duration?: number // 自动关闭时间（毫秒），0 或不设置表示不自动关闭
  closeOnClickOverlay?: boolean // 点击遮罩层是否关闭，默认 true
}

interface MessageState {
  visible: boolean
  type: MessageType
  message: string
  duration: number
  closeOnClickOverlay: boolean
}

// 全局状态
const state = reactive<MessageState>({
  visible: false,
  type: 'info',
  message: '',
  duration: 0,
  closeOnClickOverlay: true
})

let timeoutId: ReturnType<typeof setTimeout> | null = null

/**
 * 消息弹窗 composable
 * 提供全局消息弹窗功能
 */
export function useMessageBox() {
  /**
   * 显示消息弹窗
   */
  const showMessage = (options: MessageOptions) => {
    // 清除之前的定时器
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    state.type = options.type
    state.message = options.message
    state.duration = options.duration || 0
    state.closeOnClickOverlay = options.closeOnClickOverlay !== false // 默认 true
    state.visible = true

    // 如果设置了自动关闭时间
    if (options.duration && options.duration > 0) {
      timeoutId = setTimeout(() => {
        closeMessage()
      }, options.duration)
    }
  }

  /**
   * 关闭消息弹窗
   */
  const closeMessage = () => {
    state.visible = false
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  /**
   * 显示成功消息
   */
  const success = (message: string, duration?: number) => {
    showMessage({ type: 'success', message, duration })
  }

  /**
   * 显示错误消息
   */
  const error = (message: string, duration?: number) => {
    showMessage({ type: 'error', message, duration })
  }

  /**
   * 显示警告消息
   */
  const warning = (message: string, duration?: number) => {
    showMessage({ type: 'warning', message, duration })
  }

  /**
   * 显示信息消息
   */
  const info = (message: string, duration?: number) => {
    showMessage({ type: 'info', message, duration })
  }

  return {
    state,
    showMessage,
    closeMessage,
    success,
    error,
    warning,
    info
  }
}
