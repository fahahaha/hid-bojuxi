# WebUSB-Bojuxi 通用游戏鼠标驱动

基于 Electron + Vue 3 + TypeScript 的跨平台游戏鼠标驱动程序，支持通过 WebUSB API 与多种品牌游戏鼠标进行通信和配置。

## 技术栈

| 技术 | 版本 |
|------|------|
| Node.js | 24.x |
| Electron | ^38.1.2 |
| Vue | ^3.5.21 |
| TypeScript | ^5.9.2 |
| Vite | ^7.1.6 |
| Tailwind CSS | ^4.1.17 |
| Electron Vite | ^4.0.1 |
| Electron Builder | ^25.1.8 |

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发运行
```bash
npm run dev
```

### 构建部署
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

---

## 🔌 如何对接第三方硬件设备协议

### 一、WebUSB 协议说明

本项目**仅支持 WebUSB 协议**，不支持 WebHID 协议。

**WebUSB 协议特点：**
- 使用 USB Control Transfer 进行通信
- 需要设备固件支持 WebUSB 描述符
- 通过 `controlTransferOut` 发送命令，`controlTransferIn` 接收响应
- 支持 HID Class 设备（Interface Class = 3）

**厂商需提供：**
- WebUSB 协议文档（非 WebHID）
- Control Transfer 参数规范
- 命令格式和响应格式

**WebUSB 通信流程：**
```typescript
// 1. 请求设备
const device = await navigator.usb.requestDevice({ filters: [] })

// 2. 打开设备
await device.open()

// 3. 声明接口
await device.claimInterface(interfaceNumber)

// 4. 发送命令（Control Transfer Out）
await device.controlTransferOut({
  requestType: 'class',
  recipient: 'interface',
  request: 0x09,        // SET_REPORT
  value: 0x0200,        // Report Type & ID
  index: interfaceNumber
}, payload)

// 5. 接收响应（Control Transfer In）
const response = await device.controlTransferIn({
  requestType: 'class',
  recipient: 'interface',
  request: 0x01,        // GET_REPORT
  value: 0x0100,        // Report Type & ID
  index: interfaceNumber
}, length)
```

### 二、协议对接核心文件

主要对接文件位于：
- **`src/renderer/src/composables/useWebUSB.ts`** - WebUSB 协议实现（核心文件）

### 三、协议对接关键点分析

#### 1. 设备协议识别（第 279-288 行）

```typescript
// 检测设备协议类型
if (deviceName.toLowerCase().includes('razer')) {
  deviceProtocol = 'razer'
} else if (deviceName.toLowerCase().includes('logitech')) {
  deviceProtocol = 'logitech'
} else if (deviceName.toLowerCase().includes('steelseries')) {
  deviceProtocol = 'steelseries'
} else {
  deviceProtocol = 'generic'
}
```

**对接方法：**
- 根据硬件厂商提供的设备名称关键字，添加新的协议类型
- 例如添加新品牌 "XYZ"：
```typescript
else if (deviceName.toLowerCase().includes('xyz')) {
  deviceProtocol = 'xyz'
}
```

#### 2. 命令格式封装（第 31-40 行）

```typescript
async function sendSetReport(data: number[], retries = commandRetries): Promise<boolean> {
  let formattedData = data
  if (deviceProtocol === 'razer') {
    formattedData = [0x00, ...data]  // Razer 协议前缀
  } else if (deviceProtocol === 'logitech') {
    formattedData = [0x10, ...data]  // Logitech 协议前缀
  }
  // ... 发送命令
}
```

**对接方法：**
- 根据硬件厂商协议文档，添加对应的命令前缀或格式转换
- 例如 XYZ 设备需要 `0x20` 前缀：
```typescript
else if (deviceProtocol === 'xyz') {
  formattedData = [0x20, ...data]
}
```

#### 3. 设备信息查询（第 261-272 行）

```typescript
const command = [0x01, 0x01]  // 通用查询命令
await sendSetReport(command)
const response = await sendGetReport(32)

// 解析响应数据
deviceName = String.fromCharCode.apply(null, Array.from(response.slice(0, 8)))
model = String.fromCharCode.apply(null, Array.from(response.slice(8, 12)))
firmwareVersion = `${response[12]}.${response[13]}.${response[14]}`
```

**对接方法：**
- 根据硬件协议文档修改查询命令和响应解析逻辑
- 不同设备的数据格式可能不同，需要按协议调整字节位置

#### 4. 功能命令映射

每个功能都有对应的命令格式，需要根据协议文档替换：

