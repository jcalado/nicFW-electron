import { Dropdown, InfoLabel, Input, Option, Switch, tokens } from '@fluentui/react-components'
import { IfOptions } from '@renderer/types/radioSettings'

export const FreqTab = ({ settings }) => (
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
            Amount the carrier frequency configured in the VFO will change, either up or down, when
            using arrows on the keypad.
          </>
        }
      >
        Step
      </InfoLabel>
      <Input type="text" value={settings?.step} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<>Frequency threshold for the RX filter between VHF and UHF.</>}>
        RX Split
      </InfoLabel>
      <Input type="text" value={settings?.rxSplit/10} />
    </div>
    <div className="flex flex-col gap-4">
    <InfoLabel info={<>Frequency threshold for the RX filter between VHF and UHF.</>}>
        TX Split
      </InfoLabel>
      <Input type="text" value={settings?.txSplit/10} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<>?</>}>IF Frequency</InfoLabel>
      <Dropdown
        value={Object.keys(IfOptions).find((key) => IfOptions[key] === settings?.ifFreq)}
        selectedOptions={[settings?.ifFreq?.toString()]}
      >
        {Object.keys(IfOptions).map((action, index) => (
          <Option key={action} value={index.toString()}>
            {action}
          </Option>
        ))}
      </Dropdown>
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel>Dual Watch</InfoLabel>
      <Switch checked={settings?.dualWatch} />
    </div>
  </div>
)
