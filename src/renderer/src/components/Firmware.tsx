import {
  Button,
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
    ...typographyStyles.subtitle1,
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
  const [archive, setArchive] = useState([''])
  const [selectedFirmware, setSelectedFirmware] = useState('')

  const downloadLatest = async () => {
    const { version, firmwareLink, releaseType } = await window.api.getLatestFirmware()
    console.log(version)
  }

  const flashFirmware = async () => {
    console.log('Flashing firmware')
    // First open a confirmation dialog
    const result = await window.dialog.showMessageBox({
      type: 'question',
      title: 'Flash firmware',
      message: `Are you sure you want to flash ${selectedFirmware}?`,
      buttons: ['Yes', 'No']
    })
    console.log(result)
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
    { columnKey: 'created', label: 'Created At' },
    { columnKey: 'options', label: '' }
  ]

  const handleFlash = async (item) => {
    setSelectedFirmware(item)
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
          disabled={!isConnected && selectedFirmware === ''}
        >
          Flash
        </ToolbarButton>
      </Toolbar>
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
              <TableRow key={item} onClick={() => console.log('clicked')}>
                <TableCell>{item}</TableCell>
                <TableCell>{item}</TableCell>
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