**电池查询（第 313 行）：**
```typescript
const command = deviceProtocol === 'razer' ? [0x03, 0x01] : [0x02, 0x01]
```

**回报率设置（第 432 行）：**
```typescript
const command = deviceProtocol === 'razer' ? [0x04, 0x02, rateValue] : [0x03, 0x02, rateValue]
```

**CPI/DPI 设置（第 459-465 行）：**
```typescript
if (deviceProtocol === 'razer') {
  const razerCpiValue = value / 100
  command = [0x05, 0x04, levelIndex, razerCpiValue]
} else {
  const valueHigh = (value >> 8) & 0xFF
  const valueLow = value & 0xFF
  command = [0x03, 0x04, levelIndex, valueHigh, valueLow]
}
```

**背光控制（第 487 行）：**
```typescript
const command = deviceProtocol === 'razer' ? [0x06, 0x02, mode] : [0x04, 0x02, mode]
```

### 四、对接新设备的完整步骤

#### 步骤 1：获取硬件协议文档
向硬件厂商索取以下信息：
- **USB VID/PID**（用于设备识别）
- **WebUSB 接口描述符**（Interface Class、Subclass、Protocol）
- **命令格式规范**（包括命令前缀、数据格式、响应格式）
- **Control Transfer 参数**（requestType、recipient、request、value、index）
- **功能命令列表**（电池、回报率、DPI、背光等）

> **重要**：确保厂商提供的是 **WebUSB 协议**，而非 WebHID 协议。WebUSB 使用 Control Transfer 进行通信。

#### 步骤 2：添加协议识别
在 `getDeviceInfo()` 函数中添加设备识别逻辑：

```typescript
// 279-288 行位置
if (deviceName.toLowerCase().includes('新品牌关键字')) {
  deviceProtocol = '新品牌标识'
} else if (device.vendorId === 0x1234 && device.productId === 0x5678) {
  // 也可以通过 VID/PID 识别
  deviceProtocol = '新品牌标识'
}
```

#### 步骤 3：实现命令格式转换
在 `sendSetReport()` 函数中添加命令封装：

```typescript
// 31-40 行位置
else if (deviceProtocol === '新品牌标识') {
  // 根据协议文档添加前缀或转换格式
  formattedData = [协议前缀, ...data]
}
```

#### 步骤 4：实现各功能命令
根据协议文档，在每个功能函数中添加对应的命令：

```typescript
// 电池查询 - 313 行
const command = deviceProtocol === '新品牌标识'
  ? [新品牌电池命令]
  : (deviceProtocol === 'razer' ? [0x03, 0x01] : [0x02, 0x01])

// 回报率设置 - 432 行
const command = deviceProtocol === '新品牌标识'
  ? [新品牌回报率命令, rateValue]
  : (deviceProtocol === 'razer' ? [0x04, 0x02, rateValue] : [0x03, 0x02, rateValue])

// CPI 设置 - 459-465 行
if (deviceProtocol === '新品牌标识') {
  command = [新品牌CPI命令, ...根据协议组装的数据]
} else if (deviceProtocol === 'razer') {
  // 现有逻辑
}

// 背光控制 - 487 行
const command = deviceProtocol === '新品牌标识'
  ? [新品牌背光命令, mode]
  : (deviceProtocol === 'razer' ? [0x06, 0x02, mode] : [0x04, 0x02, mode])
```

#### 步骤 5：调整响应数据解析
根据设备返回的数据格式，调整解析逻辑：

```typescript
// 例如电池状态解析 - 323-328 行
let batteryLevel: number
if (deviceProtocol === '新品牌标识') {
  // 根据协议文档解析电池数据
  batteryLevel = response[协议指定的字节位置]
} else if (deviceProtocol === 'razer') {
  batteryLevel = response[1]
} else {
  batteryLevel = response[0]
}
```

#### 步骤 6：测试验证
1. 连接实际硬件设备
2. 打开浏览器开发者工具查看控制台日志
3. 测试每个功能（连接、查询、设置）
4. 验证命令发送和响应接收是否正确

### 五、协议对接示例

假设要对接 "RocketMouse" 品牌鼠标，协议如下：
- 命令前缀：`0x30`
- 电池查询：`[0x10, 0x01]`，响应第 2 字节为电量
- 回报率设置：`[0x11, 0x02, rate]`
- CPI 设置：`[0x12, 0x03, level, cpi_high, cpi_low]`

**实现代码：**

