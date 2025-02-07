import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Title1,
  Toolbar,
  ToolbarButton
} from '@fluentui/react-components'
import { ArrowDownloadRegular, DocumentBulletListRegular, SaveRegular } from '@fluentui/react-icons'
import React, { useState } from 'react'

function ChannelList({ isConnected }) {
  const [channels, setChannels] = useState([])
  const columns = [
    { columnKey: 'channelNumber', label: '🟢 Number' },
    { columnKey: 'name', label: '🏷️ Name' },
    { columnKey: 'rxFreq', label: '🔽 RX Frequency' },
    { columnKey: 'txFreq', label: '🔼 TX Frequency' },
    { columnKey: 'rxTone', label: 'RX Tone' },
    { columnKey: 'txTone', label: 'TX Tone' },
    { columnKey: 'groups', label: 'Groups' },
    { columnKey: 'modulation', label: 'Modulation' },
    { columnKey: 'bandwidth', label: '📡 Bandwidth' },
    { columnKey: 'txPower', label: '💣 TX Power' }
  ]

  const readChannels = () => {
    const result = window.api
      .readChannels()
      .then((data) => {
        console.log(data)
        setChannels(data)
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
          Read
        </ToolbarButton>
        <ToolbarButton
          onClick={() => readChannels()}
          disabled={!isConnected}
          vertical
          icon={<ArrowDownloadRegular />}
        >
          Write
        </ToolbarButton>
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
