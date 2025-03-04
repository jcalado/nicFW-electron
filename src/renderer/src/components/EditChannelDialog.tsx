import {
  Button,
  Combobox,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Dropdown,
  Input,
  Label,
  makeStyles,
  Option,
  OptionGroup,
  Switch
} from '@fluentui/react-components'
import React from 'react'
import { Channel } from '../../../main/types'

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

interface EditChannelDialogProps {
  channel: Channel | null
  onSave: () => Promise<void>
  onCancel: () => void
  onChannelChange: (channel: Channel) => void
}

function EditChannelDialog({ channel, onSave, onCancel, onChannelChange }: EditChannelDialogProps) {
  const styles = useStyles()

  if (!channel) return null

  return (
    <Dialog open={!!channel} onOpenChange={() => onCancel()}>
      <DialogSurface>
        <form>
          <DialogBody>
            <DialogTitle>
              Edit channel {channel?.channelNumber} - {channel?.name}
            </DialogTitle>
            <DialogContent className={styles.content}>
              <Label>Name</Label>
              <Input
                value={channel?.name || ''}
                onChange={(e) => onChannelChange({ ...channel, name: e.target.value })}
              />

              <div className={styles.rowContainer}>
                <div className={styles.fieldContainer}>
                  <Label>RX Frequency</Label>
                  <Input
                    value={channel?.rxFreq || ''}
                    onChange={(e) => onChannelChange({ ...channel, rxFreq: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className={styles.fieldContainer}>
                  <Label>TX Frequency</Label>
                  <Input
                    value={channel?.txFreq || ''}
                    onChange={(e) => onChannelChange({ ...channel, txFreq: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className={styles.rowContainer}>
                <div className={styles.fieldContainer}>
                  <Label>RX Tone</Label>
                  <Input
                    value={channel?.rxSubTone || ''}
                    onChange={(e) => onChannelChange({ ...channel, rxSubTone: e.target.value })}
                  />
                </div>
                <div className={styles.fieldContainer}>
                  <Label>TX Tone</Label>
                  <Input
                    value={channel?.txSubTone || ''}
                    onChange={(e) => onChannelChange({ ...channel, txSubTone: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.rowContainer}>
                <div className={styles.fieldContainer}>
                  <Label>TX Power</Label>
                  <Input
                    type="number"
                    value={channel?.txPower || 0}
                    onChange={(e) => onChannelChange({
                      ...channel,
                      txPower: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div className={styles.fieldContainer}>
                  <Label>Bandwidth</Label>
                  <Dropdown
                    value={channel?.bits?.bandwidth || 'Narrow'}
                    onOptionSelect={(_, data) => onChannelChange({
                      ...channel,
                      bits: {
                        ...channel.bits,
                        bandwidth: data.optionValue as 'Wide' | 'Narrow'
                      }
                    })}
                  >
                    <Option value="Narrow">Narrow</Option>
                    <Option value="Wide">Wide</Option>
                  </Dropdown>
                </div>
              </div>

              <div className={styles.rowContainer}>
                <div className={styles.fieldContainer}>
                  <Label>Modulation</Label>
                  <Dropdown
                    value={channel?.bits?.modulation || 'FM'}
                    onOptionSelect={(_, data) => onChannelChange({
                      ...channel,
                      bits: {
                        ...channel.bits,
                        modulation: data.optionValue as 'FM' | 'NFM' | 'AM' | 'USB' | 'Unknown'
                      }
                    })}
                  >
                    <Option value="FM">FM</Option>
                    <Option value="NFM">NFM</Option>
                    <Option value="AM">AM</Option>
                    <Option value="USB">USB</Option>
                    <Option value="Unknown">Unknown</Option>
                  </Dropdown>
                </div>
                <div className={styles.fieldContainer}>
                  <Label>PTT ID</Label>
                  <Dropdown
                    value={channel?.bits?.pttID || 'Off'}
                    onOptionSelect={(_, data) => onChannelChange({
                      ...channel,
                      bits: {
                        ...channel.bits,
                        pttID: data.optionValue as 'Off' | 'BoT' | 'EoT' | 'Both'
                      }
                    })}
                  >
                    <Option value="Off">Off</Option>
                    <Option value="BoT">Beginning of Transmission</Option>
                    <Option value="EoT">End of Transmission</Option>
                    <Option value="Both">Both</Option>
                  </Dropdown>
                </div>
              </div>

              <div className={styles.rowContainer}>
                <div className={styles.fieldContainer}>
                  <div className={styles.switchContainer}>
                    <Label>Busy Lock</Label>
                    <Switch
                      checked={channel?.bits?.busyLock || false}
                      onChange={(_, data) => onChannelChange({
                        ...channel,
                        bits: {
                          ...channel.bits,
                          busyLock: data.checked
                        }
                      })}
                    />
                  </div>
                </div>
                <div className={styles.fieldContainer}>
                  <div className={styles.switchContainer}>
                    <Label>Reversed</Label>
                    <Switch
                      checked={channel?.bits?.reversed || false}
                      onChange={(_, data) => onChannelChange({
                        ...channel,
                        bits: {
                          ...channel.bits,
                          reversed: data.checked
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <Label>Groups</Label>
              <Combobox
                multiselect
                value={
                  Object.values(channel.groups || {})
                    .filter(groupNumber => groupNumber !== 0)
                    .map(groupNumber => String.fromCharCode(64 + Number(groupNumber)))
                    .join(', ')
                }
                selectedOptions={
                  Object.values(channel.groups || {})
                    .filter(groupNumber => groupNumber !== 0)
                    .map(groupNumber => String.fromCharCode(64 + Number(groupNumber)))
                }
                onOptionSelect={(_, data) => {
                  // Convert selected letters back to group numbers
                  const selectedGroups = {};
                  data.selectedOptions.forEach((letter, index) => {
                    selectedGroups[`g${index}`] = letter.charCodeAt(0) - 64; // 'A'=1, 'B'=2, etc.
                  });
                  // Fill remaining slots with 0
                  for (let i = data.selectedOptions.length; i < 8; i++) {
                    selectedGroups[`g${i}`] = 0;
                  }
                  onChannelChange({ ...channel, groups: selectedGroups });
                }}
              >
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'].map((group) => (
                  <Option key={group} text={group}>{group}</Option>
                ))}
              </Combobox>
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

export default EditChannelDialog