```typescript
// 1. 设备识别（279 行）
else if (deviceName.toLowerCase().includes('rocketmouse')) {
  deviceProtocol = 'rocketmouse'
}

// 2. 命令封装（36 行）
else if (deviceProtocol === 'rocketmouse') {
  formattedData = [0x30, ...data]
}

// 3. 电池查询（313 行）
const command = deviceProtocol === 'rocketmouse'
  ? [0x10, 0x01]
  : (deviceProtocol === 'razer' ? [0x03, 0x01] : [0x02, 0x01])

// 4. 电池解析（323 行）
if (deviceProtocol === 'rocketmouse') {
  batteryLevel = response[2]  // 第 2 字节
}

// 5. 回报率设置（432 行）
const command = deviceProtocol === 'rocketmouse'
  ? [0x11, 0x02, rateValue]
  : (deviceProtocol === 'razer' ? [0x04, 0x02, rateValue] : [0x03, 0x02, rateValue])

// 6. CPI 设置（459 行）
if (deviceProtocol === 'rocketmouse') {
  const valueHigh = (value >> 8) & 0xFF
  const valueLow = value & 0xFF
  command = [0x12, 0x03, levelIndex, valueHigh, valueLow]
}
```

---

## 🔧 多设备维护与扩展

### 当前架构支持

项目采用**协议适配器模式**，天然支持多设备维护：

1. **协议隔离**：每个品牌的协议逻辑通过 `deviceProtocol` 变量隔离
2. **统一接口**：所有设备使用相同的函数接口（`setReportRate`、`setCPI` 等）
3. **动态识别**：运行时自动识别设备类型并应用对应协议

### 扩展新设备的方式

#### 方式一：内联扩展（适合简单协议）

直接在现有函数中添加 `if-else` 分支：

```typescript
if (deviceProtocol === '新设备') {
  // 新设备逻辑
} else if (deviceProtocol === 'razer') {
  // Razer 逻辑
}
```

**优点**：简单直接，适合快速添加
**缺点**：设备多了代码会变得冗长

#### 方式二：协议配置化（推荐）

创建协议配置文件 `src/renderer/src/protocols/index.ts`：

```typescript
export interface DeviceProtocol {
  name: string
  commandPrefix?: number
  commands: {
    getDeviceInfo: number[]
    getBattery: number[]
    getReportRate: number[]
    getCPI: number[]
    setReportRate: (rate: number) => number[]
    setCPI: (level: number, value: number) => number[]
    // ... 其他命令
  }
  parsers: {
    battery: (response: Uint8Array) => number
    reportRate: (response: Uint8Array) => number
    cpi: (response: Uint8Array) => number
    // ... 其他解析器
  }
}

export const protocols: Record<string, DeviceProtocol> = {
  razer: {
    name: 'Razer',
    commandPrefix: 0x00,
    commands: {
      getBattery: [0x03, 0x01],
      setReportRate: (rate) => {
        const rateMap = { 125: 0x01, 250: 0x02, 500: 0x04, 1000: 0x08 }
        return [0x04, 0x02, rateMap[rate] || 0x08]
      },
      // ...
    },
    parsers: {
      battery: (response) => response[1],
      // ...
    }
  },
  logitech: {
    name: 'Logitech',
    commandPrefix: 0x10,
    // ...
  },
  // 添加新设备只需添加新配置
  newdevice: {
    name: 'NewDevice',
    commandPrefix: 0x20,
    commands: {
      getBattery: [0x05, 0x01],
      // ...
    },
    parsers: {
      battery: (response) => response[0],
      // ...
    }
  }
}
```

然后在 `useWebUSB.ts` 中使用：

```typescript
import { protocols } from '../protocols'

async function getBattery(): Promise<void> {
  const protocol = protocols[deviceProtocol]
  if (!protocol) return

  const command = protocol.commands.getBattery
  await sendSetReport(command)
  const response = await sendGetReport(4)

  const batteryLevel = protocol.parsers.battery(response)
  deviceStatus.value.battery = `${batteryLevel}%`
}
```

**优点**：
- 代码清晰，易于维护
- 添加新设备只需添加配置，无需修改业务逻辑
- 便于测试和文档化

#### 方式三：插件化架构（适合大规模扩展）

创建独立的协议插件文件：

```
src/renderer/src/protocols/
  ├── base.ts           # 基础协议接口
  ├── razer.ts          # Razer 协议实现
  ├── logitech.ts       # Logitech 协议实现
  ├── newdevice.ts      # 新设备协议实现
  └── registry.ts       # 协议注册中心
```

