import { dialog, ipcMain } from 'electron'
import fs from 'fs'
import SerialConnection from '../../radio/serial-connection'
import RadioCommunicator from '../../radio/radio-communicator'

export function setupSerialHandlers(connection: SerialConnection, radio: RadioCommunicator): void {
  ipcMain.handle('serial:list', async () => {
    try {
      const ports = await connection.getSerialPorts()
      console.log(ports)
      return ports
    } catch (error) {
      console.error('Error getting serial ports:', error)
    }
  })

  ipcMain.handle('serial:connect', async (_e, path) => {
    try {
      await radio.setPortPath(path)
      await radio.connect(path)
      console.log(`Connected to radio at port: ${radio.currentPortPath}`)
      return radio.currentPortPath
    } catch (error) {
      console.error('Error connecting to serial port:', error)
    }
  })

  ipcMain.handle('serial:disconnect', async (_e, path) => {
    try {
      await radio.disconnect()
    } catch (error) {
      console.error('Error connecting to serial port:', error)
    }
  })
}
