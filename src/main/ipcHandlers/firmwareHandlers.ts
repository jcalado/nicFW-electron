import { app, ipcMain } from 'electron'
import { FirmwareDownloader } from '../../radio/firmware-downloader'
import fs from 'fs'
import RadioCommunicator from '../../radio/radio-communicator'

export function setupFirmwareHandlers(radio: RadioCommunicator): void {
  ipcMain.handle('firmware:getArchive', async () => {
    const firmwarePath = `${app.getPath('userData')}/firmware`

    // Return the list of files
    const files = await fs.promises.readdir(`${firmwarePath}`)

    // Get the created at date for each file and send it back
    const filesWithDates = await Promise.all(
      files
        .filter((file) => file.endsWith('.bin'))
        .map(async (file) => {
          const stats = await fs.promises.stat(`${firmwarePath}/${file}`)
          return { file, created: stats.birthtime }
        })
    )

    // Only return files with .bin extension
    return filesWithDates
  })

  ipcMain.handle('firmware:flash', async (event, filePath: string) => {
    console.log('Flashing firmware')
    try {
      const firmwareData = fs.readFileSync(filePath)

      await radio.setBaudRate(115200)
      await radio.connect()
      await radio.flashFirmware(firmwareData, (progress: number) => {
        event.sender.send('operation:progress', progress)
      })
      await radio.close()

      return true
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Firmware flash failed: ${errorMessage}`)
    }
  })

  ipcMain.handle('firmware:getLatestVersion', async () => {
    try {
      const updater = new FirmwareDownloader('.')
      const result = await updater.getLatestVersion()

      return result
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Firmware update check failed:', errorMessage)
      process.exit(1)
    }
  })

  ipcMain.handle('firmware:getLatest', async (_e) => {
    try {
      const updater = new FirmwareDownloader('.')
      const result = await updater.checkForUpdates('.')

      if (result.updated) {
        console.log(`Successfully downloaded version ${result.version}`)
        console.log(`Firmware saved to: ${result.path}`)
      } else {
        console.log('No update needed - already have latest version')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Firmware update check failed:', errorMessage)
      process.exit(1)
    }
  })
}
