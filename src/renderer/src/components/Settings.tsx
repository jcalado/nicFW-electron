import { FC, useState } from 'react'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import {
  Dropdown,
  InfoLabel,
  Input,
  makeStyles,
  Option,
  Switch,
  Tab,
  TabList,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  typographyStyles
} from '@fluentui/react-components'
import { tokens } from '@fluentui/react-components'
import { AfFilters, ASLOptions, PttOptions, RadioSettings } from '@renderer/types/radioSettings'
import { ArrowDownloadRegular, DocumentBulletListRegular, SaveRegular } from '@fluentui/react-icons'
import { DisplayTab, TxTab, DeviceTab, FreqTab, ScanTab } from './settings'

interface SettingsProps {
  settings: RadioSettings
  onSettingsRead: (connected: string) => void
  isConnected: boolean
}

const useStyles = makeStyles({
  header: {
    ...typographyStyles.title2,
    flex: 1
  },
  subheader: {
    ...typographyStyles.subtitle1,
    marginTop: '0px'
  },
  archiveHeader: {
    ...typographyStyles.subtitle2,
    marginTop: '40px'
  }
})

const Settings: FC<SettingsProps> = ({ settings, onSettingsRead, isConnected }) => {
  const styles = useStyles()
  const [selectedTab, setSelectedTab] = useState('tab2')
  const [isLoading, setIsLoading] = useState(false)

  const readSettings = async () => {
    window.api
      .readSettings()
      .then((settings) => {
        setIsLoading(true)
        onSettingsRead(settings)
      })
      .catch((error) => {
        setIsLoading(false)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleOnTabSelect = (event: React.MouseEvent<HTMLElement>, data: { value: string }) => {
    setSelectedTab(data.value)
  }

  const handleFileExport = async () => {}

  const handleFileImport = async () => {}

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
          onClick={() => readSettings()}
          disabled={!isConnected}
          vertical
          icon={<ArrowDownloadRegular />}
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


        {selectedTab === 'tab1' && <DeviceTab settings={settings} />}
        {selectedTab === 'tab2' && <FreqTab settings={settings} />}
        {selectedTab === 'tab3' && <TxTab settings={settings} />}
        {selectedTab === 'tab4' && <ScanTab settings={settings} />}
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
