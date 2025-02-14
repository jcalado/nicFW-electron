import { InfoLabel, Input, Switch } from '@fluentui/react-components'
import { tokens } from '@fluentui/react-components'



export const DeviceTab = ({ settings }) => (
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
      <InfoLabel info={<></>}>Pin</InfoLabel>
      <Input type="number" value={settings?.pin} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<></>}>Pin Action</InfoLabel>
      <Input type="text" value={settings?.pinAction} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<>Defaults to 0. 34 is similiar to stock firmware calibration.</>}>
        XTAL 671
      </InfoLabel>
      <Input type="number" min={-128} max={127} value={settings?.xtal671} defaultValue="0" />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<>Enable or disable bluetooth for use with official nicFWProgrammer.</>}>
        Bluetooh
      </InfoLabel>
      <Switch checked={settings?.bluetooth} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<>Period of time in 10ths of a second to sleep</>}>Power Save</InfoLabel>
      <Input type="number" min={0} max={20} value={settings?.powerSave} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<></>}>keyLock</InfoLabel>
      <Switch checked={settings?.keyLock} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<></>}>keyTones</InfoLabel>
      <Switch checked={settings?.keyTones} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<></>}>breathe</InfoLabel>
      <Switch checked={settings?.breathe} />
    </div>
  </div>
)
