import {
  Button,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  InsertBeforeRegular,
  InsertAfterRegular
} from '@fluentui/react-components'
import {
  ArrowDownloadRegular,
  DocumentBulletListRegular,
  SaveRegular,
  ArrowUploadRegular,
  EditRegular,
  DeleteRegular,
  AddRegular,
  ArrowTurnDownRightRegular,
  ArrowTurnRightRegular
} from '@fluentui/react-icons'
import React, { useState } from 'react'
import { Channel } from '../types'
import PropTypes from 'prop-types'
import EditChannelDialog from './EditChannelDialog'
import WriteChannelsDialog from './WriteChannelsDialog'

const useStyles = makeStyles({
  content: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '10px'
  },
  tableContainer: {
    overflow: 'auto',
    height: 'calc(100vh - 110px)'
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: 'var(--colorNeutralBackground1)',
    zIndex: 1
  },
  contextMenu: {
    position: 'fixed',
    zIndex: 1000
  }
})

function ChannelList({ channels, isConnected, onReceiveChannels }: { channels: Channel[], isConnected: boolean, onReceiveChannels: (channels: Channel[]) => void }): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null)
  const [writing, setWriting] = useState(false)
  const [error, setError] = useState(null)
  // Context menu state
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number, y: number } | null>(null)
  const [contextMenuChannel, setContextMenuChannel] = useState<Channel | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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

  const writeChannels = () => {
    setWriting(true)
    window.api
      .writeChannels(channels)
      .then(() => {
        console.log('Channels written successfully!')
        setWriting(false)
      })
      .catch((error) => {
        console.error('Error writing channels:', error)
        setWriting(false)
        setError(error)
      })
  }

  const handleFileImport = async () => {
    try {
      const filePath = await window.api.openFileDialog()
      if (filePath) {
        const fileContents = await window.api.readFile(filePath)
        const parsedChannels = parseCSV(fileContents)
        onReceiveChannels(parsedChannels)
        console.log('Channels imported and written successfully!')
      }
    } catch (error) {
      console.error('Error importing channels:', error)
    }
  }

  const handleFileExport = async () => {
    try {
      const csvContent = convertChannelsToCSV(channels)
      const filePath = await window.api.saveFileDialog()
      if (filePath) {
        await window.api.writeFile(filePath, csvContent)
        console.log('Channels exported successfully!')
      }
    } catch (error) {
      console.error('Error exporting channels:', error)
    }
  }

  // The parseCSV and convertChannelsToCSV functions remain unchanged

  const parseCSV = (csvText: string): Channel[] => {
    const lines = csvText.split('\n')
    const headers = lines[0].split(',')

    const groupLetterToNumber = (letter: string): number => {

      switch (letter) {
        case 'A':
          return 1
        case 'B':
          return 2
        case 'C':
          return 3
        case 'D':
          return 4
        case 'E':
          return 5
        case 'F':
          return 6
        case 'G':
          return 7
        case 'H':
          return 8
        default:
          return 0
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
            : values[13],
          busyLock: values[14] === 'True',
          reversed: values[15] === 'True',
          position: 0,
          // pttID can be 'Off', 'BoT', 'EoT', 'Both'
          pttID: ['Off', 'BoT', 'EoT', 'Both'].includes(values[16])
            ? (values[16] as 'Off' | 'BoT' | 'EoT' | 'Both')
            : 'Off'
        }
      }
      console.log(channel.groups)
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
      // Convert group numbers to letters (1=A, 2=B, etc.) or empty if 0
      const groupToLetter = (groupNum: number): string => {
        return groupNum === 0 ? '' : String.fromCharCode(64 + groupNum);
      };

      return [
        channel.channelNumber,
        'True', // Active (default to True)
        channel.name,
        channel.rxFreq,
        channel.txFreq,
        channel.rxSubTone,
        channel.txSubTone,
        channel.txPower,
        groupToLetter(channel.groups.g0), // Slot1
        groupToLetter(channel.groups.g1), // Slot2
        groupToLetter(channel.groups.g2), // Slot3
        groupToLetter(channel.groups.g3), // Slot4
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

  const handleDelete = (channel: Channel) => {
    setContextMenuChannel(channel)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (contextMenuChannel) {
      const updatedChannels = channels.filter(
        (channel) => channel.channelNumber !== contextMenuChannel.channelNumber
      )
      onReceiveChannels(updatedChannels)
      setIsDeleteDialogOpen(false)
      setContextMenuChannel(null)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, channel: Channel) => {
    e.preventDefault()
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setContextMenuChannel(channel)
  }

  const closeContextMenu = () => {
    setContextMenuPosition(null)
    setContextMenuChannel(null)
  }

  const handleSave = async () => {
    if (editingChannel) {
      const updatedChannels = channels.map((channel) =>
        channel.channelNumber === editingChannel.channelNumber ? editingChannel : channel
      )
      onReceiveChannels(updatedChannels)
      setEditingChannel(null)
    }
  }

  const handleCancel = () => {
    setEditingChannel(null)
  }

  const handleWritingDialogClose = () => {
    setWriting(false)
    setError(null)
  }

  const createDefaultChannel = (channelNumber: number): Channel => {
    return {
      channelNumber,
      name: `New Channel ${channelNumber}`,
      rxFreq: 145.000,
      txFreq: 145.000,
      rxSubTone: 'Off',
      txSubTone: 'Off',
      txPower: 5,
      groups: {
        g0: 0,
        g1: 0,
        g2: 0,
        g3: 0
      },
      bits: {
        bandwidth: 'Wide',
        modulation: 'FM',
        busyLock: false,
        reversed: false,
        position: 0,
        pttID: 'Off'
      }
    };
  };

  const renumberChannels = (channelsList: Channel[]): Channel[] => {
    return channelsList
      .sort((a, b) => a.channelNumber - b.channelNumber)
      .map((channel, index) => ({
        ...channel,
        channelNumber: index + 1
      }));
  };

  const handleInsertBefore = (beforeChannel: Channel) => {
    const newChannel = createDefaultChannel(beforeChannel.channelNumber);

    // Insert the new channel at the current position
    const updatedChannels = [
      ...channels.filter(ch => ch.channelNumber < beforeChannel.channelNumber),
      newChannel,
      ...channels.filter(ch => ch.channelNumber >= beforeChannel.channelNumber)
    ];

    // Renumber all channels to ensure proper sequence
    const renumberedChannels = renumberChannels(updatedChannels);

    // Update the channel list and open the edit dialog
    onReceiveChannels(renumberedChannels);
    handleEdit(renumberedChannels.find(ch =>
      ch.name === newChannel.name && ch.rxFreq === newChannel.rxFreq) || newChannel);

    closeContextMenu();
  };

  const handleInsertAfter = (afterChannel: Channel) => {
    const newChannel = createDefaultChannel(afterChannel.channelNumber + 1);

    // Insert the new channel after the selected position
    const updatedChannels = [
      ...channels.filter(ch => ch.channelNumber <= afterChannel.channelNumber),
      newChannel,
      ...channels.filter(ch => ch.channelNumber > afterChannel.channelNumber)
    ];

    // Renumber all channels to ensure proper sequence
    const renumberedChannels = renumberChannels(updatedChannels);

    // Update the channel list and open the edit dialog
    onReceiveChannels(renumberedChannels);
    handleEdit(renumberedChannels.find(ch =>
      ch.name === newChannel.name && ch.rxFreq === newChannel.rxFreq) || newChannel);

    closeContextMenu();
  };

  const handleAddNewChannel = () => {
    // Find the highest channel number
    const highestChannelNumber = channels.length > 0
      ? Math.max(...channels.map(ch => ch.channelNumber))
      : 0;

    // Create a new channel with defaults
    const newChannel = createDefaultChannel(highestChannelNumber + 1);

    // Add to channels list and open edit dialog
    onReceiveChannels([...channels, newChannel]);
    handleEdit(newChannel);
  };

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
          onClick={() => writeChannels()}
          disabled={!isConnected}
          vertical
          icon={<ArrowUploadRegular />}
        >
          Write
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton onClick={handleAddNewChannel} vertical icon={<AddRegular />}>
          New
        </ToolbarButton>
        <ToolbarButton onClick={handleFileExport} vertical icon={<SaveRegular />}>
          Save
        </ToolbarButton>
        <ToolbarButton onClick={handleFileImport} vertical icon={<DocumentBulletListRegular />}>
          Load
        </ToolbarButton>
      </Toolbar>

      <div className={styles.tableContainer}>
        <Table>
          <TableHeader>
            <TableRow className={styles.stickyHeader}>
              {columns.map((column) => (
                <TableHeaderCell key={column.columnKey}>{column.label}</TableHeaderCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {channels &&
              channels.length > 0 &&
              channels.map((channel: Channel) => (
                <TableRow
                  key={channel.channelNumber}
                  onDoubleClick={() => handleEdit(channel)}
                  onContextMenu={(e) => handleContextMenu(e, channel)}
                >
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
      </div>

      {/* Context Menu */}
      {contextMenuPosition && contextMenuChannel && (
        <div
          className={styles.contextMenu}
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y
          }}
        >
          <Menu open={true} onOpenChange={closeContextMenu}>
            <MenuTrigger disableButtonEnhancement>
              <div />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem
                  icon={<EditRegular />}
                  onClick={() => {
                    closeContextMenu();
                    handleEdit(contextMenuChannel);
                  }}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  icon={<ArrowTurnRightRegular />}
                  onClick={() => handleInsertBefore(contextMenuChannel)}
                >
                  Insert Before
                </MenuItem>
                <MenuItem
                  icon={<ArrowTurnDownRightRegular />}
                  onClick={() => handleInsertAfter(contextMenuChannel)}
                >
                  Insert After
                </MenuItem>
                <MenuItem
                  icon={<DeleteRegular />}
                  onClick={() => {
                    closeContextMenu();
                    handleDelete(contextMenuChannel);
                  }}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(_, data) => setIsDeleteDialogOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete Channel</DialogTitle>
            <DialogContent>
              Are you sure you want to delete channel {contextMenuChannel?.channelNumber} ({contextMenuChannel?.name})?
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Use the extracted components */}
      <EditChannelDialog
        channel={editingChannel}
        onSave={handleSave}
        onCancel={handleCancel}
        onChannelChange={setEditingChannel}
      />

      <WriteChannelsDialog
        writing={writing}
        error={error}
        onClose={handleWritingDialogClose}
      />
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
        pttID: PropTypes.oneOf(['Off', 'BoT', 'EoT', 'Both']).isRequired,
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
