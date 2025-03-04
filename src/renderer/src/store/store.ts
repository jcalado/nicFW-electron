import { create } from 'zustand'
import { Band, Channel, DTMFPreset, Group, ScanPreset } from '../../../main/types'
import { RadioSettings } from '../../../main/types/radioSettings'

interface AppState {
  // UI state
  selectedTab: string
  selectedPort: string
  isConnected: boolean

  // Data state
  channels: Channel[]
  bands: Band[]
  groups: Group[]
  settings: RadioSettings | undefined
  scanPresets: ScanPreset[]
  dtmfPresets: DTMFPreset[]

  // Actions
  setSelectedTab: (tab: string) => void
  setSelectedPort: (port: string) => void
  setIsConnected: (status: boolean) => void
  setChannels: (channels: Channel[]) => void
  setBands: (bands: Band[]) => void
  setGroups: (groups: Group[]) => void
  setSettings: (settings: RadioSettings) => void
  setScanPresets: (presets: ScanPreset[]) => void
  setDTMFPresets: (presets: DTMFPreset[]) => void

  // Thunks
  fetchCodeplug: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  selectedTab: 'port-picker',
  selectedPort: '',
  isConnected: false,
  channels: [],
  bands: [],
  groups: [],
  settings: undefined,
  scanPresets: [],
  dtmfPresets: [],

  // Actions
  setSelectedTab: (tab: string): void => set({ selectedTab: tab }),
  setSelectedPort: (port: string): void => set({ selectedPort: port }),
  setIsConnected: (status: boolean): void => set({ isConnected: status }),
  setChannels: (channels: Channel[]): void => set({ channels }),
  setBands: (bands: Band[]): void => set({ bands }),
  setGroups: (groups: Group[]): void => set({ groups }),
  setSettings: (settings: RadioSettings): void => set({ settings }),
  setScanPresets: (presets: ScanPreset[]): void => set({ scanPresets: presets }),
  setDTMFPresets: (presets: DTMFPreset[]): void => set({ dtmfPresets: presets }),

  // Thunks
  fetchCodeplug: async () => {
    try {
      await window.api.fetchCodeplug()
      console.log('Codeplug fetched successfully!')

      // Process codeplug data
      const fetchAndSetData = async () => {
        try {
          // Fetch settings
          const settings = await window.api.readSettings()
          set({ settings })

          // Fetch band plan
          const bands = await window.api.readBandPlan()
          set({ bands })

          // Fetch channels
          const channels = await window.api.readChannels()
          set({ channels })

          // Fetch groups
          const groups = await window.api.readGroups()
          set({ groups })

          // Fetch scan presets
          const scanPresets = await window.api.readScanPresets()
          set({ scanPresets })

          // Fetch DTMF presets
          const dtmfPresets = await window.api.readDTMFPresets()
          set({ dtmfPresets })

          // Update the selected tab to channel list after fetching
          set({ selectedTab: 'channel-list' })
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }

      await fetchAndSetData()
    } catch (error) {
      console.error('Error fetching codeplug:', error)
    }
  }
}))
