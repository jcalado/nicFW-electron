import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Band, DTMFPreset, Group, RadioSettings, ScanPreset } from '../main/types'

// Custom APIs for renderer
const api = {
  getSerialPorts: (): Promise<unknown> => ipcRenderer.invoke('serial:list'),
  connectPort: (port): Promise<unknown> => ipcRenderer.invoke('serial:connect', port),
  disconnectPort: (port): Promise<unknown> => ipcRenderer.invoke('serial:disconnect', port),

  readChannels: (): Promise<unknown> => ipcRenderer.invoke('radio:readChannels'),
  writeChannels: (channels): Promise<unknown> =>
    ipcRenderer.invoke('radio:writeChannels', channels),

  readBandPlan: (): Promise<Band[]> => ipcRenderer.invoke('radio:readBands'),

  readGroups: (): Promise<Group[]> => ipcRenderer.invoke('radio:readGroups'),
  writeGroups: (groups): Promise<unknown> => ipcRenderer.invoke('radio:writeGroups', groups),

  writeChannel: (channelNumber, channelData): Promise<unknown> =>
    ipcRenderer.invoke('write-channel', channelNumber, channelData),
  flashFirmware: (firmwarePath): Promise<unknown> =>
    ipcRenderer.invoke('firmware:flash', firmwarePath),
  onProgress: (callback: (progress: number) => void): void => {
    ipcRenderer.on('operation:progress', (_event, progress) => callback(progress))
  },
  getLatestFirmware: (): Promise<unknown> => ipcRenderer.invoke('firmware:getLatest'),
  getLatestVersion: (): Promise<unknown> => ipcRenderer.invoke('firmware:getLatestVersion'),
  getFirmwareArchive: (): Promise<unknown> => ipcRenderer.invoke('firmware:getArchive'),

  openFileDialog: (extension: string): Promise<unknown> =>
    ipcRenderer.invoke('dialog:openFile', extension),
  saveFileDialog: (): Promise<unknown> => ipcRenderer.invoke('dialog:saveFile'),

  readFile: (filePath: string): Promise<unknown> => ipcRenderer.invoke('file:read', filePath),
  writeFile: (filePath: string, data: string): Promise<unknown> =>
    ipcRenderer.invoke('file:write', filePath, data),

  readSettings: (): Promise<RadioSettings> => ipcRenderer.invoke('radio:readSettings'),
  writeSettings: (settings): Promise<unknown> =>
    ipcRenderer.invoke('radio:writeSettings', settings),

  readCodeplug: (): Promise<unknown> => ipcRenderer.invoke('radio:readCodeplug'),
  writeCodeplug: (codeplug): Promise<unknown> =>
    ipcRenderer.invoke('radio:writeCodeplug', codeplug),
  saveCodeplug: (codeplug): Promise<unknown> => ipcRenderer.invoke('radio:saveCodeplug', codeplug),
  loadCodeplug: (codeplug): Promise<unknown> => ipcRenderer.invoke('radio:loadCodeplug', codeplug),
  fetchCodeplug: (onProgress: (progress: number) => void): Promise<unknown> =>
    ipcRenderer.invoke('codeplug:fetchCodeplug', onProgress),

  readScanPresets: (): Promise<ScanPreset[]> => ipcRenderer.invoke('radio:readScanPresets'),
  writeScanPresets: (presets): Promise<unknown> =>
    ipcRenderer.invoke('radio:writeScanPresets', presets),

  readDTMFPresets: (): Promise<DTMFPreset[]> => ipcRenderer.invoke('radio:readDTMFPresets'),
  writeDTMFPresets: (presets): Promise<unknown> =>
    ipcRenderer.invoke('radio:writeDTMFPresets', presets)
}

const dialog = {
  showMessageBox: (options): Promise<unknown> =>
    ipcRenderer.invoke('dialog:showMessageBox', options)
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
  // @ts-ignore (define in dts)
  window.dialog = dialog
}
