import { Toolbar, ToolbarButton } from '@fluentui/react-components'
import { ArrowDownloadRegular } from '@fluentui/react-icons'
import { makeStyles, typographyStyles } from '@fluentui/react-components'
import { useEffect, useState } from 'react'

const useStyles = makeStyles({
  header: typographyStyles.title2,
  subheader: typographyStyles.subtitle1
})

function Firmware({ isConnected }) {
  const [version, setVersion] = useState('')

  const downloadLatest = async () => {
    const result = await window.api.getLatestFirmware()
    console.log(result)
  }

  useEffect(() => {
    console.log('Fetching latest version')
    window.api.getLatestVersion().then(setVersion)
  }, [])

  const styles = useStyles()

  return (
    <div>
      <Toolbar>
        <ToolbarButton
          onClick={() => downloadLatest()}
          vertical
          appearance="primary"
          icon={<ArrowDownloadRegular />}
        >
          Download
        </ToolbarButton>
      </Toolbar>
      <h1 className={styles.header}>Latest version</h1>
      <h1 className={styles.subheader}>{version}</h1>
    </div>
  )
}
export default Firmware