**`base.ts`**：
```typescript
export abstract class DeviceProtocolBase {
  abstract identify(device: USBDevice): boolean
  abstract formatCommand(data: number[]): number[]
  abstract getBatteryCommand(): number[]
  abstract parseBattery(response: Uint8Array): number
  // ... 其他抽象方法
}
```

**`newdevice.ts`**：
```typescript
import { DeviceProtocolBase } from './base'

export class NewDeviceProtocol extends DeviceProtocolBase {
  identify(device: USBDevice): boolean {
    return device.productName?.toLowerCase().includes('newdevice') || false
  }

  formatCommand(data: number[]): number[] {
    return [0x20, ...data]
  }

  getBatteryCommand(): number[] {
    return [0x05, 0x01]
  }

  parseBattery(response: Uint8Array): number {
    return response[0]
  }
  // ... 实现其他方法
}
```

**`registry.ts`**：
```typescript
import { RazerProtocol } from './razer'
import { LogitechProtocol } from './logitech'
import { NewDeviceProtocol } from './newdevice'

export const protocolRegistry = [
  new RazerProtocol(),
  new LogitechProtocol(),
  new NewDeviceProtocol(),
]

export function detectProtocol(device: USBDevice) {
  return protocolRegistry.find(p => p.identify(device))
}
```

### 设备配置管理

对于需要持久化的设备配置，可以使用 Electron 的存储功能：

```typescript
// src/main/deviceConfig.ts
import Store from 'electron-store'

interface DeviceConfig {
  vidPid: string
  protocol: string
  customSettings: Record<string, any>
}

const store = new Store<{ devices: DeviceConfig[] }>()

export function saveDeviceConfig(config: DeviceConfig) {
  const devices = store.get('devices', [])
  const index = devices.findIndex(d => d.vidPid === config.vidPid)
  if (index >= 0) {
    devices[index] = config
  } else {
    devices.push(config)
  }
  store.set('devices', devices)
}

export function getDeviceConfig(vidPid: string): DeviceConfig | undefined {
  const devices = store.get('devices', [])
  return devices.find(d => d.vidPid === vidPid)
}
```

### 测试与调试

1. **协议日志**：所有命令发送和响应都有详细日志输出
2. **模拟设备**：可以创建模拟设备用于测试
3. **协议验证**：建议为每个协议编写单元测试

```typescript
// tests/protocols/newdevice.test.ts
import { NewDeviceProtocol } from '@/protocols/newdevice'

describe('NewDevice Protocol', () => {
  const protocol = new NewDeviceProtocol()

  test('should format command correctly', () => {
    const result = protocol.formatCommand([0x01, 0x02])
    expect(result).toEqual([0x20, 0x01, 0x02])
  })

  test('should parse battery correctly', () => {
    const response = new Uint8Array([85, 0, 0, 0])
    expect(protocol.parseBattery(response)).toBe(85)
  })
})
```

---

## 📝 开发建议

1. **获取完整协议文档**：与硬件厂商充分沟通，获取详细的 WebUSB 通信协议文档
2. **使用日志调试**：开发时打开浏览器控制台，查看所有命令和响应的十六进制日志
3. **逐步测试**：先实现设备连接和信息查询，再逐步添加其他功能
4. **错误处理**：注意处理设备断开、命令失败等异常情况
5. **协议版本**：某些设备可能有多个固件版本，协议可能不同，需要做版本检测
6. **固件支持**：确保设备固件支持 WebUSB，否则浏览器无法识别设备

---

## ⚠️ WebUSB vs WebHID

### 本项目使用 WebUSB

| 特性 | WebUSB | WebHID |
|------|--------|--------|
| **通信方式** | Control Transfer | Input/Output Reports |
| **设备要求** | 需要固件支持 WebUSB 描述符 | 标准 HID 设备即可 |
| **浏览器支持** | Chrome/Edge | Chrome/Edge |
| **适用场景** | 自定义 USB 设备、需要底层控制 | 标准 HID 设备（鼠标、键盘） |
| **本项目支持** | ✅ 支持 | ❌ 不支持 |

### 为什么选择 WebUSB？

1. **更底层的控制**：可以直接使用 Control Transfer 与设备通信
2. **灵活性更高**：不受 HID 报告描述符限制
3. **厂商支持**：合作厂商提供 WebUSB 协议支持

### 厂商注意事项

如果您的设备固件当前仅支持 WebHID，需要：
1. 更新固件以支持 WebUSB 描述符
2. 提供 WebUSB 协议文档
3. 或者联系我们讨论技术方案

## 许可证

MIT License

## 联系方式

博巨矽科技有限公司
