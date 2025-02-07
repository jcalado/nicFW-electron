import { ElectronAPI } from '@electron-toolkit/preload'

export interface IApi {
  loadPreferences: () => Promise<void>,
  getSerialPorts: () => Promise<void>,
  connectPort: (port) => Promise<void>,
  disconnectPort: (port) => Promise<void>,
  readChannels: (port) => Promise<void>,
  readBandPlan: (port) => Promise<void>,
  readGroups: (port) => Promise<void>,
  writeChannel: (channelNumber, channelData) => Promise<void>,
  flashFirmware: (filePath) => Promise<void>,
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IApi
  }
}
