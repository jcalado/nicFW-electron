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
import { tokens } from '@fluentui/react-components'
import { useEffect, useState } from 'react'

const useStyles = makeStyles({
  header: {
    ...typographyStyles.title2,
    marginTop: '20px'
  },
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

    // Check if connected to radio
    if (!isConnected) {
      alert('Please connect to the radio first')
      return
    }

    // Show file picker dialog for .bin file
    const filePath = await window.api.openFileDialog('bin')
    console.log(filePath);
    // throw new Error('Not implemented')
    handleFlash(filePath)
  }

  useEffect(() => {
    console.log('Fetching latest version')
    window.api.getLatestVersion().then(({ version, releaseType }) => {
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
    setSelectedFirmware(item)
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

    if (result.response === 0) {
      setIsFlashing(true)
      setProgress(0)
      window.api.onProgress((progress) => {
        setProgress(progress)
      })

      await window.api.flashFirmware(selectedFirmware)
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
          disabled={!isConnected}
        >
          Flash file
        </ToolbarButton>
      </Toolbar>
      {isFlashing && progress < 100 && (
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

      <div
        role="tabpanel"
        aria-labelledby="Conditions"
        style={{
          marginRight: '10px',
          marginTop: '20px',
          boxShadow: tokens.shadow16,
          flex: 1,
          borderRadius: tokens.borderRadiusXLarge,
          backgroundColor: tokens.colorNeutralCardBackground,
          padding: tokens.spacingHorizontalXXL
        }}
      >
        <Table>
          <TableHeader>
            {columns.map((column) => (
              <TableHeaderCell key={column.columnKey}>{column.label}</TableHeaderCell>
            ))}
          </TableHeader>
          <TableBody>
            {archive &&
              archive.length > 0 &&
              archive
                .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
                .map((item) => (
                  <TableRow key={item.file}>
                    <TableCell>{extractVersionFromFile(item.file)}</TableCell>
                    <TableCell>{new Date(item.created).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleFlash(item.file)}>
                        Flash
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
const extractVersionFromFile = (fileName: string): string => {
  const match = fileName.match(/v\d+_(\d+\.\d+\.\d+)\.bin/)
  return match ? match[1] : fileName
}

export default Firmware
