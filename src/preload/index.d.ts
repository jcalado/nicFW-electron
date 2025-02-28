import { ElectronAPI } from '@electron-toolkit/preload'
import { RadioSettings } from '@renderer/types/radioSettings'
import { SerialPort } from 'serialport'
export interface IApi {
  loadPreferences: () => Promise<void>
  getSerialPorts: () => Promise<SerialPort[]>
  connectPort: (port) => Promise<void>
  disconnectPort: (port) => Promise<void>
  readChannels: (port) => Promise<void>
  readBandPlan: (port) => Promise<void>
  readGroups: (port) => Promise<void>
  writeChannel: (channelNumber, channelData) => Promise<void>
  flashFirmware: (filePath) => Promise<void>
  getLatestFirmware: () => Promise<void>
  getFirmwareArchive: () => Promise<void>
  onProgress: (callback: (progress: number) => void) => void
  readSettings: () => Promise<void>
  writeSettings: (settings: RadioSettings) => Promise<void>
  readCodeplug: () => Promise<void>
  writeCodeplug: (codeplug) => Promise<void>
  loadCodeplug: () => Promise<void>
  openFileDialog: (extension: string) => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IApi
  }
}
