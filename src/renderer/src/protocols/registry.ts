import { DeviceProtocol } from './index'
import { razerProtocol } from './razer'
import { logitechProtocol } from './logitech'
import { steelseriesProtocol } from './steelseries'
import { genericProtocol } from './generic'
import {yhhProtocol} from "./yhh";

/**
 * 协议注册表
 * 按优先级排序，越靠前优先级越高
 * genericProtocol 必须放在最后作为默认协议
 */
export const protocolRegistry: DeviceProtocol[] = [
  yhhProtocol,
  razerProtocol,
  logitechProtocol,
  steelseriesProtocol,
  genericProtocol // 默认协议，匹配所有设备
]

/**
 * 检测设备协议
 * @param device HID 设备
 * @returns 匹配的协议，如果没有匹配则返回通用协议
 */
export function detectProtocol(device: HIDDevice): DeviceProtocol {
  const protocol = protocolRegistry.find((p) => p.identify(device))
  return protocol || genericProtocol
}
