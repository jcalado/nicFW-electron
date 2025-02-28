import { dialog, ipcMain } from 'electron'
import fs from 'fs'

export function setupFileHandlers(): void {
  // Handler for opening the file dialog
  ipcMain.handle('dialog:openFile', async (_event, extension: string = 'csv') => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: `${extension.toUpperCase()} Files`, extensions: [extension.toLowerCase()] }]
    })

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  })

  // Handler for opening the save file dialog
  ipcMain.handle('dialog:saveFile', async () => {
    const result = await dialog.showSaveDialog({
      title: 'Save Channels',
      filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    })

    if (!result.canceled && result.filePath) {
      return result.filePath
    }
    return null
  })

  // Handler for reading a file
  ipcMain.handle('file:read', async (_event, filePath: string) => {
    return fs.promises.readFile(filePath, 'utf-8')
  })

  // Handler for writing a file
  ipcMain.handle('file:write', async (_event, filePath: string, data: string) => {
    return fs.promises.writeFile(filePath, data, 'utf-8')
  })
}
