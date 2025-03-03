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
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger
} from '@fluentui/react-components'
import {
  ArrowDownloadRegular,
  ArrowUploadRegular,
  AddRegular,
  EditRegular,
  DeleteRegular,
  ArrowTurnRightRegular,
  ArrowTurnDownRightRegular
} from '@fluentui/react-icons'
import React, { useEffect, useState } from 'react'
import { DTMFPreset } from '../types'
import EditDTMFPresetDialog from './EditDTMFPresetDialog'

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
  },
  highlight: {
    backgroundColor: 'var(--colorNeutralBackground3)'
  }
})

function DTMFPresetList({ presets, isConnected, onPresetsReceived }: {
  presets: DTMFPreset[],
  isConnected: boolean,
  onPresetsReceived: (presets: DTMFPreset[]) => void
}): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingPreset, setEditingPreset] = useState<DTMFPreset | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number, y: number } | null>(null)
  const [contextMenuPreset, setContextMenuPreset] = useState<DTMFPreset | null>(null)

  const styles = useStyles()

  const columns = [
    { columnKey: 'presetNumber', label: 'Number' },
    { columnKey: 'label', label: 'Label' },
    { columnKey: 'sequence', label: 'DTMF Sequence' },
    { columnKey: 'length', label: 'Length' }
  ]

  // Helper function to create a default preset
  const createDefaultPreset = (presetNumber: number): DTMFPreset => {
    return {
      presetNumber,
      label: `Preset ${presetNumber}`,
      sequence: "123",
      length: 3
    };
  };

  // Helper function to renumber presets
  const renumberPresets = (presetsList: DTMFPreset[]): DTMFPreset[] => {
    return presetsList
      .sort((a, b) => a.presetNumber - b.presetNumber)
      .map((preset, index) => ({
        ...preset,
        presetNumber: index
      }));
  };

  const readPresets = async () => {
    setIsLoading(true)
    try {
      const data = await window.api.readDTMFPresets()
      onPresetsReceived(data)
    } catch (error) {
      console.error('Error reading DTMF presets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const writePresets = async () => {
    setIsSaving(true)
    try {
      await window.api.writeDTMFPresets(presets)
      console.log('DTMF presets written successfully!')
    } catch (error) {
      console.error('Error writing DTMF presets:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddNewPreset = () => {
    // Find the next available preset number
    const usedNumbers = presets.map(p => p.presetNumber);
    let nextNumber = 0;
    while (usedNumbers.includes(nextNumber)) {
      nextNumber++;
    }

    // Don't allow more than 20 presets
    if (nextNumber >= 20) {
      alert("Maximum number of presets reached (20)");
      return;
    }

    const newPreset = createDefaultPreset(nextNumber);
    onPresetsReceived([...presets, newPreset]);
    handleEdit(newPreset);
  }

  const handleEdit = (preset: DTMFPreset) => {
    setEditingPreset(preset)
  }

  const handleSave = () => {
    if (editingPreset) {
      const updatedPresets = presets.map((preset) =>
        preset.presetNumber === editingPreset.presetNumber ? editingPreset : preset
      )
      onPresetsReceived(updatedPresets)
      setEditingPreset(null)
    }
  }

  const handleCancel = () => {
    setEditingPreset(null)
  }

  const handleDelete = (preset: DTMFPreset) => {
    setContextMenuPreset(preset)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (contextMenuPreset) {
      const updatedPresets = presets.filter(
        (preset) => preset.presetNumber !== contextMenuPreset.presetNumber
      )
      onPresetsReceived(updatedPresets)
      setIsDeleteDialogOpen(false)
      setContextMenuPreset(null)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, preset: DTMFPreset) => {
    e.preventDefault()
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setContextMenuPreset(preset)
  }

  const closeContextMenu = () => {
    setContextMenuPosition(null)
    setContextMenuPreset(null)
  }

  const handleInsertBefore = (beforePreset: DTMFPreset) => {
    const newPreset = createDefaultPreset(beforePreset.presetNumber);

    // Insert the new preset at the current position
    const updatedPresets = [
      ...presets.filter(p => p.presetNumber < beforePreset.presetNumber),
      newPreset,
      ...presets.filter(p => p.presetNumber >= beforePreset.presetNumber)
    ];

    // Renumber all presets to ensure proper sequence
    const renumberedPresets = renumberPresets(updatedPresets);

    // Update the preset list and open the edit dialog
    onPresetsReceived(renumberedPresets);
    handleEdit(renumberedPresets.find(p =>
      p.label === newPreset.label && p.sequence === newPreset.sequence) || newPreset);

    closeContextMenu();
  };

  const handleInsertAfter = (afterPreset: DTMFPreset) => {
    const newPreset = createDefaultPreset(afterPreset.presetNumber + 1);

    // Insert the new preset after the selected position
    const updatedPresets = [
      ...presets.filter(p => p.presetNumber <= afterPreset.presetNumber),
      newPreset,
      ...presets.filter(p => p.presetNumber > afterPreset.presetNumber)
    ];

    // Renumber all presets to ensure proper sequence
    const renumberedPresets = renumberPresets(updatedPresets);

    // Update the preset list and open the edit dialog
    onPresetsReceived(renumberedPresets);
    handleEdit(renumberedPresets.find(p =>
      p.label === newPreset.label && p.sequence === newPreset.sequence) || newPreset);

    closeContextMenu();
  };

  useEffect(() => {
    if (presets.length === 0 && isConnected) {
      readPresets()
    }
  }, [isConnected])

  return (
    <div>
      <Toolbar>
        <ToolbarButton
          onClick={readPresets}
          disabled={!isConnected || isLoading}
          vertical
          appearance="primary"
          icon={<ArrowDownloadRegular />}
        >
          {isLoading ? 'Reading...' : 'Read'}
        </ToolbarButton>
        <ToolbarButton
          onClick={writePresets}
          disabled={!isConnected || isSaving || presets.length === 0}
          vertical
          icon={<ArrowUploadRegular />}
        >
          {isSaving ? 'Saving...' : 'Write'}
        </ToolbarButton>
        <ToolbarButton
          onClick={handleAddNewPreset}
          vertical
          icon={<AddRegular />}
        >
          New
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
            {presets.map((preset) => (
              <TableRow
                key={preset.presetNumber}
                onDoubleClick={() => handleEdit(preset)}
                onContextMenu={(e) => handleContextMenu(e, preset)}
                className={preset.presetNumber === 19 ? styles.highlight : undefined}
              >
                <TableCell>{preset.presetNumber}</TableCell>
                <TableCell>{preset.label}</TableCell>
                <TableCell>{preset.sequence}</TableCell>
                <TableCell>{preset.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Context Menu */}
      {contextMenuPosition && contextMenuPreset && (
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
                    handleEdit(contextMenuPreset);
                  }}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  icon={<ArrowTurnRightRegular />}
                  onClick={() => handleInsertBefore(contextMenuPreset)}
                >
                  Insert Before
                </MenuItem>
                <MenuItem
                  icon={<ArrowTurnDownRightRegular />}
                  onClick={() => handleInsertAfter(contextMenuPreset)}
                >
                  Insert After
                </MenuItem>
                <MenuItem
                  icon={<DeleteRegular />}
                  onClick={() => {
                    closeContextMenu();
                    handleDelete(contextMenuPreset);
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
            <DialogTitle>Delete DTMF Preset</DialogTitle>
            <DialogContent>
              {contextMenuPreset?.presetNumber === 19 ? (
                <span style={{ color: 'red' }}>
                  Warning: Preset 19 is used for PTT ID. Are you sure you want to delete it?
                </span>
              ) : (
                <span>
                  Are you sure you want to delete preset {contextMenuPreset?.presetNumber} ({contextMenuPreset?.label})?
                </span>
              )}
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

      {/* Edit Dialog */}
      {editingPreset && (
        <EditDTMFPresetDialog
          preset={editingPreset}
          onSave={handleSave}
          onCancel={handleCancel}
          onChange={setEditingPreset}
        />
      )}
    </div>
  )
}

export default DTMFPresetList
