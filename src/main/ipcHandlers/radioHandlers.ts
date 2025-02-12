import { ipcMain } from 'electron'
import RadioCommunicator from '../../radio/radio-communicator'
import { readChannelMemories, encodeChannelBlock } from '../../radio/channel-memories'
import { readGroupLabels, writeGroupLabel } from '../../radio/group-labels.js'
import { readBandPlan } from '../../radio/band-plan.js'

export function setupRadioHandlers(radio: RadioCommunicator): void {
  // Handler for writing channels to the radio
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
    try {
      await radio.connect()
      await radio.initialize()
      const channels = await readChannelMemories(radio)
      return channels
    } catch (error) {
      console.error('Error reading channels:', error)
      throw error
    } finally {
      await radio.close()
    }
  })

  // ipcMain.handle('radio:readChannels', async (_e) => {
  //   try {
  //     await radio.initialize()
  //     const channels = await readChannelMemories(radio)
  //     console.log(channels)
  //     return channels
  //   } catch (error) {
  //     console.error('Error connecting to serial port:', error)
  //   }
  // })

  ipcMain.handle('radio:readBands', async (_e) => {
    try {
      await radio.connect()
      await radio.initialize()
      const bandplan = await readBandPlan(radio)
      console.log(bandplan)
      return bandplan
    } catch (error) {
      console.error('Error connecting to serial port:', error)
    }
  })

  ipcMain.handle('radio:readGroups', async (_e) => {
    try {
      await radio.connect()
      await radio.initialize()
      const groups = await readGroupLabels(radio)
      console.log(groups)
      return groups
    } catch (error) {
      console.error('Error connecting to serial port:', error)
    }
  })
}
