import { DeviceProtocol } from './index'
import { bojuxiProtocol } from './bojuxi'

/**
 * 协议注册表
 * 按优先级排序，越靠前优先级越高
 * 未来添加新协议时，在此数组中注册即可
 */
export const protocolRegistry: DeviceProtocol[] = [
  bojuxiProtocol // 博巨矽鼠标协议
]

/**
 * 检测设备协议
 * @param device HID 设备
 * @returns 匹配的协议，如果没有匹配则返回 null
 */
export function detectProtocol(device: HIDDevice): DeviceProtocol | null {
  const protocol = protocolRegistry.find((p) => p.identify(device))
  console.log('使用协议：', protocol?.name || '未匹配')
  return protocol || null
}
