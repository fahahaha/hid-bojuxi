<script setup lang="ts">
import Versions from './components/Versions.vue'
import { getElectronAPI } from './utils/env'

const ipcHandle = (): void => {
  const electronAPI = getElectronAPI()
  if (electronAPI) {
    electronAPI.ipcRenderer.send('ping')
  } else {
    console.log('Web 环境: 无法使用 IPC 通信')
    alert('当前在 Web 环境中,IPC 功能不可用')
  }
}
</script>

<template>
  <img alt="logo" class="logo" src="./assets/electron.svg" />
  <div class="creator">啊啊啊 Powered by electron-vite</div>
  <div class="text">
    Build an Electron app with
    <span class="vue">Vue</span>
    and
    <span class="ts">TypeScript</span>
  </div>
  <p class="tip">Please try pressing <code>F12</code> to open the devTool</p>
  <div class="actions">
    <div class="action">
      <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">Documentation</a>
    </div>
    <div class="action">
      <a target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</a>
    </div>
  </div>
  <Versions />
</template>
