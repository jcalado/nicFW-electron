import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Dropdown,
  Input,
  Label,
  Option,
  makeStyles
} from '@fluentui/react-components'
import React from 'react'
import { ScanPreset } from '../../../main/types'

const useStyles = makeStyles({
  content: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '10px'
  },
  rowContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
    justifyContent: 'space-between'
  },
  fieldContainer: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '10px',
    width: '48%'
  }
})

interface EditScanPresetDialogProps {
  preset: ScanPreset | null
  onSave: () => Promise<void>
  onCancel: () => void
  onPresetChange: (preset: ScanPreset) => void
}

function EditScanPresetDialog({ preset, onSave, onCancel, onPresetChange }: EditScanPresetDialogProps) {
  const styles = useStyles()

  if (!preset) return null

  return (
    <Dialog open={!!preset} onOpenChange={() => onCancel()}>
      <DialogSurface>
        <form>
          <DialogBody>
            <DialogTitle>
              Edit Scan Preset {preset?.presetNumber}
            </DialogTitle>
            <DialogContent className={styles.content}>
              <Label>Label</Label>
              <Input
                value={preset?.label || ''}
                onChange={(e) => onPresetChange({ ...preset, label: e.target.value.substring(0, 8) })}
                maxLength={8}
              />

              <div className={styles.rowContainer}>
                <div className={styles.fieldContainer}>
                  <Label>Start Frequency (MHz)</Label>
                  <Input
                    type="number"
                    value={preset?.startFreq || 0}
                    onChange={(e) => onPresetChange({
                      ...preset,
                      startFreq: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                <div className={styles.fieldContainer}>
                  <Label>Range (MHz)</Label>
                  <Input
                    type="number"
                    value={preset?.range || 0}
                    onChange={(e) => onPresetChange({
                      ...preset,
                      range: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>

              <div className={styles.rowContainer}>
                <div className={styles.fieldContainer}>
                  <Label>Step (MHz)</Label>
                  <Input
                    type="number"
                    value={preset?.step || 0}
                    onChange={(e) => onPresetChange({
                      ...preset,
                      step: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                <div className={styles.fieldContainer}>
                  <Label>Modulation</Label>
                  <Dropdown
                    value={preset?.modulation || 'FM'}
                    onOptionSelect={(_, data) => onPresetChange({
                      ...preset,
                      modulation: data.optionValue as 'FM' | 'NFM' | 'AM' | 'USB'
                    })}
                  >
                    <Option value="FM">FM</Option>
                    <Option value="NFM">NFM</Option>
                    <Option value="AM">AM</Option>
                    <Option value="USB">USB</Option>
                  </Dropdown>
                </div>
              </div>

              <div className={styles.rowContainer}>
                <div className={styles.fieldContainer}>
                  <Label>Resume (0-255s)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    value={preset?.resume || 0}
                    onChange={(e) => onPresetChange({
                      ...preset,
                      resume: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div className={styles.fieldContainer}>
                  <Label>Persist (0-255s)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    value={preset?.persist || 0}
                    onChange={(e) => onPresetChange({
                      ...preset,
                      persist: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </div>

              <div className={styles.rowContainer}>
                <div className={styles.fieldContainer}>
                  <Label>Ultrascan (0-63)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={63}
                    value={preset?.ultrascan || 0}
                    onChange={(e) => onPresetChange({
                      ...preset,
                      ultrascan: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => onSave()}>Save</Button>
              <Button onClick={onCancel}>Cancel</Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  )
}

export default EditScanPresetDialog
