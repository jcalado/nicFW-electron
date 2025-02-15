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
  ToolbarButton,
  ToolbarDivider
} from '@fluentui/react-components'
import { ArrowDownloadRegular, DocumentRegular, DocumentSaveRegular, UsbPlugRegular } from '@fluentui/react-icons'
import { makeStyles, typographyStyles } from '@fluentui/react-components'
import { useEffect, useState } from 'react'


enum CodeplugStatus {
  IDLE,
  READING,
  WRITING,
  LOADING,
  SAVING,
  ERROR
}

function Codeplug({ isConnected }) {

  const [codeplug, setCodeplug] = useState(null)
  const [status, setStatus] = useState(CodeplugStatus.IDLE)
  const [progress, setProgress] = useState(0)

  const saveCodePlug = async () => {
    try {
      setStatus(CodeplugStatus.SAVING)
      await window.api.saveCodeplug(codeplug)
      setStatus(CodeplugStatus.IDLE)
    } catch (error) {
      console.error('Error saving codeplug:', error)
      setStatus(CodeplugStatus.ERROR)
    }
  }
  const loadCodePlug = async () => {
    try {
      const cp = await window.api.loadCodeplug();
      setCodeplug(cp);
      console.log('Loaded codeplug:', cp);
    } catch (error) {
      console.error('Error loading codeplug:', error);
      setCodeplug(null); // Optionally handle the error state
    }
  };

  const writeCodeplug = async () => {
    console.log('Writing codeplug')
    try {
      // Set up progress callback from preload.
      window.api.onProgress((prog: number) => {
        setProgress(prog)
      })
      setStatus(CodeplugStatus.WRITING)
      const cp = await window.api.writeCodeplug(codeplug)
      setStatus(CodeplugStatus.IDLE)
    } catch (error) {
      console.error('Error writing codeplug:', error)
      setStatus(CodeplugStatus.ERROR)
    }
  }
  const readCodePlug = async () => {
    console.log('Reading codeplug')
    try {
      // Set up progress callback from preload.
      window.api.onProgress((prog: number) => {
        setProgress(prog)
      })
      setStatus(CodeplugStatus.READING)
      const cp = await window.api.readCodeplug()
      setCodeplug(cp)
      setStatus(CodeplugStatus.IDLE)
    } catch (error) {
      console.error('Error reading codeplug:', error)
      setStatus(CodeplugStatus.ERROR)
    }
  }





  return (
    <div>
      <Toolbar>
        <ToolbarButton
          onClick={readCodePlug}
          vertical
          appearance="primary"
          icon={<ArrowDownloadRegular />}
        >
          {status === CodeplugStatus.READING ? "Reading..." : 'Read'}
        </ToolbarButton>
        <ToolbarButton
          vertical
          icon={<UsbPlugRegular />}
          onClick={writeCodeplug}
          disabled={!isConnected && !codeplug}
        >
          Write
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton vertical icon={<DocumentRegular />} onClick={loadCodePlug}>
          Load
        </ToolbarButton>
        <ToolbarButton
          vertical
          icon={<DocumentSaveRegular />}
          onClick={saveCodePlug}
          disabled={!isConnected}
        >
          Save
        </ToolbarButton>
      </Toolbar>
      <ProgressBar value={progress} min={0} max={100} />
      {codeplug && codeplug.length}
      {codeplug && <>
        <span>Codeplug</span>
        <span>{codeplug.toString()}</span>
      </>}
    </div>
  )
}

export default Codeplug
