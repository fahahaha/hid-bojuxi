import { reactive } from 'vue'

export interface ConfirmOptions {
  title?: string // 标题（可选）
  message: string // 确认消息
  confirmText?: string // 确认按钮文字，默认"确定"
  cancelText?: string // 取消按钮文字，默认"取消"
  type?: 'info' | 'warning' | 'danger' // 类型，影响图标和确认按钮颜色
  closeOnClickOverlay?: boolean // 点击遮罩层是否关闭，默认 true
}

interface ConfirmState {
  visible: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  type: 'info' | 'warning' | 'danger'
  closeOnClickOverlay: boolean
  resolve: ((value: boolean) => void) | null
}

// 全局状态
const state = reactive<ConfirmState>({
  visible: false,
  title: '',
  message: '',
  confirmText: '确定',
  cancelText: '取消',
  type: 'info',
  closeOnClickOverlay: true,
  resolve: null
})

/**
 * 确认弹窗 composable
 * 提供全局确认弹窗功能
 */
export function useConfirmBox() {
  /**
   * 显示确认弹窗
   * @returns Promise<boolean> 用户点击确认返回 true，取消返回 false
   */
  const showConfirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      state.title = options.title || ''
      state.message = options.message
      state.confirmText = options.confirmText || '确定'
      state.cancelText = options.cancelText || '取消'
      state.type = options.type || 'info'
      state.closeOnClickOverlay = options.closeOnClickOverlay !== false // 默认 true
      state.resolve = resolve
      state.visible = true
    })
  }

  /**
   * 确认
   */
  const handleConfirm = () => {
    state.visible = false
    if (state.resolve) {
      state.resolve(true)
      state.resolve = null
    }
  }

  /**
   * 取消
   */
  const handleCancel = () => {
    state.visible = false
    if (state.resolve) {
      state.resolve(false)
      state.resolve = null
    }
  }

  /**
   * 点击遮罩层关闭（视为取消）
   */
  const handleOverlayClick = () => {
    if (state.closeOnClickOverlay) {
      handleCancel()
    }
  }

  /**
   * 便捷方法：显示确认弹窗
   */
  const confirm = (message: string, options?: Omit<ConfirmOptions, 'message'>): Promise<boolean> => {
    return showConfirm({ message, ...options })
  }

  return {
    state,
    showConfirm,
    confirm,
    handleConfirm,
    handleCancel,
    handleOverlayClick
  }
}
