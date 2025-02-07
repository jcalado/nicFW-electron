import { PresenceBadge, Tab, TabList } from '@fluentui/react-components'
import ChannelList from './components/ChannelList'
import PortPicker from './components/PortPicker'

import { useState } from 'react'
import { CheckmarkCircleFilled, SaveRegular } from '@fluentui/react-icons'
import GroupList from './components/GroupList'
import BandPlanList from './components/BandPlanList'

function App(): JSX.Element {
  const [selectedTab, setSelectedTab] = useState('port-picker')
  const [selectedPort, setSelectedPort] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [channels, setChannels] = useState([])
  const [bands, setBands] = useState([])
  const [groups, setGroups] = useState([])

  const handlePortSelect = (port: string): void => {
    console.log(`Selected port: ${port}`)
    setSelectedPort(port)
  }

  const handleConnected = (connected: boolean): void => {
    console.log(`Connection status changed to ${connected}`)
    setIsConnected(connected)
  }

  const handleTabSelect = (_e, tab: any): void => {
    console.log(`Selected tab: ${tab.value}`)
    setSelectedTab(tab.value)
  }

  const handleBandsReceived = (bands: any[]): void => {
    console.log(`Received bands: ${bands}`)
    setBands(bands)
  }

  const handleGroupsReceived = (groups: any[]): void => {
    console.log(`Received groups: ${bands}`)
    setGroups(groups)
  }

  const handleChannelsReceived = (channels: any[]): void => {
    console.log(`Received channels: ${bands}`)
    setChannels(channels)
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
          Connection {isConnected ? selectedPort : ''}
        </Tab>
        <Tab key="channel-list" value={'channel-list'}>
          Channels {channels && channels.length > 0 ? `(${channels.length})` : ''}
        </Tab>
        <Tab key="group-list" value={'group-list'}>
          Groups {groups && groups.length > 0 ? `(${groups.length})` : ''}
        </Tab>
        <Tab key="bandplan-list" value={'bandplan-list'}>
          Band Plan
        </Tab>
        <Tab key="firmware" value={'fw-list'}>
          Firmware
        </Tab>
      </TabList>
      <div className="container">
        {selectedTab === 'port-picker' && (
          <PortPicker onPortSelect={handlePortSelect} onConnected={handleConnected} isConnected={isConnected} />
        )}
        {selectedTab === 'channel-list' && <ChannelList channels={channels} isConnected={isConnected} onReceiveChannels={handleChannelsReceived}/>}
        {selectedTab === 'group-list' && <GroupList groups={groups} isConnected={isConnected} onGroupsReceived={handleGroupsReceived} />}
        {selectedTab === 'bandplan-list' && (
          <BandPlanList
            bands={bands}
            isConnected={isConnected}
            onBandsReceived={handleBandsReceived}
          />
        )}
      </div>
    </>
  )
}

export default App
