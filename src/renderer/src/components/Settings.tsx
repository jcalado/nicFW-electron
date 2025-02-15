import { FC, useState } from 'react'
import PropTypes from 'prop-types'
import { Tab, TabList, Toolbar, ToolbarButton } from '@fluentui/react-components'
import { RadioSettings } from '@renderer/types/radioSettings'
import { ArrowDownloadRegular, SaveRegular } from '@fluentui/react-icons'
import { DisplayTab, TxTab, DeviceTab, FreqTab, ScanTab } from './settings'

interface SettingsProps {
  settings: RadioSettings | undefined
  onSettingsRead: (RadioSettings) => void
  isConnected: boolean
}

const Settings: FC<SettingsProps> = ({ settings, onSettingsRead, isConnected }) => {
  const [selectedTab, setSelectedTab] = useState('tab2')
  const [isLoading, setIsLoading] = useState(false)

  const handleSettingsChange = (key: string, value: string | number): void => {
    console.log('Settings changed', key, value)
    // Update the specific setting
    const localSettings = { ...settings }
    localSettings[key] = value
    console.log(localSettings)
    onSettingsRead(localSettings)
  }

  const readSettings = async (): Promise<void> => {
    window.api
      .readSettings()
      .then((settings) => {
        setIsLoading(true)
        onSettingsRead(settings)
      })
      .catch(() => {
        setIsLoading(false)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  /**
   * Writes the provided settings asynchronously using the window API.
   *
   * @param {RadioSettings} settings - The settings to be written.
   * @returns {Promise<void>} A promise that resolves when the settings are written successfully.
   */
  const writeSettings = async (settings: RadioSettings): Promise<void> => {
    window.api
      .writeSettings(settings)
      .then(() => {
        console.log('Settings written successfully!')
      })
      .catch((error) => {
        console.error('Error writing settings:', error)
      })
  }

  const handleOnTabSelect = (
    event: React.MouseEvent<HTMLElement>,
    data: { value: string }
  ): void => {
    setSelectedTab(data.value)
  }

  return (
    <div>
      <Toolbar>
        <ToolbarButton
          onClick={() => readSettings()}
          disabled={!isConnected}
          vertical
          appearance="primary"
          icon={<ArrowDownloadRegular />}
        >
          {isLoading ? 'Reading...' : 'Read'}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => settings && writeSettings(settings)}
          disabled={!isConnected}
          vertical
          icon={<SaveRegular />}
        >
          Write
        </ToolbarButton>
      </Toolbar>
      <div style={{ display: 'flex', flexDirection: 'row', rowGap: '20px' }}>
        <div
          style={{
            alignItems: 'flex-start',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            padding: '50px 0px',
            rowGap: '20px'
          }}
        >
          <TabList
            defaultSelectedValue="tab2"
            vertical
            appearance="transparent"
            onTabSelect={handleOnTabSelect}
          >
            <Tab value="tab1">Device</Tab>
            <Tab value="tab2">Frequency & VFO</Tab>
            <Tab value="tab3">Transmission</Tab>
            <Tab value="tab4">Scan & Tuning</Tab>
            <Tab value="tab5">Display & UI</Tab>
          </TabList>
        </div>

        {selectedTab === 'tab1' && (
          <DeviceTab settings={settings} onChange={handleSettingsChange} />
        )}
        {selectedTab === 'tab2' && <FreqTab settings={settings} onChange={handleSettingsChange} />}
        {selectedTab === 'tab3' && <TxTab settings={settings} />}
        {selectedTab === 'tab4' && <ScanTab settings={settings} onChange={handleSettingsChange} />}
        {selectedTab === 'tab5' && <DisplayTab settings={settings} />}
      </div>
    </div>
  )
}

Settings.propTypes = {
  onSettingsRead: PropTypes.func.isRequired,
  isConnected: PropTypes.bool.isRequired
}

export default Settings
