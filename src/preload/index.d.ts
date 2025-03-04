import { ElectronAPI } from '@electron-toolkit/preload'
import { DTMFPreset, RadioSettings, ScanPreset } from '@main/types'
import { SerialPort } from 'serialport'
export interface IApi {
  loadPreferences: () => Promise<void>
  getSerialPorts: () => Promise<SerialPort[]>
  connectPort: (port) => Promise<void>
  disconnectPort: (port) => Promise<void>
  readChannels: () => Promise<Channel[]>
  readBandPlan: () => Promise<Band[]>
  readGroups: () => Promise<Group[]>
  writeChannel: (channelNumber, channelData) => Promise<void>
  writeChannels: (channels) => Promise<void>
  flashFirmware: (filePath) => Promise<void>
  getLatestFirmware: () => Promise<void>
  getFirmwareArchive: () => Promise<void>
  onProgress: (callback: (progress: number) => void) => void
  readSettings: () => Promise<readSettings>
  writeSettings: (settings: RadioSettings) => Promise<void>
  readCodeplug: () => Promise<void>
  writeCodeplug: (codeplug) => Promise<void>
  loadCodeplug: () => Promise<void>
  openFileDialog: (extension: string) => Promise<void>
  readScanPresets: () => Promise<ScanPreset[]>
  writeScanPresets: (presets) => Promise<void>
  readDTMFPresets: () => Promise<DTMFPreset[]>
  writeDTMFPresets: (presets) => Promise<void>
  fetchCodeplug: (onProgress: (progress: number) => void) => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IApi
  }
}
