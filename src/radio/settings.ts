import RadioCommunicator from './radio-communicator'
import {
  AfFilters,
  ASLOptions,
  BattOptions,
  IfOptions,
  KeytoneOptions,
  PinActions,
  PttOptions,
  RadioSettings,
  SBarOptions
} from '../main/types/radioSettings'

export async function readSettings(radio: RadioCommunicator): Promise<RadioSettings> {
  // The settings block occupies 128 bytes starting at address 0x1900 (decimal 6400).
  // 128 bytes / 32 bytes per block = 4 blocks: blocks 200, 201, 202, and 203.
  const blockNumbers = [200, 201, 202, 203]
  const blocks: Buffer[] = []
  for (const num of blockNumbers) {
    const block = await radio.readBlock(num)
    blocks.push(block)
  }
  const buf = Buffer.concat(blocks)
  return bufferToSettings(buf)
}

export function bufferToSettings(buf: Buffer): RadioSettings {
  const settings: RadioSettings = {
    magic: buf.readUInt16BE(0x00),
    squelch: buf.readUInt8(0x02),
    dualWatch: buf.readUInt8(0x03),
    autoFloor: buf.readUInt8(0x04),
    activeVfo: buf.readUInt8(0x05),
    step: buf.readUInt16BE(0x06),
    rxSplit: buf.readUInt16BE(0x08),
    txSplit: buf.readUInt16BE(0x0a),
    pttMode: buf.readUInt8(0x0c) as PttOptions,
    txModMeter: buf.readUInt8(0x0d),
    micGain: buf.readUInt8(0x0e),
    txDeviation: buf.readUInt8(0x0f),
    xtal671: buf.readInt8(0x10),
    battStyle: buf.readUInt8(0x11) as BattOptions,
    scanRange: buf.readUInt16BE(0x12),
    scanPersist: buf.readUInt16BE(0x14),
    scanResume: buf.readUInt8(0x16),
    ultraScan: buf.readUInt8(0x17),
    toneMonitor: buf.readUInt8(0x18),
    lcdBrightness: buf.readUInt8(0x19),
    lcdTimeout: buf.readUInt8(0x1a),
    breathe: buf.readUInt8(0x1b),
    dtmfDev: buf.readUInt8(0x1c),
    gamma: buf.readUInt8(0x1d),
    repeaterTone: buf.readUInt16BE(0x1e),
    vfoState: [],
    keyLock: buf.readUInt8(0x46),
    bluetooth: buf.readUInt8(0x47),
    powerSave: buf.readUInt8(0x48),
    keyTones: buf.readUInt8(0x49) as KeytoneOptions,
    ste: buf.readUInt8(0x4a),
    rfGain: buf.readUInt8(0x4b),
    sBarStyle: buf.readUInt8(0x4c) as SBarOptions,
    sqNoiseLev: buf.readUInt8(0x4d),
    lastFmtFreq: buf.readUInt32BE(0x4e),
    vox: buf.readUInt8(0x52),
    voxTail: buf.readUInt16BE(0x53),
    txTimeout: buf.readUInt8(0x55),
    dimmer: buf.readUInt8(0x56),
    dtmfSpeed: buf.readUInt8(0x57),
    noiseGate: buf.readUInt8(0x58),
    scanUpdate: buf.readUInt8(0x59),
    asl: buf.readUInt8(0x5a) as ASLOptions,
    disableFmt: buf.readUInt8(0x5b),
    pin: buf.readUInt16BE(0x5c),
    pinAction: buf.readUInt8(0x5e) as PinActions,
    lcdInverted: buf.readUInt8(0x5f),
    afFilters: buf.readUInt8(0x60) as AfFilters,
    ifFreq: buf.readUInt8(0x61) as IfOptions,
    sBarAlwaysOn: buf.readUInt8(0x62),
    lockedVfo: buf.readUInt8(0x63),
    vfoLockActive: buf.readUInt8(0x64),
    dualWatchDelay: buf.readUInt8(0x65),
    subToneDeviation: buf.readUInt8(0x66),
    filler: buf.subarray(0x67, 0x67 + 25),
  }

  // Parse the 2 VFO state blocks.
  // Each block is 19 bytes long:
  // - First VFO: starts at 0x20
  // - Second VFO: starts at 0x20 + 19 = 0x33
  settings.vfoState = [0, 1].map((i) => {
    const base = 0x20 + i * 19
    const group = buf.readUInt8(base)
    const lastGroup = buf.readUInt8(base + 1)
    const groupModeChannels: number[] = []
    for (let j = 0; j < 16; j++) {
      groupModeChannels.push(buf.readUInt8(base + 2 + j))
    }
    const mode = buf.readUInt8(base + 18)
    return { group, lastGroup, groupModeChannels, mode }
  })

  return settings
}

