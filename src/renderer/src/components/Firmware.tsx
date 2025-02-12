import {
  Button,
  ProgressBar,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Toolbar,
  ToolbarButton
} from '@fluentui/react-components'
import { ArrowDownloadRegular, UsbPlugRegular } from '@fluentui/react-icons'
import { makeStyles, typographyStyles } from '@fluentui/react-components'
import { useEffect, useState } from 'react'

const useStyles = makeStyles({
  header: typographyStyles.title2,
  subheader: {
    ...typographyStyles.subtitle2,
    marginTop: '0px'
  },
  archiveHeader: {
    ...typographyStyles.subtitle2,
    marginTop: '40px'
  }
})

function Firmware({ isConnected }) {
  const [version, setVersion] = useState({ version: '', releaseType: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [releaseType, setReleaseType] = useState('')
  const [archive, setArchive] = useState([{ file: '', created: '' }])
  const [selectedFirmware, setSelectedFirmware] = useState('')
  const [progress, setProgress] = useState(0)
  const [isFlashing, setIsFlashing] = useState(false)

  const downloadLatest = async () => {
    const { version, firmwareLink, releaseType } = await window.api.getLatestFirmware()
    console.log(version)
  }

  const flashFirmware = async () => {
    console.log('Flashing firmware')
    // First open a confirmation dialog

  }

  useEffect(() => {
    console.log('Fetching latest version')
    window.api.getLatestVersion().then(({ version, releaseType }) => {
      console.log(version)
      console.log(releaseType)

      setVersion({ version, releaseType })

      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    window.api.getFirmwareArchive().then(setArchive)
  }, [])

  const styles = useStyles()

  const columns = [
    { columnKey: 'file', label: 'File' },
    { columnKey: 'created', label: 'Downloaded' },
    { columnKey: 'options', label: '' }
  ]

  const handleFlash = async (item) => {
    setSelectedFirmware(item.file)
    if (!isConnected) {
      alert('Please connect to the radio first')
      return
    }
    const result = await window.dialog.showMessageBox({
      type: 'question',
      title: 'Flash firmware',
      message: `Are you sure you want to flash ${selectedFirmware}?`,
      buttons: ['Yes', 'No']
    })
    console.log(result.response)

    if (result.response === 0) {
      setIsFlashing(true)
      setProgress(0)
      window.api.onFirmwareProgress((progress) => {
        console.log('Progress:', progress)
        setProgress(progress)
      })

      const r = await window.api.flashFirmware(selectedFirmware)
      console.log(r)
    }
  }

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
        <ToolbarButton
          vertical
          icon={<UsbPlugRegular />}
          onClick={flashFirmware}
          disabled={!isConnected }
        >
          Flash file
        </ToolbarButton>
      </Toolbar>
      {isFlashing && progress < 100  && (
        <div
          style={{
            padding: '32px 16px',
            marginTop: '20px',
            marginBottom: '20px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '8px'
          }}
        >
          <h1 className={styles.subheader}>
            {progress <= 0 ? 'Waiting for radio...' : `Flashing... ${progress}%`}
          </h1>
          <ProgressBar value={progress} max={100} thickness="large" />
          <div style={{ marginTop: '16px' }} hidden={isFlashing && progress > 0}>
            <p>Set the radio to bootloader mode:</p>
            <ol style={{ paddingLeft: '16px' }}>
              <li>Turn radio OFF</li>
              <li>Press and hold PTT (H3) or Flashlight (H8) button</li>
              <li>Turn radio ON while holding button</li>
              <li>Release button when instructed</li>
            </ol>
          </div>
        </div>
      )}
      <h1 className={styles.header}>Latest nightly version</h1>
      {isLoading ? (
        <Spinner />
      ) : (
        <h1 className={styles.subheader}>
          {version.version} ({version.releaseType})
        </h1>
      )}

      <h1 className={styles.archiveHeader}>Archive</h1>

      <Table>
        <TableHeader>
          {columns.map((column) => (
            <TableHeaderCell key={column.columnKey}>{column.label}</TableHeaderCell>
          ))}
        </TableHeader>
        <TableBody>
          {archive &&
            archive.length > 0 &&
            archive.map((item) => (
              <TableRow key={item.file}>
                <TableCell>{item.file}</TableCell>
                <TableCell>{item.created.toLocaleString()}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleFlash(item)}>
                    Flash
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
export default Firmware
