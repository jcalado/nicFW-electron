import { FC } from 'react'
import { Button, ProgressBar, Select, SelectProps } from '@fluentui/react-components'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { SerialPort } from 'serialport'
import {
  ArrowSyncRegular,
  PlugConnectedRegular,
  PlugDisconnectedRegular
} from '@fluentui/react-icons'
import { makeStyles, typographyStyles } from '@fluentui/react-components'

interface PortPickerProps {
  onPortSelect: (port: string) => void
  onConnected: (connected: string) => void
  isConnected: boolean
  port: string
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

const PortPicker: FC<PortPickerProps> = ({ onPortSelect, onConnected, isConnected, port }) => {
  const [ports, setPorts] = useState<SerialPort[]>([])
  const [knownPorts, setKnownPorts] = useState<string[]>([])
  const [newPorts, setNewPorts] = useState<string[]>([])
  const [selectedPort, setSelectedPort] = useState('')
  const [progress, setProgress] = useState(0)

  const styles = useStyles()

  useEffect(() => {
    handleRefresh()
  }, [])

  const onChange: SelectProps['onChange'] = (_event, data) => {
    setSelectedPort(data.value)
    onPortSelect(data.value)
  }

  const handleConnect = (): void => {
    if (selectedPort) {
      window.api.connectPort(selectedPort).then(() => {
        console.log('Connected to port:', selectedPort)
        onConnected(selectedPort)
      })
    } else {
      alert('Please select a port first.')
    }
  }

  const handleDisconnect = (): void => {
    try {
      window.api.disconnectPort(port).then(() => {
        console.log('Disconnected from port:', port)
        onConnected('')
      })
    } catch (error) {
      console.log(error)
      alert('Please select a port first.')
    }
  }

  const handleRefresh = (): void => {
    window.api.getSerialPorts().then((fetchedPorts) => {
      // Get paths from fetched ports
      const portPaths = fetchedPorts.map((p) => p.path)

      // Find new ports (those in portPaths but not in knownPorts)
      const justDiscovered = portPaths.filter((path) => !knownPorts.includes(path))

      // Update state
      setPorts(fetchedPorts)
      setNewPorts(justDiscovered)
      setKnownPorts(portPaths)
    })
  }

  // Sort ports: new ports first, then alphabetically
  const sortedPorts = [...ports].sort((a, b) => {
    const aIsNew = newPorts.includes(a.path)
    const bIsNew = newPorts.includes(b.path)

    if (aIsNew && !bIsNew) return -1
    if (!aIsNew && bIsNew) return 1
    return a.path.localeCompare(b.path)
  })

  useEffect(() => {
    // Listen for progress updates from the main process
    window.api.onProgress((progress) => {
      console.log('Progress:', progress)
      setProgress(progress)
    })
  }, [isConnected])

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20%'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h1 className={styles.subheader}>Select port</h1>
        <div className="flex flex-row gap-4 p-4">
          <Select onChange={onChange} className="w-28">
            <option value="">None</option>
            {sortedPorts.map((port) => (
              <option key={port.path} value={port.path}>
                {port.path}
              </option>
            ))}
          </Select>
          <Button disabled={isConnected} onClick={handleRefresh} icon={<ArrowSyncRegular />}>
            Refresh
          </Button>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '4px',
            justifyContent: 'space-evenly'
          }}
        >
          <Button
            disabled={isConnected}
            onClick={handleConnect}
            icon={<PlugConnectedRegular />}
            style={{ flex: 1 }}
          >
            Connect
          </Button>
          <Button
            disabled={!isConnected}
            onClick={handleDisconnect}
            icon={<PlugDisconnectedRegular />}
            style={{ flex: 1 }}
          >
            Disconnect
          </Button>
        </div>
        <ProgressBar max={100} value={progress} />
      </div>
    </div>
  )
}

PortPicker.propTypes = {
  onPortSelect: PropTypes.func.isRequired,
  onConnected: PropTypes.func.isRequired,
  isConnected: PropTypes.bool.isRequired,
  port: PropTypes.string.isRequired
}

export default PortPicker
