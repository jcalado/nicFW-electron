import { SelectTabData, SelectTabEvent, Tab, TabList } from '@fluentui/react-components'
import ChannelList from './components/ChannelList'
import PortPicker from './components/PortPicker'
import ScanPresetList from './components/ScanPresetList'

import { useEffect, useState } from 'react'
import {
  ArchiveFilled,
  ChannelFilled,
  CheckmarkCircleFilled,
  DeveloperBoardLightningFilled,
  DialpadFilled,
  GroupListFilled,
  SettingsFilled,
  SlideTransitionFilled,
  SoundWaveCircleFilled
} from '@fluentui/react-icons'
import GroupList from './components/GroupList'
import BandPlanList from './components/BandPlanList'
import { Band, Group, Channel, ScanPreset, DTMFPreset } from './types'
import Firmware from './components/Firmware'
import Settings from './components/Settings'
import { RadioSettings } from './types/radioSettings'
import Codeplug from './components/Codeplug'
import DTMFPresetList from './components/DTMFPresetList'

function App(): JSX.Element {
  const [selectedTab, setSelectedTab] = useState('port-picker')
  const [selectedPort, setSelectedPort] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  const [channels, setChannels] = useState<Channel[]>([])
  const [bands, setBands] = useState<Band[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [settings, setSettings] = useState<RadioSettings>()
  const [scanPresets, setScanPresets] = useState<ScanPreset[]>([])
  const [dtmfPresets, setDTMFPresets] = useState<DTMFPreset[]>([])

  const handlePortSelect = (port: string): void => {
    console.log(`Selected port: ${port}`)
    setSelectedPort(port)
  }

  const handleConnected = async (connected: string): Promise<void> => {
    console.log(`Connection status changed to ${connected}`)
    if (connected !== '') {
      setIsConnected(true)
      await handleFetchCodeplug()
      processCodeplug()
    } else {
      setIsConnected(false)
    }
  }

  const handleFetchCodeplug = async () => {
    try {
      await window.api.fetchCodeplug()
      console.log('Codeplug fetched successfully!')
      // processCodeplug()
    } catch (error) {
      console.error('Error fetching codeplug:', error)
    } finally {
    }
  }

  const handleTabSelect = (_event: SelectTabEvent, data: SelectTabData): void => {
    console.log(`Selected tab: ${data.value}`)
    setSelectedTab(data.value as string)
  }

  const handleBandsReceived = (bands: Band[]): void => {
    console.log(`Received bands: ${bands}`)
    setBands(bands)
  }

  const handleGroupsReceived = (groups: Group[]): void => {
    console.log(`Received groups`)
    console.table(groups)
    setGroups(groups)
  }

  const handleChannelsReceived = (channels: Channel[]): void => {
    console.log(`Received channels: ${bands}`)
    setChannels(channels)
  }

  const handleSettingsReceived = (settings: RadioSettings): void => {
    console.log(`Received settings: ${settings}`)
    setSettings(settings)
  }

  const statusColor = isConnected ? 'green' : 'red'

  const processCodeplug = async () => {
    console.log('Codeplug fetched successfully!')

    const fetchChannels = async () => {
      try {
        const channels = await window.api.readChannels()
        setChannels(channels)
        setSelectedTab('channel-list')
      } catch (error) {
        console.error('Error fetching channels:', error)
      }
    }

    const fetchGroups = async () => {
      try {
        const groups = await window.api.readGroups()
        setGroups(groups)
      } catch (error) {
        console.error('Error fetching groups:', error)
      }
    }

    const fetchScanPresets = async () => {
      try {
        const presets = await window.api.readScanPresets()
        setScanPresets(presets)
      } catch (error) {
        console.error('Error fetching scan presets:', error)
      }
    }

    const fetchBandPlan = async () => {
      try {
        const bands = await window.api
          .readBandPlan()
          .then((data) => {
            setBands(data)
          })
          .catch((error) => {
            console.error('Error reading bandplan:', error)
          })
      } catch (error) {
        console.error('Error fetching bandplan:', error)
      }
    }

    const fetchSettings = async () => {
      console.log('Fetching settings')
      try {
        await window.api
          .readSettings()
          .then((data) => {
            console.log(data)
            setSettings(data)
          })
          .catch((error) => {
            console.error('Error reading bandplan:', error)
          })
      } catch (error) {
        console.error('Error fetching bandplan:', error)
      }
    }

    const fetchDTMFPresets = async () => {
      try {
        const presets = await window.api.readDTMFPresets()
        setDTMFPresets(presets)
      } catch (error) {
        console.error('Error fetching DTMF presets:', error)
      }
    }

    await fetchSettings()
    await fetchBandPlan()
    await fetchChannels()
    await fetchGroups()
    await fetchScanPresets()
    await fetchDTMFPresets()
  }

  return (
    <>
      <TabList onTabSelect={handleTabSelect}>
        <Tab
          key="port-picker"
          value={'port-picker'}
          icon={<CheckmarkCircleFilled color={statusColor} />}
        >
          Connection
        </Tab>
        <Tab key="channel-list" value={'channel-list'} icon={<ChannelFilled />}>
          Channels {channels && channels.length > 0 ? `(${channels.length})` : ''}
        </Tab>
        <Tab key="group-list" value={'group-list'} icon={<GroupListFilled />}>
          Groups
        </Tab>
        <Tab key="bandplan-list" value={'bandplan-list'} icon={<SlideTransitionFilled />}>
          Band Plan
        </Tab>

        <Tab key="firmware" value={'firmware'} icon={<DeveloperBoardLightningFilled />}>
          Firmware
        </Tab>
        <Tab key="scanPresets" value={'scanPresets'} icon={<SoundWaveCircleFilled />}>
          Scan Presets
        </Tab>
        <Tab key="dtmfPresets" value={'dtmfPresets'} icon={<DialpadFilled />}>
          DTMF Presets
        </Tab>
        <Tab key="codeplug" value={'codeplug'} icon={<ArchiveFilled />}>
          Codeplug
        </Tab>
        <Tab key="settings" value={'settings'} icon={<SettingsFilled />}>
          Settings
        </Tab>
      </TabList>
      <div className="container">
        {selectedTab === 'port-picker' && (
          <PortPicker
            onPortSelect={handlePortSelect}
            onConnected={handleConnected}
            isConnected={isConnected}
            port={selectedPort}
          />
        )}
        {selectedTab === 'channel-list' && (
          <ChannelList
            channels={channels}
            isConnected={isConnected}
            onReceiveChannels={handleChannelsReceived}
          />
        )}
        {selectedTab === 'group-list' && (
          <GroupList
            groups={groups}
            isConnected={isConnected}
            onGroupsReceived={handleGroupsReceived}
          />
        )}
        {selectedTab === 'bandplan-list' && (
          <BandPlanList
            bands={bands}
            isConnected={isConnected}
            onBandsReceived={handleBandsReceived}
          />
        )}
        {selectedTab === 'settings' && (
          <Settings
            isConnected={isConnected}
            settings={settings}
            onSettingsRead={handleSettingsReceived}
          />
        )}
        {selectedTab === 'firmware' && <Firmware isConnected={isConnected} />}
        {selectedTab === 'codeplug' && <Codeplug isConnected={isConnected} />}
        {selectedTab === 'scanPresets' && (
          <ScanPresetList
            presets={scanPresets}
            isConnected={isConnected}
            onPresetsReceived={setScanPresets}
          />
        )}
        {selectedTab === 'dtmfPresets' && (
          <DTMFPresetList
            presets={dtmfPresets}
            isConnected={isConnected}
            onPresetsReceived={setDTMFPresets}
          />
        )}
      </div>
    </>
  )
}

export default App
