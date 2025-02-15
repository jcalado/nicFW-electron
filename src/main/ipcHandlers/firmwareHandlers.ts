import { app, ipcMain } from 'electron'
import { FirmwareDownloader } from '../../radio/firmware-downloader'
import fs from 'fs'

export function setupFirmwareHandlers(radio: Radio): void {
  ipcMain.handle('firmware:getArchive', async (_e) => {
    const firmwarePath = `${app.getPath('userData')}/firmware`

    // List every firmware on the archive. Files are at archivePath/firmware
    console.log('Listing firmware archive')
    console.log(firmwarePath)
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
    console.log(filesWithDates)
    return filesWithDates
  })

  ipcMain.handle(
    'firmware:flash',
    async (event, filePath: string, progressCallback: (progress: number) => void) => {
      console.log('Flashing firmware')
      try {
        const firmwareData = fs.readFileSync(`${app.getPath('userData')}/firmware/${filePath}`)

        await radio.setBaudRate(115200)
        await radio.connect()
        await radio.flashFirmware(firmwareData, (progress: number) => {
          event.sender.send('operation:progress', progress)
        })
        await radio.close()

        return true
      } catch (error) {
        throw new Error(`Firmware flash failed: ${error.message}`)
      }
    }
  )

  ipcMain.handle('firmware:getLatestVersion', async (_e) => {
    try {
      const updater = new FirmwareDownloader('.')
      const result = await updater.getLatestVersion()

      return result
    } catch (error) {
      console.error('Firmware update check failed:', error.message)
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
    } catch (error) {
      console.error('Firmware update check failed:', error.message)
      process.exit(1)
    }
  })
}
