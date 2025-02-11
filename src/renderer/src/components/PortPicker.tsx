import { FC } from 'react'
import { Button, Select, SelectProps } from '@fluentui/react-components'
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

const PortPicker: FC<PortPickerProps> = ({ onPortSelect, onConnected, isConnected }) => {
  const [ports, setPorts] = useState<SerialPort[]>([])
  const [selectedPort, setSelectedPort] = useState('')
  const styles = useStyles()

  useEffect(() => {
    window.api.getSerialPorts().then(setPorts)
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
    if (selectedPort) {
      try {
        window.api.disconnectPort(selectedPort).then(() => {
          console.log('Disconnected from port:', selectedPort)

          onConnected('')
        })
      } catch (error) {
        console.log(error)
        alert('Please select a port first.')
      }
    }
  }

  const handleRefresh = (): void => {
    window.api.getSerialPorts().then(setPorts)
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className={styles.subheader}>Select port</h1>
      <div className="flex flex-row gap-4 p-4">
        <Select onChange={onChange} className="w-28">
          <option value="">None</option>
          {ports.map((port) => (
            <option key={port.path} value={port.path}>
              {port.path} ({port.manufacturer || 'Unknown'})
            </option>
          ))}
        </Select>
        <Button disabled={isConnected} onClick={handleRefresh} icon={<ArrowSyncRegular />}>
          Refresh
        </Button>
      </div>
      <div className="flex flex-row gap-4">
        <Button disabled={isConnected} onClick={handleConnect} icon={<PlugConnectedRegular />}>
          Connect
        </Button>
        <Button
          disabled={!isConnected}
          onClick={handleDisconnect}
          icon={<PlugDisconnectedRegular />}
        >
          Disconnect
        </Button>
      </div>
    </div>
  )
}

PortPicker.propTypes = {
  onPortSelect: PropTypes.func.isRequired,
  onConnected: PropTypes.func.isRequired,
  isConnected: PropTypes.bool.isRequired
}

export default PortPicker
