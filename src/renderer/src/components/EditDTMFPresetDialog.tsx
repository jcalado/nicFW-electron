import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Button,
  Input,
  Label,
  makeStyles,
  Text
} from '@fluentui/react-components'
import { DTMFPreset } from '../types'
import React from 'react'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  warning: {
    color: 'red',
    marginBottom: '10px'
  },
  helpText: {
    fontSize: '12px',
    color: 'var(--colorNeutralForeground3)',
    marginTop: '4px'
  },
  error: {
    color: 'var(--colorPaletteRedForeground1)',
    fontSize: '12px',
    marginTop: '4px'
  }
})

interface EditDTMFPresetDialogProps {
  preset: DTMFPreset
  onSave: () => void
  onCancel: () => void
  onChange: (preset: DTMFPreset) => void
}

function EditDTMFPresetDialog({
  preset,
  onSave,
  onCancel,
  onChange
}: EditDTMFPresetDialogProps): JSX.Element {
  const styles = useStyles()

  const handleSequenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Filter out invalid characters (only allow 0-9, *, #, A-D)
    const validValue = value.replace(/[^0-9*#A-D]/gi, '').toUpperCase();

    onChange({
      ...preset,
      sequence: validValue,
      length: validValue.length
    });
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...preset,
      label: e.target.value
    });
  };

  const isValid = preset.sequence && preset.sequence.length > 0 && preset.sequence.length <= 9;
  const sequenceError = preset.sequence.length > 9
    ? "Sequence cannot exceed 9 characters"
    : preset.sequence.length === 0
      ? "Sequence cannot be empty"
      : null;

  return (
    <Dialog open={!!preset} onOpenChange={(_, { open }) => !open && onCancel()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{preset.presetNumber === 19 ? 'Edit PTT ID Preset' : 'Edit DTMF Preset'}</DialogTitle>
          <DialogContent>
            <div className={styles.container}>
              {preset.presetNumber === 19 && (
                <div className={styles.warning}>
                  This is the PTT ID preset that will be transmitted when PTT ID is enabled on a channel.
                </div>
              )}

              <div className={styles.field}>
                <Label htmlFor="preset-number">Preset Number</Label>
                <Input
                  id="preset-number"
                  value={preset.presetNumber.toString()}
                  disabled
                />
              </div>

              <div className={styles.field}>
                <Label htmlFor="preset-label">Label (max 7 chars)</Label>
                <Input
                  id="preset-label"
                  value={preset.label}
                  onChange={handleLabelChange}
                  maxLength={7}
                />
                <Text className={styles.helpText}>
                  Displayed when using the preset from the radio menu
                </Text>
              </div>

              <div className={styles.field}>
                <Label htmlFor="preset-sequence">
                  DTMF Sequence (max 9 chars)
                </Label>
                <Input
                  id="preset-sequence"
                  value={preset.sequence}
                  onChange={handleSequenceChange}
                  maxLength={9}
                  status={sequenceError ? "error" : undefined}
                />
                {sequenceError ? (
                  <Text className={styles.error}>{sequenceError}</Text>
                ) : (
                  <Text className={styles.helpText}>
                    Valid characters: 0-9, *, #, A-D
                  </Text>
                )}
              </div>

              <div className={styles.field}>
                <Label htmlFor="preset-length">Length</Label>
                <Input
                  id="preset-length"
                  value={preset.length.toString()}
                  disabled
                />
                <Text className={styles.helpText}>
                  Length is automatically calculated from sequence
                </Text>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              onClick={onSave}
              disabled={!isValid}
            >
              Save
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

export default EditDTMFPresetDialog
