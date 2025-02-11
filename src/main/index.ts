import { app, dialog, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import RadioCommunicator from '../radio/radio-communicator.js'
import SerialConnection from '../radio/serial-connection.js'
import { readChannelMemories, encodeChannelBlock } from '../radio/channel-memories.js'
import { readGroupLabels, writeGroupLabel } from '../radio/group-labels.js'
import { readBandPlan } from '../radio/band-plan.js'
import { FirmwareDownloader } from '../radio/firmware-downloader.js'

import fs from 'fs'

const radio = new RadioCommunicator()

const serialConnection = new SerialConnection()

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle('radio:read-channels', async (event, port) => {
  // const radio = new RadioCommunicator(port)
  await radio.connect()
  await radio.initialize()
  const channels = await readChannelMemories(radio)

  console.log(channels)
})

ipcMain.handle('serial:list', async () => {
  try {
    const ports = await serialConnection.getSerialPorts()
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

ipcMain.handle('radio:readChannels', async (_e) => {
  try {
    await radio.initialize()
    const channels = await readChannelMemories(radio)
    console.log(channels)
    return channels
  } catch (error) {
    console.error('Error connecting to serial port:', error)
  }
})

ipcMain.handle('radio:readGroups', async (_e) => {
  try {
    await radio.initialize()
    const groups = await readGroupLabels(radio)
    console.log(groups)
    return groups
  } catch (error) {
    console.error('Error connecting to serial port:', error)
  }
})

ipcMain.handle('radio:readBands', async (_e) => {
  try {
    await radio.initialize()
    const bandplan = await readBandPlan(radio)
    console.log(bandplan)
    return bandplan
  } catch (error) {
    console.error('Error connecting to serial port:', error)
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

ipcMain.handle('dialog:showMessageBox', async (_e, options) => {
  return await dialog.showMessageBox(options)
})

ipcMain.handle('firmware:getArchive', async (_e) => {
  const firmwarePath = `${app.getPath('userData')}/firmware`

  // List every firmware on the archive. Files are at archivePath/firmware
  console.log('Listing firmware archive')
  console.log(firmwarePath)
  // Return the list of files
  const files = await fs.promises.readdir(`${firmwarePath}`)

  // Only return files with .bin extension
  return files.filter((file) => file.endsWith('.bin'))
})
