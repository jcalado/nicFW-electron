import {
  Button,
  Checkbox,
  Combobox,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Input,
  Label,
  makeStyles,
  Option,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Toolbar,
  ToolbarButton,
  ToolbarDivider
} from '@fluentui/react-components'
import {
  ArrowDownloadRegular,
  DocumentBulletListRegular,
  SaveRegular,
  ArrowUploadRegular
} from '@fluentui/react-icons'
import React, { useEffect, useState } from 'react'
import { Channel } from '../types'

const useStyles = makeStyles({
  content: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '10px'
  }
})

import PropTypes from 'prop-types'
import { read } from 'fs'

function ChannelList({ channels, isConnected, onReceiveChannels }: { channels: Channel[], isConnected: boolean, onReceiveChannels: (channels: Channel[]) => void }): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null)

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
    { columnKey: 'txPower', label: 'TX Power' },
    { columnKey: 'busyLock', label: 'Busy lock' },
    { columnKey: 'reversed', label: 'Reversed' },
    { columnKey: 'pttID', label: 'PTT ID' }
  ]

  const readChannels = () => {
    setIsLoading(true)
    window.api
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

  const handleFileImport = async () => {
    try {
      // Open file picker dialog
      const filePath = await window.api.openFileDialog()

      if (filePath) {
        // Read the file contents
        const fileContents = await window.api.readFile(filePath)

        // Parse the CSV data
        const parsedChannels = parseCSV(fileContents)

        // Update the UI with the parsed channels
        onReceiveChannels(parsedChannels)

        console.log('Channels imported and written successfully!')
      }
    } catch (error) {
      console.error('Error importing channels:', error)
    }
  }

  const handleFileExport = async () => {
    try {
      // Convert channels to CSV
      const csvContent = convertChannelsToCSV(channels)

      // Open save dialog and get the file path
      const filePath = await window.api.saveFileDialog()

      if (filePath) {
        // Write the CSV content to the file
        await window.api.writeFile(filePath, csvContent)

        console.log('Channels exported successfully!')
      }
    } catch (error) {
      console.error('Error exporting channels:', error)
    }
  }

  const parseCSV = (csvText: string): Channel[] => {
    const lines = csvText.split('\n')
    const headers = lines[0].split(',')

    const groupLetterToNumber = (letter: string): number => {
      try {
        return letter.charCodeAt(0) - 64 // 'A' -> 1, 'B' -> 2, etc.
      } catch (error) {
        console.log(error)
      }

    }

    return lines.slice(1).map((line) => {
      const values = line.split(',')
      const channel: Channel = {
        channelNumber: parseInt(values[0], 10),
        name: values[2],
        rxFreq: parseFloat(values[3]),
        txFreq: parseFloat(values[4]),
        rxSubTone: values[5],
        txSubTone: values[6],
        txPower: parseInt(values[7], 10),
        groups: {
          g0: groupLetterToNumber(values[8]),
          g1: groupLetterToNumber(values[9]),
          g2: groupLetterToNumber(values[10]),
          g3: groupLetterToNumber(values[11])
        },
        bits: {
          bandwidth: values[12] === 'Wide' ? 'Wide' : 'Narrow',
          modulation: ['FM', 'NFM', 'AM', 'USB', 'Unknown'].includes(values[13])
            ? (values[13] as 'FM' | 'NFM' | 'AM' | 'USB' | 'Unknown')
            : 'Unknown',
          busyLock: values[14] === 'True',
          reversed: values[15] === 'True',
          position: 0,
          pttID: values[16]
        }
      }
      return channel
    })
  }

  const convertChannelsToCSV = (channels: Channel[]): string => {
    const headers = [
      'Channel_Num',
      'Active',
      'Name',
      'RX',
      'TX',
      'RX_Tone',
      'TX_Tone',
      'TX_Power',
      'Slot1',
      'Slot2',
      'Slot3',
      'Slot4',
      'Bandwidth',
      'Modulation',
      'BusyLock',
      'Reversed',
      'PTT ID'
    ]

    const rows = channels.map((channel) => {
      return [
        channel.channelNumber,
        'True', // Active (default to True)
        channel.name,
        channel.rxFreq,
        channel.txFreq,
        channel.rxSubTone,
        channel.txSubTone,
        channel.txPower,
        channel.groups.toString(),
        channel.bits.bandwidth,
        channel.bits.modulation,
        channel.bits.busyLock,
        channel.bits.reversed,
        channel.bits.pttID
      ].join(',')
    })

    return [headers.join(','), ...rows].join('\n')
  }

  const handleEdit = (channel: Channel) => {
    console.log('Editing channel:', channel)
    setEditingChannel(channel)
  }

  const handleSave = async () => {
    if (editingChannel) {
      try {
        await window.api.writeChannel(editingChannel.channelNumber, editingChannel)
        setEditingChannel(null) // Close modal
        // Optionally refresh the channel list
        const updatedChannels = await window.api.readChannels()
        onReceiveChannels(updatedChannels)
      } catch (error) {
        console.error('Error saving channel:', error)
      }
    }
  }

  const handleCancel = () => {
    setEditingChannel(null) // Close modal
  }

  const styles = useStyles()

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
          icon={<ArrowUploadRegular />}
        >
          Write
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton onClick={handleFileExport} vertical icon={<SaveRegular />}>
          Save
        </ToolbarButton>
        <ToolbarButton onClick={handleFileImport} vertical icon={<DocumentBulletListRegular />}>
          Load
        </ToolbarButton>
      </Toolbar>

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
            channels.map((channel: Channel) => (
              <TableRow key={channel.channelNumber} onDoubleClick={() => handleEdit(channel)}>
                <TableCell key={`${channel.channelNumber}-channel.channelNumber`}>{channel.channelNumber}</TableCell>
                <TableCell key={`${channel.channelNumber}-channel.name`}>{channel.name}</TableCell>
                <TableCell key={`${channel.channelNumber}-channel.rxFreq`}>{channel.rxFreq}</TableCell>
                <TableCell key={`${channel.channelNumber}-channel.txFreq`}>{channel.txFreq}</TableCell>
                <TableCell key={`${channel.channelNumber}-channel.rxSubTone`}>{channel.rxSubTone}</TableCell>
                <TableCell key={`${channel.channelNumber}-channel.txSubTone`}>{channel.txSubTone}</TableCell>
                <TableCell key={`${channel.channelNumber}-channel.groups.g0`}>
                  {Object.values(channel.groups)
                  .map((groupNumber) => groupNumber === 0 ? '' : String.fromCharCode(64 + groupNumber))
                  .join('')}
                </TableCell>
                <TableCell key={`${channel.channelNumber}-channel.bits.modulation`}>{channel.bits.modulation}</TableCell>
                <TableCell key={`${channel.channelNumber}-channel.bits.bandwidth`}>{channel.bits.bandwidth}</TableCell>
                <TableCell key={`${channel.channelNumber}-channel.txPower`}>{channel.txPower}</TableCell>
                <TableCell key={`${channel.channelNumber}-channel.bits.busyLock`}>{channel.bits.busyLock ? 'Yes' : 'No'}</TableCell>
                <TableCell key={`${channel.channelNumber}-channel.bits.reversed`}>{channel.bits.reversed ? 'Yes' : 'No'}</TableCell>
                <TableCell key={`${channel.channelNumber}-channel.bits.pttid`}>{channel.bits.pttID}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <Dialog
        open={editingChannel}
        onOpenChange={(event, data) => {
          // it is the users responsibility to react accordingly to the open state change
          setEditingChannel(null)
        }}
      >
        <DialogSurface>
          <form>
            <DialogBody>
              <DialogTitle>
                Edit channel {editingChannel?.channelNumber} - {editingChannel?.name}
              </DialogTitle>
              <DialogContent className={styles.content}>
                <Label>Name</Label>
                <Input
                  value={editingChannel?.name || ''}
                  onChange={(e) => setEditingChannel({ ...editingChannel, name: e.target.value })}
                />

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '10px',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', rowGap: '10px' }}>
                    <Label>RX Frequency</Label>
                    <Input
                      value={editingChannel?.rxFreq || ''}
                      onChange={(e) =>
                        setEditingChannel({ ...editingChannel, rxFreq: e.target.value })
                      }
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', rowGap: '10px' }}>
                    {' '}
                    <Label>TX Frequency</Label>
                    <Input
                      value={editingChannel?.txFreq || ''}
                      onChange={(e) =>
                        setEditingChannel({ ...editingChannel, txFreq: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '10px',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', rowGap: '10px' }}>
                    <Label>RX Tone</Label>
                    <Input
                      value={editingChannel?.rxTone || ''}
                      onChange={(e) =>
                        setEditingChannel({ ...editingChannel, rxTone: e.target.value })
                      }
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', rowGap: '10px' }}>
                    {' '}
                    <Label>TX Tone</Label>
                    <Input
                      value={editingChannel?.txTone || ''}
                      onChange={(e) =>
                        setEditingChannel({ ...editingChannel, txTone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <Label>Groups</Label>
                <Combobox multiselect>
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((group) => (
                    <Option key={group}>{group}</Option>
                  ))}
                </Combobox>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleSave}>Save</Button>
                <Button onClick={handleCancel}>Cancel</Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>
    </div>
  )
}

ChannelList.propTypes = {
  channels: PropTypes.arrayOf(
    PropTypes.shape({
      channelNumber: PropTypes.number.isRequired,
      rxFreq: PropTypes.number.isRequired,
      txFreq: PropTypes.number.isRequired,
      rxSubTone: PropTypes.string,
      txSubTone: PropTypes.string,
      txPower: PropTypes.number,
      groups: PropTypes.shape({
        g0: PropTypes.number,
        g1: PropTypes.number,
        g2: PropTypes.number,
        g3: PropTypes.number
      }).isRequired,
      bits: PropTypes.shape({
        bandwidth: PropTypes.oneOf(['Wide', 'Narrow']).isRequired,
        modulation: PropTypes.oneOf(['FM', 'NFM', 'AM', 'USB', 'Unknown']).isRequired,
        position: PropTypes.number.isRequired,
        pttID: PropTypes.number.isRequired,
        reversed: PropTypes.bool.isRequired,
        busyLock: PropTypes.bool.isRequired
      }).isRequired,
      reserved: PropTypes.any,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  isConnected: PropTypes.bool.isRequired,
  onReceiveChannels: PropTypes.func.isRequired
}

export default ChannelList
