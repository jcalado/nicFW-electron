import { Dropdown, InfoLabel, Input, Option, Switch } from '@fluentui/react-components'
import { tokens } from '@fluentui/react-components'
import { AfFilters, PttOptions } from '@renderer/types/radioSettings'


export const TxTab = ({ settings }) => (
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
            The extent of how far the frequency moves from the carrier frequency. 64 is the value
            used by the stock firmware
          </>
        }
      >
        TX Deviation
      </InfoLabel>
      <Input type="number" min={0} max={50} value={settings?.txDeviation} />
    </div>

    <div className="flex flex-col gap-4">
      <InfoLabel info={<>Dual, Single, Hybrid</>}>PTT Mode</InfoLabel>
      <Dropdown
        value={Object.keys(PttOptions).find((key) => PttOptions[key] === settings?.pttMode)}
        selectedOptions={[settings?.pttMode?.toString()]}
      >
        {Object.keys(PttOptions).map((mode, index) => (
          <Option key={mode} value={index.toString()}>
            {mode}
          </Option>
        ))}
      </Dropdown>
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<>Show an audio frequency (AF) modulation meter
        below the RSSI during transmission</>}>TX Modulation Meter</InfoLabel>
      <Switch checked={settings?.txModMeter} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<>Default: 25. Microphone audio level gain</>}>Mic Gain</InfoLabel>
      <Input type="number" min={0} max={31} value={settings?.micGain} />
    </div>

    <div className="flex" style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>
      DTMF
    </div>
    <div className="flex" style={{}}></div>

    <div className="flex flex-col gap-4">
      <InfoLabel info={<></>}>DTMF Deviation</InfoLabel>
      <Input type="number" value={settings?.dtmfDev} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel
        info={
          <>
            Speed at which DTMF tones are sent when preconfigured to send multiple tones
            automatically. default 0{' '}
          </>
        }
      >
        DTMF Speed
      </InfoLabel>
      <Input type="number" value={settings?.dtmfSpeed} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<></>}>repeaterTone</InfoLabel>
      <Input type="number" value={settings?.repeaterTone} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<></>}>toneMonitor</InfoLabel>
      <Input type="number" value={settings?.toneMonitor} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<>Off, RX, TX, Both</>}>ste</InfoLabel>
      <Dropdown selectedOptions={['rx']} value={settings?.ste}>
        <Option value="off">Off</Option>
        <Option value="rx">RX</Option>
        <Option value="tx">TX</Option>
        <Option value="both">Both</Option>
      </Dropdown>
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<></>}>rfGain</InfoLabel>
      <Input type="number" value={settings?.rfGain} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<>0 is disabled, 1-15 mic sensitivity.</>}>vox</InfoLabel>
      <Input type="number" min={0} max={15} value={settings?.vox} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<></>}>voxTail</InfoLabel>
      <Input type="number" value={settings?.voxTail} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<>How long, in seconds, until the transmitter shuts off.</>}>
        TX Timeout
      </InfoLabel>
      <Input type="number" value={settings?.txTimeout} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<></>}>noiseGate</InfoLabel>
      <Input type="number" value={settings?.noiseGate} />
    </div>
    <div className="flex flex-col gap-4">
      <InfoLabel info={<></>}>Audio Frequency Filters</InfoLabel>

      <Dropdown
        value={Object.keys(AfFilters).find((key) => AfFilters[key] === settings?.afFilters)}
      >
        {Object.keys(AfFilters).map((filterName, index) => (
          <Option key={filterName} value={index}>
            {filterName}
          </Option>
        ))}
      </Dropdown>
    </div>
  </div>
)
