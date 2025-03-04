import { dialog, ipcMain } from 'electron'
import RadioCommunicator from '../../radio/radio-communicator'
import { writeSettings } from '../../radio/settings.js'
import { readCodeplug, writeCodeplug, saveCodeplug } from '../../radio/codeplug.js'
import fs from 'fs'
import { Channel, Group } from '../types'

export function setupRadioHandlers(radio: RadioCommunicator, codeplugService): void {
  ipcMain.handle('codeplug:fetchCodeplug', async (event) => {
    try {
      await codeplugService.fetchCodeplug((progress: number) => {
        event.sender.send('operation:progress', progress) // Send progress updates to the renderer
      })
      event.sender.send('operation:progress', 120)
    } catch (error) {
      console.error('Error fetching codeplug:', error)
      throw error
    }
  })

  ipcMain.handle(
    'codeplug:updateChannel',
    async (_event, channelNumber: number, channelData: Channel) => {
      await codeplugService.updateChannel(channelNumber, channelData)
    }
  )

  ipcMain.handle('codeplug:updateGroup', async (_event, groupIndex: number, label: string) => {
    await codeplugService.updateGroup(groupIndex, label)
  })

  // Handler for reading channels from the radio
  ipcMain.handle('radio:readChannels', async () => {
    const channels = await codeplugService.readChannels()
    return channels
  })

  ipcMain.handle('radio:writeChannels', async (_e, channels: Channel[]) => {
    await codeplugService.writeChannels(channels)
  })

  ipcMain.handle('radio:readSettings', async () => {
    console.log('Reading settings...')
    const settings = await codeplugService.readSettings()
    return settings
  })

  ipcMain.handle('radio:writeSettings', async (_e, settings) => {
    try {
      if (!radio.portAvailable) {
        await radio.openPort()
      }
      await radio.connect()
      await radio.initialize()
      await writeSettings(radio, settings)
      console.log('Settings written successfully!')
      const buffer = Buffer.from([0x49])
      await radio.executeCommand(buffer, { waitForResponse: false, expectedLength: 0 })
    } catch (error) {
      console.error('Error writing settings:', error)
      throw error
    } finally {
      await radio.close()
    }
  })

  ipcMain.handle('radio:readBands', async () => {
    console.log('Reading band plan...')
    const bands = await codeplugService.readBandPlan()
    return bands
  })

  ipcMain.handle('radio:readGroups', async () => {
    const groups = await codeplugService.readGroups()
    return groups
  })

  ipcMain.handle('radio:writeGroups', async (_e, groups: Group[]) => {
    try {
      await radio.connect()
      await radio.initialize()

      await codeplugService.updateGroups(groups)

      console.log('Groups written successfully!')
    } catch (error) {
      console.error('Error writing groups:', error)
      throw error
    } finally {
      await radio.close()
    }
  })

  ipcMain.handle('radio:readCodeplug', async (event) => {
    try {
      await radio.connect()
      await radio.initialize()
      const codeplug = await readCodeplug(radio, (progress: number) => {
        event.sender.send('operation:progress', progress)
      })

      return codeplug
    } catch (error) {
      console.error('Error reading codeplug:', error)
    }
  })

  ipcMain.handle('radio:writeCodeplug', async (event, codeplug) => {
    try {
      // await radio.connect()
      // await radio.initialize()
      const plug = await writeCodeplug(radio, codeplug, (progress: number) => {
        event.sender.send('operation:progress', progress)
      })

      return plug
    } catch (error) {
      console.error('Error writing codeplug:', error)
    }
  })

  ipcMain.handle('radio:saveCodeplug', async (_e, codeplug) => {
    try {
      // await radio.connect()
      // await radio.initialize()

      // Open a file picker to ask where to save
      dialog
        .showSaveDialog({
          title: 'Save Codeplug',
          defaultPath: 'codeplug.bin',
          filters: [{ name: 'Codeplug', extensions: ['bin'] }]
        })
        .then(async (result) => {
          if (result.canceled) {
            return
          }

          await saveCodeplug(codeplug, result.filePath)
        })

      console.log('Codeplug saved successfully!')
    } catch (error) {
      console.error('Error writing codeplug:', error)
      throw error
    } finally {
      await radio.close()
    }
  })

  ipcMain.handle('radio:loadCodeplug', async (_e) => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Load Codeplug',
        defaultPath: 'codeplug.nfw',
        filters: [{ name: 'Codeplug', extensions: ['nfw'] }]
      })

      if (result.canceled) {
        return null
      }

      const filePath = result.filePaths[0]
      const codeplug = await fs.promises.readFile(filePath)
      return codeplug
    } catch (error) {
      console.error('Error loading codeplug:', error)
      throw error
    }
  })

  ipcMain.handle('radio:readScanPresets', async () => {
    try {
      return await codeplugService.readScanPresets()
    } catch (error) {
      console.error('Error reading scan presets:', error)
      throw error
    }
  })

  ipcMain.handle('radio:writeScanPresets', async (_, presets) => {
    try {
      return await codeplugService.writeScanPresets(presets)
    } catch (error) {
      console.error('Error writing scan presets:', error)
      throw error
    }
  })

  // Add handlers for DTMF presets
  ipcMain.handle('radio:readDTMFPresets', async () => {
    try {
      return await codeplugService.readDTMFPresets()
    } catch (error) {
      console.error('Error reading DTMF presets:', error)
      throw error
    }
  })

  ipcMain.handle('radio:writeDTMFPresets', async (_, presets) => {
    try {
      return await codeplugService.writeDTMFPresets(presets)
    } catch (error) {
      console.error('Error writing DTMF presets:', error)
      throw error
    }
  })
}
