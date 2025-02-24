import { Dropdown, InfoLabel, Input, Option, Switch, tokens } from '@fluentui/react-components'
import { IfOptions } from '@renderer/types/radioSettings'
import React from 'react'

export const FreqTab = ({ settings, onChange }) => {
  const handleDualWatchChange = (event) => {
    console.log(event.currentTarget.checked)
    onChange('dualWatch', event.currentTarget.checked ? 1 : 0) // Update the parent state
  }

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
        <InfoLabel
          info={
            <>
              Amount the carrier frequency configured in the VFO will change, either up or down,
              when using arrows on the keypad.
            </>
          }
        >
          Step
        </InfoLabel>
        <Input
          type="text"
          value={settings?.step / 100}
          onChange={(ev) => onChange('step', ev.currentTarget.value * 100)}
        />
      </div>
      <div className="flex flex-col gap-4">
        <InfoLabel info={<>Default: 280. Frequency threshold for the RX filter between VHF and UHF.</>}>
          RX Split
        </InfoLabel>
        <Input
          type="text"
          value={settings?.rxSplit / 10}
          onChange={(ev) => onChange('rxSplit', ev.currentTarget.value * 10)}
        />
      </div>
      <div className="flex flex-col gap-4">
        <InfoLabel info={<>Default: 280. Frequency threshold for the RX filter between VHF and UHF.</>}>
          TX Split
        </InfoLabel>
        <Input
          type="text"
          value={settings?.txSplit / 10}
          onChange={(ev) => onChange('txSplit', ev.currentTarget.value * 10)}
        />
      </div>
      <div className="flex flex-col gap-4">
        <InfoLabel
          info={
            <>
              Default: 8.46. Change frequency Q factor - increased or decreased bandwidth depending
              on lowering or raising the Q value
            </>
          }
        >
          IF Frequency
        </InfoLabel>
        <Dropdown
          value={Object.keys(IfOptions).find((key) => IfOptions[key] === settings?.ifFreq)}
          selectedOptions={[settings?.ifFreq?.toString()]}
          onOptionSelect={(ev, data) => onChange('ifFreq', data.selectedOptions[0])}
        >
          {Object.keys(IfOptions).map((action, index) => (
            <Option key={action} value={index}>
              {action}
            </Option>
          ))}
        </Dropdown>
      </div>
      <div className="flex flex-col gap-4">
        <InfoLabel>Dual Watch</InfoLabel>
        <Switch
          checked={settings?.dualWatch}
          onChange={(ev) => onChange('dualWatch', ev.currentTarget.checked ? 1 : 0)}
        />
      </div>
    </div>
  )
}
