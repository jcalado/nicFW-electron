import { SelectTabData, SelectTabEvent, Tab, TabList } from '@fluentui/react-components'
import ChannelList from './components/ChannelList'
import PortPicker from './components/PortPicker'
import ScanPresetList from './components/ScanPresetList'
import GroupList from './components/GroupList'
import BandPlanList from './components/BandPlanList'
import Firmware from './components/Firmware'
import Settings from './components/Settings'
import Codeplug from './components/Codeplug'
import DTMFPresetList from './components/DTMFPresetList'
import { useAppStore } from './store/store'
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
import { Band, Channel, Group, RadioSettings } from '@main/types'

function App(): JSX.Element {
  // Use the Zustand store instead of useState
  const {
    selectedTab,
    setSelectedTab,
    selectedPort,
    setSelectedPort,
    isConnected,
    setIsConnected,
    channels,
    setChannels,
    bands,
    setBands,
    groups,
    setGroups,
    settings,
    setSettings,
    scanPresets,
    setScanPresets,
    dtmfPresets,
    setDTMFPresets,
    fetchCodeplug
  } = useAppStore()

  const handlePortSelect = (port: string): void => {
    console.log(`Selected port: ${port}`)
    setSelectedPort(port)
  }

  const handleConnected = async (connected: string): Promise<void> => {
    console.log(`Connection status changed to ${connected}`)
    if (connected !== '') {
      setIsConnected(true)
      await fetchCodeplug()
    } else {
      setIsConnected(false)
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
    console.log(`Received channels: ${channels.length}`)
    setChannels(channels)
  }

  const handleSettingsReceived = (settings: RadioSettings): void => {
    console.log(`Received settings: ${settings}`)
    setSettings(settings)
  }

  const statusColor = isConnected ? 'green' : 'red'

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
