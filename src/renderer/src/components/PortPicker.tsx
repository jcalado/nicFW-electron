import { Button, Select } from '@fluentui/react-components'
import { useEffect, useState } from 'react'

const PortPicker = ({ onPortSelect, onConnected, isConnected }) => {
  const [ports, setPorts] = useState([])
  const [selectedPort, setSelectedPort] = useState('')

  useEffect(() => {
    window.api.getSerialPorts().then(setPorts)
  }, [])

  const onChange: SelectProps['onChange'] = (event, data) => {
    setSelectedPort(data.value)
    onPortSelect(data.value)
  }

  const handleConnect = () => {
    if (selectedPort) {
      window.api.connectPort(selectedPort).then(() => {
        console.log('Connected to port:', selectedPort)

        onConnected(selectedPort)
      })
    } else {
      alert('Please select a port first.')
    }
  }

  const handleDisconnect = () => {
    if (selectedPort) {
      window.api.disconnectPort(selectedPort).then(() => {
        console.log('Disconnected from port:', selectedPort)
        setSelectedPort('')
        onConnected('')
      })
    } else {
      alert('Please select a port first.')
    }
  }

  const handleRefresh = () => {
    window.api.getSerialPorts().then(setPorts)
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-row gap-4 p-4">
        <Select onChange={onChange} className="w-28">
          <option>Select port</option>
          {ports.map((port) => (
            <option key={port.path} value={port.path}>
              {port.path} ({port.manufacturer || 'Unknown'})
            </option>
          ))}
        </Select>
        <Button disabled={isConnected} onClick={handleRefresh}>
          Refresh
        </Button>
      </div>
      <Button disabled={isConnected} onClick={handleConnect}>
        Connect
      </Button>
      <Button disabled={!isConnected} onClick={handleDisconnect}>
        Disconnect
      </Button>
    </div>
  )
}

export default PortPicker
