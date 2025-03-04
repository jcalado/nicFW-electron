import { Dropdown, Option, InfoLabel, Input, Switch } from '@fluentui/react-components'
import { tokens } from '@fluentui/react-components'
import { KeytoneOptions, PinActions } from '../../../../main/types/radioSettings'

export const DeviceTab = ({ settings, onChange }) => {
  return (
    <div
      role="tabpanel"
      aria-labelledby="Conditions"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        columnGap: '20px',
        rowGap: '20px',
        marginRight: '10px',
        marginTop: '20px',
        boxShadow: tokens.shadow16,
        flex: 1,
        borderRadius: tokens.borderRadiusXLarge,
        backgroundColor: tokens.colorNeutralCardBackground,
        padding: tokens.spacingHorizontalXXL
      }}
    >
      <div className="flex flex-col gap-4">
        <InfoLabel info={<></>}>PIN</InfoLabel>
        <Input
          type="number"
          value={settings?.pin}
          onChange={(ev) => onChange('pin', ev.currentTarget.value)}
        />
      </div>
      <div className="flex flex-col gap-4">
        <InfoLabel info={<>Require the PIN set on the previous field</>}>PIN Action</InfoLabel>
        <Dropdown
          value={Object.keys(PinActions).find((key) => PinActions[key] === settings?.pinAction)}
          selectedOptions={[settings?.pinAction?.toString()]}
          onOptionSelect={(ev, data) => onChange('pinAction', data.selectedOptions[0])}
        >
          {Object.keys(PinActions).map((action, index) => (
            <Option key={action} value={index.toString()}>
              {action}
            </Option>
          ))}
        </Dropdown>
      </div>
      <div className="flex flex-col gap-4">
        <InfoLabel info={<>Defaults to 0. 34 is similiar to stock firmware calibration.</>}>
          XTAL 671
        </InfoLabel>
        <Input
          type="number"
          min={-128}
          max={127}
          value={settings?.xtal671}
          onChange={(ev) => onChange('xtal671', ev.currentTarget.value)}
        />
      </div>
      <div className="flex flex-col gap-4">
        <InfoLabel info={<>Period of time in 10ths of a second to sleep</>}>Power Save</InfoLabel>
        <Input
          type="number"
          min={0}
          max={20}
          value={settings?.powerSave}
          onChange={(ev) => onChange('powerSave', ev.currentTarget.value)}
        />
      </div>
      {/* <div className="flex flex-col gap-4">
        <InfoLabel info={<></>}>Keypad Lock</InfoLabel>
        <Switch checked={settings?.keyLock} />
      </div> */}
      <div className="flex flex-col gap-4">
        <InfoLabel info={<>Require the PIN set on the previous field</>}>Key Tones</InfoLabel>
        <Dropdown
          value={Object.keys(KeytoneOptions).find(
            (key) => KeytoneOptions[key] === settings?.keyTones
          )}
          selectedOptions={[settings?.keyTones?.toString()]}
          onOptionSelect={(ev, data) => onChange('keyTones', data.selectedOptions[0])}
        >
          {Object.keys(KeytoneOptions).map((action, index) => (
            <Option key={action} value={index.toString()}>
              {action}
            </Option>
          ))}
        </Dropdown>
      </div>
      <div className="flex flex-col gap-4">
        <InfoLabel info={<>How frequent, in seconds, to blink the keypad backlight</>}>
          Heartbeat
        </InfoLabel>
        <Input
          type="number"
          min={0}
          max={30}
          value={settings?.breathe}
          onChange={(ev) => onChange('breathe', ev.currentTarget.value)}
        />
      </div>
      <div className="flex flex-col gap-4">
        <InfoLabel info={<>Enable or disable bluetooth for use with official nicFWProgrammer.</>}>
          Bluetooh
        </InfoLabel>
        <Switch
          checked={settings?.bluetooth}
          onChange={(ev) => onChange('bluetooth', ev.currentTarget.checked ? 1 : 0)}
        />
      </div>
    </div>
  )
}
