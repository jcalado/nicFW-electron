import { InfoLabel, Input, Switch, tokens } from '@fluentui/react-components'

export const DisplayTab = ({ settings }) => (
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
      <InfoLabel info={<></>}>lcdBrightness</InfoLabel>
      <Input type="number" value={settings?.lcdBrightness} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<></>}>lcdTimeout</InfoLabel>
      <Input type="number" value={settings?.lcdTimeout} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<></>}>gamma</InfoLabel>
      <Input type="number" value={settings?.gamma} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<></>}>dimmer</InfoLabel>
      <Input type="number" value={settings?.dimmer} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<></>}>lcdInverted</InfoLabel>
      <Switch checked={settings?.lcdInverted} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<></>}>sBarStyle</InfoLabel>
      <Input type="text" value={settings?.sBarStyle} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<>Show the S-bar at all times</>}>S-bar always on</InfoLabel>
      <Switch checked={settings?.sBarAlwaysOn} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<></>}>battStyle</InfoLabel>
      <Input type="text" value={settings?.battStyle} />
    </div>
  </div>
)
