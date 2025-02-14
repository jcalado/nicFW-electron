import { Dropdown, InfoLabel, Input, Option } from '@fluentui/react-components'
import { tokens } from '@fluentui/react-components'
import { ASLOptions } from '@renderer/types/radioSettings'
import { Switch } from '@fluentui/react-components'

export const ScanTab = ({ settings, onChange }) => {
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
        <InfoLabel info={<></>}>Squelch</InfoLabel>
        <Input
          type="number"
          min={0}
          max={9}
          defaultValue="2"
          value={settings?.squelch}
          onChange={(ev) => onChange('squelch', ev.currentTarget.value)}
        />
      </div>
      <div className="flex flex-col gap-4">
        <InfoLabel info={<></>}>Scan Range</InfoLabel>
        <Input type="number" value={settings?.scanRange} onChange={(ev) => onChange('scanRange', ev.currentTarget.value)}/>
      </div>
      <div className="flex flex-col gap-4">
        <InfoLabel
          info={
            <>
              Hold time (in seconds) during a scan after a signal is lost before resuming the scan.
            </>
          }
        >
          Scan Persist
        </InfoLabel>
        <Input
          type="number"
          min={0}
          max={20}
          step={0.1}
          value={settings?.scanPersist}
          onChange={(ev) => onChange('scanPersist', ev.currentTarget.value)}
        />
      </div>
      <div className="flex flex-col gap-4">
        <InfoLabel
          info={
            <>
              0 is off. Hold time (in seconds) that a scan will stay stopped on an active signal
              before resuming to scan even if the signal is not lost first.
            </>
          }
        >
          Scan Resume
        </InfoLabel>
        <Input
          type="number"
          min={0}
          max={250}
          value={settings?.scanResume}
          onChange={(ev) => onChange('scanResume', ev.currentTarget.value)}
        />
      </div>
      <div className="flex flex-col gap-4">
        <InfoLabel
          info={
            <>
              A lower value will match more signals that do not qualify, thus slowing it down, a
              higher value will match less thus speeding it up, but at the cost of potentially
              missing some.
            </>
          }
        >
          Ultrascan
        </InfoLabel>
        <Input
          type="number"
          min={0}
          max={20}
          value={settings?.ultraScan}
          onChange={(ev) => onChange('ultraScan', ev.currentTarget.value)}
        />
      </div>
      <div className="flex flex-col gap-4">
        <InfoLabel
          info={
            <>How much to refresh the screen when scanning. Larger values equal slower scans.</>
          }
        >
          Scan Update
        </InfoLabel>
        <Input
          type="number"
          min={0}
          max={50}
          value={settings?.scanUpdate}
          onChange={(ev) => onChange('scanUpdate', ev.currentTarget.value)}
        />
      </div>
      <div className="flex flex-col gap-4">
        <InfoLabel info={<></>}>AllStarLink</InfoLabel>
        <Dropdown
          value={Object.keys(ASLOptions).find((key) => ASLOptions[key] === settings?.asl)}
          selectedOptions={[settings?.asl?.toString()]}
          onOptionSelect={(ev, data) => onChange('asl', data.selectedOptions[0])}
        >
          {Object.keys(ASLOptions).map((mode, index) => (
            <Option key={mode} value={index.toString()}>
              {mode}
            </Option>
          ))}
        </Dropdown>
      </div>
      <div className="flex flex-col gap-4">
        <InfoLabel info={<></>}>FM Radio Tuner</InfoLabel>
        <Switch
          checked={!settings?.disableFmt}
          onChange={(ev) => onChange('disableFmt', ev.currentTarget.checked ? 0 : 1)}
        />
      </div>
      <div className="flex flex-col gap-4">
        <InfoLabel info={<>Default: 47</>}>Squelch Noise Level</InfoLabel>
        <Input
          type="number"
          min={45}
          max={100}
          value={settings?.sqNoiseLev}
          onChange={(ev) => onChange('sqNoiseLev', ev.currentTarget.value)}
        />
      </div>
    </div>
  )
}