export async function writeSettings(
  radio: RadioCommunicator,
  settings: RadioSettings
): Promise<void> {
  // Create a buffer to hold the settings block (128 bytes)
  const buffer = Buffer.alloc(128)

  // Write settings to the buffer - using BE for V2.5X firmware
  buffer.writeUInt16BE(settings.magic, 0x00)
  buffer.writeUInt8(settings.squelch, 0x02)
  buffer.writeUInt8(settings.dualWatch, 0x03)
  buffer.writeUInt8(settings.autoFloor, 0x04)
  buffer.writeUInt8(settings.activeVfo, 0x05)
  buffer.writeUInt16BE(settings.step, 0x06)
  buffer.writeUInt16BE(settings.rxSplit, 0x08)
  buffer.writeUInt16BE(settings.txSplit, 0x0a)
  buffer.writeUInt8(settings.pttMode, 0x0c)
  buffer.writeUInt8(settings.txModMeter, 0x0d)
  buffer.writeUInt8(settings.micGain, 0x0e)
  buffer.writeUInt8(settings.txDeviation, 0x0f)
  buffer.writeInt8(settings.xtal671, 0x10)
  buffer.writeUInt8(settings.battStyle, 0x11)
  buffer.writeUInt16BE(settings.scanRange, 0x12)
  buffer.writeUInt16BE(settings.scanPersist, 0x14)
  buffer.writeUInt8(settings.scanResume, 0x16)
  buffer.writeUInt8(settings.ultraScan, 0x17)
  buffer.writeUInt8(settings.toneMonitor, 0x18)
  buffer.writeUInt8(settings.lcdBrightness, 0x19)
  buffer.writeUInt8(settings.lcdTimeout, 0x1a)
  buffer.writeUInt8(settings.breathe, 0x1b)
  buffer.writeUInt8(settings.dtmfDev, 0x1c)
  buffer.writeUInt8(settings.gamma, 0x1d)
  buffer.writeUInt16BE(settings.repeaterTone, 0x1e)

  // Write VFO states
  settings.vfoState.forEach((vfo, i) => {
    const base = 0x20 + i * 19
    buffer.writeUInt8(vfo.group, base)
    buffer.writeUInt8(vfo.lastGroup, base + 1)
    vfo.groupModeChannels.forEach((channel, j) => {
      buffer.writeUInt8(channel, base + 2 + j)
    })
    buffer.writeUInt8(vfo.mode, base + 18)
  })

  // Write remaining settings
  buffer.writeUInt8(settings.keyLock, 0x46)
  buffer.writeUInt8(settings.bluetooth, 0x47)
  buffer.writeUInt8(settings.powerSave, 0x48)
  buffer.writeUInt8(settings.keyTones, 0x49)
  buffer.writeUInt8(settings.ste, 0x4a)
  buffer.writeUInt8(settings.rfGain, 0x4b)
  buffer.writeUInt8(settings.sBarStyle, 0x4c)
  buffer.writeUInt8(settings.sqNoiseLev, 0x4d)
  buffer.writeUInt32BE(settings.lastFmtFreq, 0x4e)
  buffer.writeUInt8(settings.vox, 0x52)
  buffer.writeUInt16BE(settings.voxTail, 0x53)
  buffer.writeUInt8(settings.txTimeout, 0x55)
  buffer.writeUInt8(settings.dimmer, 0x56)
  buffer.writeUInt8(settings.dtmfSpeed, 0x57)
  buffer.writeUInt8(settings.noiseGate, 0x58)
  buffer.writeUInt8(settings.scanUpdate, 0x59)
  buffer.writeUInt8(settings.asl, 0x5a)
  buffer.writeUInt8(settings.disableFmt, 0x5b)
  buffer.writeUInt16BE(settings.pin, 0x5c)
  buffer.writeUInt8(settings.pinAction, 0x5e)
  buffer.writeUInt8(settings.lcdInverted, 0x5f)
  buffer.writeUInt8(settings.afFilters, 0x60)
  buffer.writeUInt8(settings.ifFreq, 0x61)
  buffer.writeUInt8(settings.sBarAlwaysOn, 0x62)
  buffer.writeUInt8(settings.lockedVfo, 0x63)
  buffer.writeUInt8(settings.vfoLockActive, 0x64)
  buffer.writeUInt8(settings.dualWatchDelay, 0x65)
  buffer.writeUInt8(settings.subToneDeviation, 0x66)

  // Fill remaining space with zeros or copy from settings.filler
  if (settings.filler && Buffer.isBuffer(settings.filler)) {
    settings.filler.copy(buffer, 0x67, 0, Math.min(settings.filler.length, 25))
  }

  // Split the buffer into 32-byte blocks
  const blocks = [
    buffer.subarray(0, 32),
    buffer.subarray(32, 64),
    buffer.subarray(64, 96),
    buffer.subarray(96, 128)
  ]

  // Write each block to the radio
  const blockNumbers = [200, 201, 202, 203] // EEPROM block numbers for settings
  for (let i = 0; i < blocks.length; i++) {
    await radio.writeBlock(blockNumbers[i], blocks[i])
  }
}
