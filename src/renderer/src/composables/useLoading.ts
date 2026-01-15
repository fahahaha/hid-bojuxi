import { ref, computed } from 'vue'

// 全局加载计数器（使用计数器方式处理并发请求）
const loadingCount = ref(0)

// 实际显示的加载状态（带延迟隐藏）
const isLoadingVisible = ref(false)

// 延迟隐藏的定时器
let hideTimer: ReturnType<typeof setTimeout> | null = null

// 延迟隐藏时间（毫秒）
const HIDE_DELAY = 50

/**
 * 全局加载状态管理
 * 使用计数器方式处理并发请求：
 * - 每次请求开始时 +1
 * - 每次请求结束时（无论成功或失败）-1
 * - 显示时立即显示，隐藏时延迟 300ms
 * - 延迟期间如果有新请求，取消隐藏
 */
export function useLoading() {
  // 是否正在加载（供外部使用，带延迟隐藏效果）
  const isLoading = computed(() => isLoadingVisible.value)

  /**
   * 更新可见状态
   */
  function updateVisibility(): void {
    if (loadingCount.value > 0) {
      // 有请求时立即显示，并取消任何待执行的隐藏
      if (hideTimer) {
        clearTimeout(hideTimer)
        hideTimer = null
      }
      isLoadingVisible.value = true
    } else {
      // 没有请求时延迟隐藏
      if (!hideTimer) {
        hideTimer = setTimeout(() => {
          isLoadingVisible.value = false
          hideTimer = null
        }, HIDE_DELAY)
      }
    }
  }

  /**
   * 开始加载（计数器 +1）
   */
  function startLoading(): void {
    loadingCount.value++
    updateVisibility()
  }

  /**
   * 结束加载（计数器 -1）
   */
  function stopLoading(): void {
    if (loadingCount.value > 0) {
      loadingCount.value--
    }
    updateVisibility()
  }

  /**
   * 包装异步函数，自动管理加载状态
   * @param fn 异步函数
   * @returns 包装后的函数
   */
  async function withLoading<T>(fn: () => Promise<T>): Promise<T> {
    startLoading()
    try {
      return await fn()
    } finally {
      stopLoading()
    }
  }

  return {
    isLoading,
    loadingCount: computed(() => loadingCount.value),
    startLoading,
    stopLoading,
    withLoading
  }
}
