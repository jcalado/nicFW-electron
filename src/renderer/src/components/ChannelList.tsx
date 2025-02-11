import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Title1,
  Toolbar,
  ToolbarButton,
  ToolbarDivider
} from '@fluentui/react-components'
import { ArrowDownloadRegular, DocumentBulletListRegular, SaveRegular } from '@fluentui/react-icons'
import React, { useState } from 'react'

function ChannelList({ channels, isConnected, onReceiveChannels }) {


  const [isLoading, setIsLoading] = useState(false)

  const columns = [
    { columnKey: 'channelNumber', label: 'Number' },
    { columnKey: 'name', label: 'Name' },
    { columnKey: 'rxFreq', label: 'RX Freq.' },
    { columnKey: 'txFreq', label: 'TX Freq.' },
    { columnKey: 'rxTone', label: 'RX Tone' },
    { columnKey: 'txTone', label: 'TX Tone' },
    { columnKey: 'groups', label: 'Groups' },
    { columnKey: 'modulation', label: 'Modulation' },
    { columnKey: 'bandwidth', label: 'Bandwidth' },
    { columnKey: 'txPower', label: 'TX Power' }
  ]

  const readChannels = () => {
    setIsLoading(true)
    const result = window.api
      .readChannels()
      .then((data) => {
        console.log(data)
        setIsLoading(false)
        onReceiveChannels(data)
      })
      .catch((error) => {
        console.error('Error reading channels:', error)
      })
  }

  return (
    <div>
      <Toolbar>
        <ToolbarButton
          onClick={() => readChannels()}
          disabled={!isConnected}
          vertical
          appearance="primary"
          icon={<ArrowDownloadRegular />}
        >
          {isLoading ? 'Reading...' : 'Read'}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => readChannels()}
          disabled={!isConnected}
          vertical
          icon={<ArrowDownloadRegular />}
        >
          Write
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton onClick={() => readChannels()} vertical icon={<SaveRegular />}>
          Save
        </ToolbarButton>
        <ToolbarButton onClick={() => readChannels()} vertical icon={<DocumentBulletListRegular />}>
          Load
        </ToolbarButton>
      </Toolbar>

      {channels.length > 0 && <p>{channels.length} channels found.</p>}

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHeaderCell key={column.columnKey}>{column.label}</TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {channels &&
            channels.length > 0 &&
            channels.map((channel) => (
              <TableRow key={channel.channelNumber}>
                <TableCell key={channel.channelNumber}>{channel.channelNumber}</TableCell>
                <TableCell key={channel.name}>{channel.name}</TableCell>
                <TableCell key={channel.rxFreq}>{channel.rxFreq}</TableCell>
                <TableCell key={channel.txFreq}>{channel.txFreq}</TableCell>
                <TableCell key={channel.rxTone}>{channel.rxTone}</TableCell>
                <TableCell key={channel.txTone}>{channel.txTone}</TableCell>
                <TableCell key={channel.groups}>{channel.groups}</TableCell>
                <TableCell key={channel.modulation}>{channel.modulation}</TableCell>
                <TableCell key={channel.bandwidth}>{channel.bandwidth}</TableCell>
                <TableCell key={channel.txPower}>{channel.txPower}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
export default ChannelList
