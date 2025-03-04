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
  Switch,
  makeStyles
} from '@fluentui/react-components'
import { Band } from '../../../main/types'

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
  },
  switchContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
})

interface EditBandDialogProps {
  band: Band | null
  onSave: () => Promise<void>
  onCancel: () => void
  onBandChange: (band: Band) => void
}

function EditBandDialog({ band, onSave, onCancel, onBandChange }: EditBandDialogProps) {
  const styles = useStyles()

  if (!band) return null

  const bandwidthOptions = [
    'Ignore',
    'Wide',
    'Narrow',
    'Enforce Wide',
    'Enforce Narrow',
    'FM Tuner'
  ]

  const modulationOptions = [
    'Ignore',
    'FM',
    'AM',
    'USB',
    'Enforce FM',
    'Enforce AM',
    'Enforce USB',
    'Enforce None'
  ]

  return (
    <Dialog open={!!band} onOpenChange={() => onCancel()}>
      <DialogSurface>
        <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
          <DialogBody>
            <DialogTitle>Edit Band {band.bandNumber}</DialogTitle>
            <DialogContent className={styles.content}>
              <div className={styles.rowContainer}>
                <div className={styles.fieldContainer}>
                  <Label>Start Frequency (MHz)</Label>
                  <Input
                    type="number"
                    value={band.start || 0}
                    onChange={(e) => onBandChange({
                      ...band,
                      start: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                <div className={styles.fieldContainer}>
                  <Label>End Frequency (MHz)</Label>
                  <Input
                    type="number"
                    value={band.end || 0}
                    onChange={(e) => onBandChange({
                      ...band,
                      end: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>

              <div className={styles.rowContainer}>
                <div className={styles.fieldContainer}>
                  <Label>Max Power</Label>
                  <Input
                    value={band.maxPower || 'Auto'}
                    onChange={(e) => onBandChange({
                      ...band,
                      maxPower: e.target.value
                    })}
                  />
                </div>
                <div className={styles.fieldContainer}>
                  <div className={styles.switchContainer}>
                    <Label>TX Allowed</Label>
                    <Switch
                      checked={band.txAllowed || false}
                      onChange={(_, data) => onBandChange({
                        ...band,
                        txAllowed: data.checked
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.rowContainer}>
                <div className={styles.fieldContainer}>
                  <div className={styles.switchContainer}>
                    <Label>Wrap Around</Label>
                    <Switch
                      checked={band.wrap || false}
                      onChange={(_, data) => onBandChange({
                        ...band,
                        wrap: data.checked
                      })}
                    />
                  </div>
                </div>
                <div className={styles.fieldContainer}>
                </div>
              </div>

              <div className={styles.rowContainer}>
                <div className={styles.fieldContainer}>
                  <Label>Modulation</Label>
                  <Dropdown
                    value={band.modulation || 'Ignore'}
                    onOptionSelect={(_, data) => onBandChange({
                      ...band,
                      modulation: data.optionValue as string
                    })}
                  >
                    {modulationOptions.map((option) => (
                      <Option key={option} value={option}>{option}</Option>
                    ))}
                  </Dropdown>
                </div>
                <div className={styles.fieldContainer}>
                  <Label>Bandwidth</Label>
                  <Dropdown
                    value={band.bandwidth || 'Ignore'}
                    onOptionSelect={(_, data) => onBandChange({
                      ...band,
                      bandwidth: data.optionValue as string
                    })}
                  >
                    {bandwidthOptions.map((option) => (
                      <Option key={option} value={option}>{option}</Option>
                    ))}
                  </Dropdown>
                </div>
              </div>
            </DialogContent>
                        <DialogActions>
                          <Button onClick={onSave}>Save</Button>
                          <Button onClick={onCancel}>Cancel</Button>
                        </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  )
}

export default EditBandDialog
