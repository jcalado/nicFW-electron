import { ElectronAPI } from '@electron-toolkit/preload'
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
  onFirmwareProgress: (callback: (progress: number) => void) => void
  readSettings: () => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IApi
  }
}
