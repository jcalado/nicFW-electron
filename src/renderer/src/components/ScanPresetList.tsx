import {
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
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover
} from '@fluentui/react-components'
import {
  ArrowDownloadRegular,
  ArrowUploadRegular,
  DocumentBulletListRegular,
  SaveRegular,
  AddRegular,
  DragRegular,
  ReOrderDotsVerticalFilled,
  EditRegular,
  DeleteRegular
} from '@fluentui/react-icons'
import React, { useState, useEffect } from 'react'
import { ScanPreset } from '../../../main/types'
import EditScanPresetDialog from './EditScanPresetDialog'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

const useStyles = makeStyles({
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
  dragHandle: {
    cursor: 'move',
    display: 'flex',
    alignItems: 'center'
  },
  emptyRow: {
    color: 'var(--colorNeutralForegroundDisabled)',
    fontStyle: 'italic'
  },
  dragIcon: {
    marginRight: '8px',
    opacity: 0.5
  },
  contextMenu: {
    position: 'fixed',
    zIndex: 1000
  }
})

function ScanPresetList({
  presets,
  isConnected,
  onPresetsReceived
}: {
  presets: ScanPreset[]
  isConnected: boolean
  onPresetsReceived: (presets: ScanPreset[]) => void
}): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [editingPreset, setEditingPreset] = useState<ScanPreset | null>(null)
  const [writing, setWriting] = useState(false)
  const [error, setError] = useState(null)
  const [normalizedPresets, setNormalizedPresets] = useState<ScanPreset[]>([])
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    preset: ScanPreset | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    preset: null
  })

  const styles = useStyles()

  const columns = [
    { columnKey: 'presetNumber', label: 'Number' },
    { columnKey: 'label', label: 'Label' },
    { columnKey: 'startFreq', label: 'Start MHz' },
    { columnKey: 'range', label: 'Range MHz' },
    { columnKey: 'step', label: 'Step MHz' },
    { columnKey: 'modulation', label: 'Modulation' },
    { columnKey: 'resume', label: 'Resume' },
    { columnKey: 'persist', label: 'Persist' },
    { columnKey: 'ultrascan', label: 'Ultrascan' }
  ]

  // Ensure we always have exactly 20 presets
  useEffect(() => {
    const normalized = [...presets]

    // Create a normalized list with all 20 presets
    const result: ScanPreset[] = Array(20)
      .fill(null)
      .map((_, i) => {
        // Find the preset with the matching presetNumber
        const existing = normalized.find((p) => p.presetNumber === i+1)

        // If found, use it; otherwise create an empty placeholder
        if (existing) return existing

        return {
          presetNumber: i+1,
          label: '',
          startFreq: 0,
          range: 0.5,
          step: 0.00625,
          resume: 5,
          persist: 3,
          modulation: 'FM',
          ultrascan: 0
        }
      })

    setNormalizedPresets(result)
  }, [presets])

  const readScanPresets = () => {
    setIsLoading(true)
    window.api
      .readScanPresets()
      .then((data) => {
        console.log(data)
        setIsLoading(false)
        onPresetsReceived(data)
      })
      .catch((error) => {
        console.error('Error reading scan presets:', error)
        setIsLoading(false)
      })
  }

  const writeScanPresets = () => {
    // Get all presets (including empty ones) with correct ordering
    const orderedPresets = normalizedPresets.map((preset, index) => ({
      ...preset,
      presetNumber: index // Ensure preset numbers match their positions
    }))

    // Filter out empty presets for writing
    const nonEmptyPresets = orderedPresets.filter((p) => p.startFreq >= 18.0)

    setWriting(true)
    window.api
      .writeScanPresets(nonEmptyPresets)
      .then(() => {
        console.log('Scan presets written successfully!')
        setWriting(false)

        // Update the state with properly renumbered presets
        onPresetsReceived(nonEmptyPresets)
      })
      .catch((error) => {
        console.error('Error writing scan presets:', error)
        setWriting(false)
        setError(error)
      })
  }

  const createNewScanPreset = () => {
    // Find the first empty preset slot
    const emptyIndex = normalizedPresets.findIndex((p) => !p.startFreq || p.startFreq < 18.0)

    if (emptyIndex !== -1) {
      // Create a new preset for this slot
      const newPreset: ScanPreset = {
        ...normalizedPresets[emptyIndex],
        label: `Preset ${emptyIndex + 1}`,
        startFreq: 145.0,
        range: 0.5,
        step: 0.00625,
        resume: 5,
        persist: 3,
        modulation: 'FM',
        ultrascan: 0
      }

      // Update the normalized presets array
      const updatedPresets = [...normalizedPresets]
      updatedPresets[emptyIndex] = newPreset

      // Update the presets
      const validPresets = updatedPresets.filter((p) => p.startFreq >= 18.0)
      onPresetsReceived(validPresets)

      // Open the edit dialog for the new preset
      setEditingPreset(newPreset)
    } else {
      alert('All 20 preset slots are full. Delete or edit an existing preset.')
    }
  }

  const handleEdit = (preset: ScanPreset) => {
    console.log('Editing preset:', preset)
    setEditingPreset({ ...preset })
  }

  const handleSave = async () => {
    if (editingPreset) {
      // Update the normalized presets array
      const updatedPresets = normalizedPresets.map((preset) =>
        preset.presetNumber === editingPreset.presetNumber ? editingPreset : preset
      )

      // Update state with valid presets
      const validPresets = updatedPresets.filter((p) => p.startFreq >= 18.0)
      onPresetsReceived(validPresets)
      setEditingPreset(null)
    }
  }

  const handleCancel = () => {
    setEditingPreset(null)
  }

  const handlePresetChange = (preset: ScanPreset) => {
    setEditingPreset(preset)
  }

  const onDragEnd = (result) => {
    // Drop outside the list
    if (!result.destination) {
      return
    }

    const { source, destination } = result

    // No change in position
    if (source.index === destination.index) {
      return
    }

    // Reorder the list
    const items = Array.from(normalizedPresets)
    const [removed] = items.splice(source.index, 1)
    items.splice(destination.index, 0, removed)

    // Update preset numbers to match their new positions
    const renumbered = items.map((preset, index) => ({
      ...preset,
      presetNumber: index + 1
    }))

    // Update state
    setNormalizedPresets(renumbered)

    // Update parent component with valid presets
    const validPresets = renumbered.filter((p) => p.startFreq >= 18.0)
    onPresetsReceived(validPresets)
  }

  const handleContextMenu = (event: React.MouseEvent, preset: ScanPreset) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      preset: preset
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      preset: null
    });
  };

  const handleDeletePreset = () => {
    if (contextMenu.preset) {
      // Create a copy of presets without the deleted one
      const updatedPresets = normalizedPresets.map(preset => {
        if (preset.presetNumber === contextMenu.preset!.presetNumber) {
          // Clear the preset data but keep the preset number
          return {
            ...preset,
            label: '',
            startFreq: 0,
            range: 0.5,
            step: 0.00625,
            resume: 5,
            persist: 3,
            modulation: 'FM',
            ultrascan: 0
          };
        }
        return preset;
      });

      // Update the state with the modified presets
      const validPresets = updatedPresets.filter(p => p.startFreq >= 18.0);
      onPresetsReceived(validPresets);
      setNormalizedPresets(updatedPresets);
      handleCloseContextMenu();
    }
  };

  const handleEditFromContextMenu = () => {
    if (contextMenu.preset) {
      handleEdit(contextMenu.preset);
      handleCloseContextMenu();
    }
  };

  return (
    <div>
      <Toolbar>
        <ToolbarButton
          onClick={readScanPresets}
          disabled={!isConnected}
          vertical
          appearance="primary"
          icon={<ArrowDownloadRegular />}
        >
          {isLoading ? 'Reading...' : 'Read'}
        </ToolbarButton>
        <ToolbarButton
          onClick={writeScanPresets}
          disabled={!isConnected || writing}
          vertical
          icon={<ArrowUploadRegular />}
        >
          {writing ? 'Writing...' : 'Write'}
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton onClick={createNewScanPreset} vertical icon={<AddRegular />}>
          New
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} vertical icon={<SaveRegular />}>
          Save
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} vertical icon={<DocumentBulletListRegular />}>
          Load
        </ToolbarButton>
      </Toolbar>

      <div className={styles.tableContainer}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Table>
            <TableHeader>
              <TableRow className={styles.stickyHeader}>
                {columns.map((column) => (
                  <TableHeaderCell key={column.columnKey}>{column.label}</TableHeaderCell>
                ))}
              </TableRow>
            </TableHeader>
            <Droppable droppableId="scan-presets" direction="vertical">
              {(provided) => (
                <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                  {normalizedPresets.map((preset, index) => {
                    const isEmpty = !preset.startFreq || preset.startFreq < 18.0

                    return (
                      <Draggable
                        key={`preset-${preset.presetNumber}`}
                        draggableId={`preset-${preset.presetNumber}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            onDoubleClick={() => handleEdit(preset)}
                            onContextMenu={(e) => handleContextMenu(e, preset)}
                            className={isEmpty ? styles.emptyRow : ''}
                            style={{
                              ...provided.draggableProps.style,
                              background: snapshot.isDragging
                                ? 'var(--colorNeutralBackground3)'
                                : undefined
                            }}
                          >
                            <TableCell {...provided.dragHandleProps}>
                              <div className={styles.dragHandle}>
                                <ReOrderDotsVerticalFilled className={styles.dragIcon} />
                                {preset.presetNumber-1}
                              </div>
                            </TableCell>
                            <TableCell>{preset.label || '-'}</TableCell>
                            <TableCell>{isEmpty ? '-' : preset.startFreq.toFixed(5)}</TableCell>
                            <TableCell>{isEmpty ? '-' : preset.range.toFixed(3)}</TableCell>
                            <TableCell>{isEmpty ? '-' : preset.step.toFixed(3)}</TableCell>
                            <TableCell>{isEmpty ? '-' : preset.modulation}</TableCell>
                            <TableCell>{isEmpty ? '-' : preset.resume}</TableCell>
                            <TableCell>{isEmpty ? '-' : preset.persist}</TableCell>
                            <TableCell>{isEmpty ? '-' : preset.ultrascan}</TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </Table>
        </DragDropContext>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <Menu
          open={contextMenu.visible}
          onOpenChange={(e, data) => {
            if (!data.open) handleCloseContextMenu();
          }}
        >
          <MenuTrigger disableButtonEnhancement>
            <div style={{ display: 'none' }}></div>
          </MenuTrigger>
          <MenuPopover
            style={{
              position: 'fixed',
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`
            }}
          >
            <MenuList>
              <MenuItem icon={<EditRegular />} onClick={handleEditFromContextMenu}>
                Edit
              </MenuItem>
              <MenuItem icon={<DeleteRegular />} onClick={handleDeletePreset}>
                Delete
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      )}

      <EditScanPresetDialog
        preset={editingPreset}
        onSave={handleSave}
        onCancel={handleCancel}
        onPresetChange={handlePresetChange}
      />
    </div>
  )
}

export default ScanPresetList
