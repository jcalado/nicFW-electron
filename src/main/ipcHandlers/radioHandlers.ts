import { dialog, ipcMain } from 'electron'
import RadioCommunicator from '../../radio/radio-communicator'
import { readChannelMemories, encodeChannelBlock, decodeChannelBlock } from '../../radio/channel-memories'
import { readGroupLabels, writeGroupLabel } from '../../radio/group-labels.js'
import { readBandPlan } from '../../radio/band-plan.js'
import { readSettings, writeSettings } from '../../radio/settings.js'
import { readCodeplug, writeCodeplug, saveCodeplug } from '../../radio/codeplug.js'
import fs from 'fs'
import { Channel, Group } from '../../renderer/src/types'

export function setupRadioHandlers(radio: RadioCommunicator, codeplugService): void {


  ipcMain.handle('codeplug:fetchCodeplug', async (event, onProgress) => {
    try {
      await codeplugService.fetchCodeplug((progress: number) => {
        event.sender.send('operation:progress', progress); // Send progress updates to the renderer
      });
      event.sender.send('operation:progress', 120)
    } catch (error) {
      console.error('Error fetching codeplug:', error);
      throw error;
    }
  });

  ipcMain.handle('radio:writeChannels', async (_event, channels: Channel[]) => {
    try {
      await radio.connect()
      await radio.initialize()

      for (const channel of channels) {
        const blockData = encodeChannelBlock(channel)
        await radio.writeBlock(channel.channelNumber + 1, blockData) // Channel 1 = Block 2
      }

      console.log('Channels written successfully!')
    } catch (error) {
      console.error('Error writing channels:', error)
      throw error
    } finally {
      await radio.close()
    }
  })

  // Handler for reading channels from the radio
  ipcMain.handle('radio:readChannels', async () => {
    const channels = await codeplugService.readChannels();
    return channels
  })

  ipcMain.handle('radio:readSettings', async (_e) => {
    try {
      if (!radio.portAvailable) {
        await radio.port?.open()
      }
      await radio.connect()
      await radio.initialize()
      const settings = await readSettings(radio)
      // Re-enable radio
      await radio.executeCommand([0x46], { waitForResponse: true, expectedLength: 1 })
      return settings
    } catch (error) {
      console.error('Error connecting to serial port:', error)
    }
  })

  ipcMain.handle('radio:writeSettings', async (_e, settings) => {
    try {
      if (!radio.portAvailable) {
        await radio.port?.open()
      }
      await radio.connect()
      await radio.initialize()
      await writeSettings(radio, settings)
      console.log('Settings written successfully!')
      await radio.executeCommand([0x49], { waitForResponse: false, expectedLength: 0 })
    } catch (error) {
      console.error('Error writing settings:', error)
      throw error
    } finally {
      await radio.close()
    }
  })

  ipcMain.handle('radio:readBands', async (_e) => {
    console.log('Reading band plan...')
    const bands = await codeplugService.readBandPlan();
    return bands
  })

  ipcMain.handle('radio:readGroups', async (_e) => {
    const groups = await codeplugService.readGroups();
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
}
