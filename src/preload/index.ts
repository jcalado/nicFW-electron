import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getSerialPorts: () => ipcRenderer.invoke('serial:list'),
  connectPort: (port) => ipcRenderer.invoke('serial:connect', port),
  disconnectPort: (port) => ipcRenderer.invoke('serial:disconnect', port),
  readChannels: (port) => ipcRenderer.invoke('radio:readChannels', port),
  readBandPlan: (port) => ipcRenderer.invoke('radio:readBands', port),
  readGroups: (port) => ipcRenderer.invoke('radio:readGroups', port),
  writeChannel: (channelNumber, channelData) => ipcRenderer.invoke('write-channel', channelNumber, channelData),
  flashFirmware: (firmwarePath) => ipcRenderer.invoke('firmware:flash', firmwarePath),
  onFirmwareProgress: (callback) => {
    ipcRenderer.on('firmware:progress', (_event, progress) => callback(progress));
  },
  getLatestFirmware: () => ipcRenderer.invoke('firmware:getLatest'),
  getLatestVersion: () => ipcRenderer.invoke('firmware:getLatestVersion'),
  getFirmwareArchive: () => ipcRenderer.invoke('firmware:getArchive'),

  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  saveFileDialog: () => ipcRenderer.invoke('dialog:saveFile'),

  readFile: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
  writeFile: (filePath: string, data: string) => ipcRenderer.invoke('file:write', filePath, data),

  readSettings: () => ipcRenderer.invoke('radio:readSettings'),
  writeSettings: (settings) => ipcRenderer.invoke('radio:writeSettings', settings)
}

const dialog = {
  showMessageBox: (options) => ipcRenderer.invoke('dialog:showMessageBox', options)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('dialog', dialog)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  window.dialog = dialog
}
