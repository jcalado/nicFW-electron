import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { write } from 'fs';

// Custom APIs for renderer
const api = {
  getSerialPorts: () => ipcRenderer.invoke('serial:list'),
  connectPort: (port) => ipcRenderer.invoke('serial:connect', port),
  disconnectPort: (port) => ipcRenderer.invoke('serial:disconnect', port),

  readChannels: (port) => ipcRenderer.invoke('radio:readChannels', port),
  writeChannels: (channels) => ipcRenderer.invoke('radio:writeChannels', channels),


  readBandPlan: (port) => ipcRenderer.invoke('radio:readBands', port),

  readGroups: (port) => ipcRenderer.invoke('radio:readGroups', port),
  writeGroups: (groups) => ipcRenderer.invoke('radio:writeGroups', groups),

  writeChannel: (channelNumber, channelData) => ipcRenderer.invoke('write-channel', channelNumber, channelData),
  flashFirmware: (firmwarePath) => ipcRenderer.invoke('firmware:flash', firmwarePath),
  onProgress: (callback) => {
    ipcRenderer.on('operation:progress', (_event, progress) => callback(progress));
  },
  getLatestFirmware: () => ipcRenderer.invoke('firmware:getLatest'),
  getLatestVersion: () => ipcRenderer.invoke('firmware:getLatestVersion'),
  getFirmwareArchive: () => ipcRenderer.invoke('firmware:getArchive'),

  openFileDialog: (extension: string) => ipcRenderer.invoke('dialog:openFile', extension),
  saveFileDialog: () => ipcRenderer.invoke('dialog:saveFile'),

  readFile: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
  writeFile: (filePath: string, data: string) => ipcRenderer.invoke('file:write', filePath, data),

  readSettings: () => ipcRenderer.invoke('radio:readSettings'),
  writeSettings: (settings) => ipcRenderer.invoke('radio:writeSettings', settings),

  readCodeplug: () => ipcRenderer.invoke('radio:readCodeplug'),
  writeCodeplug: (codeplug) => ipcRenderer.invoke('radio:writeCodeplug', codeplug),
  saveCodeplug: (codeplug) => ipcRenderer.invoke('radio:saveCodeplug', codeplug),
  loadCodeplug: (codeplug) => ipcRenderer.invoke('radio:loadCodeplug', codeplug),
  fetchCodeplug: (onProgress: (progress: number) => void) =>
    ipcRenderer.invoke('codeplug:fetchCodeplug', onProgress),

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
