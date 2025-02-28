import { Dropdown, InfoLabel, Input, Option, Switch, tokens } from '@fluentui/react-components'
import { BattOptions, RadioSettings, SBarOptions } from '@renderer/types/radioSettings'

interface DisplayTabProps {
  settings: RadioSettings
  onChange: (setting: string, value: any) => void
}

export const DisplayTab = ({ settings, onChange }: DisplayTabProps) => (
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
      <InfoLabel info={<></>}>LCD Brightness</InfoLabel>
      <Input type="number" min={0} max={28} value={settings?.lcdBrightness} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel
        info={
          <>
            How long, in seconds, the display remains on after no keypad activity and no signal
            breaks squelch.
          </>
        }
      >
        LCD Timeout
      </InfoLabel>
      <Input
        type="number"
        min={0}
        max={250}
        value={settings?.lcdTimeout}
        onChange={(ev) => onChange('lcdTimeout', ev.currentTarget.value)}
      />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<>Adjust gamma value of the display</>}>LCD Gamma</InfoLabel>
      <Input type="number" value={settings?.gamma} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel
        info={
          <>
            How bright the display will be after no input is received by the radio and no signal
            opens squelch for the given LCD Timeout
          </>
        }
      >
        Dim Brightness
      </InfoLabel>
      <Input type="number" min={0} max={28} value={settings?.dimmer} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<></>}>Inverted LCD</InfoLabel>
      <Switch
        checked={settings?.lcdInverted === 1}
        onChange={(ev) => onChange('lcdInverted', ev.currentTarget.checked ? 1 : 0)}
      />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<>Dual, Single, Hybrid</>}>S-Bar style</InfoLabel>
      <Dropdown
        value={Object.keys(SBarOptions).find((key) => SBarOptions[key] === settings?.sBarStyle)}
        selectedOptions={[settings?.sBarStyle?.toString()]}
      >
        {Object.keys(SBarOptions).map((mode, index) => (
          <Option key={mode} value={index.toString()}>
            {mode}
          </Option>
        ))}
      </Dropdown>
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<>Show the S-bar at all times</>}>S-bar always on</InfoLabel>
      <Switch
        checked={settings?.sBarAlwaysOn === 1}
        onChange={(ev) => onChange('sBarAlwaysOn', ev.currentTarget.checked ? 1 : 0)}
      />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<>Set the type of battery indicator</>}>Battery indicator</InfoLabel>
      <Dropdown
        value={Object.keys(BattOptions).find((key) => BattOptions[key] === settings?.battStyle)}
        selectedOptions={[settings?.battStyle?.toString()]}
      >
        {Object.keys(BattOptions).map((mode, index) => (
          <Option key={mode} value={index.toString()}>
            {mode}
          </Option>
        ))}
      </Dropdown>
    </div>
  </div>
)
