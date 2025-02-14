import RadioCommunicator from './radio-communicator'

export interface VfoState {
  group: number
  lastGroup: number
  groupModeChannels: number[] // length 16
  mode: number
}

export interface SettingsBlock {
  magic: number
  squelch: number
  dualWatch: number
  autoFloor: number
  activeVfo: number
  step: number
  rxSplit: number
  txSplit: number
  pttMode: number
  txModMeter: number
  micGain: number
  txDeviation: number
  xtal671: number
  battStyle: number
  scanRange: number
  scanPersist: number
  scanResume: number
  ultraScan: number
  toneMonitor: number
  lcdBrightness: number
  lcdTimeout: number
  breathe: number
  dtmfDev: number
  gamma: number
  repeaterTone: number
  vfoState: VfoState[]
  keyLock: number
  bluetooth: number
  powerSave: number
  keyTones: number
  ste: number
  rfGain: number
  sBarStyle: number
  sqNoiseLev: number
  lastFmtFreq: number
  vox: number
  voxTail: number
  txTimeout: number
  dimmer: number
  dtmfSpeed: number
  noiseGate: number
  scanUpdate: number
  asl: number
  disableFmt: number
  pin: number
  pinAction: number
  lcdInverted: number
  afFilters: number
  ifFreq: number
  sBarAlwaysOn: number
  filler: Buffer
}

export async function readSettings(radio: RadioCommunicator): Promise<SettingsBlock> {
  // The settings block occupies 128 bytes starting at address 0x1900 (decimal 6400).
  // 128 bytes / 32 bytes per block = 4 blocks: blocks 200, 201, 202, and 203.
  const blockNumbers = [200, 201, 202, 203]
  const blocks: Buffer[] = [];
  for (const num of blockNumbers) {
    const block = await radio.readBlock(num);
    blocks.push(block);
  }
  const buf = Buffer.concat(blocks);

  const settings: SettingsBlock = {
    magic: buf.readUInt16LE(0x00),
    squelch: buf.readUInt8(0x02),
    dualWatch: buf.readUInt8(0x03),
    autoFloor: buf.readUInt8(0x04),
    activeVfo: buf.readUInt8(0x05),
    step: buf.readUInt16LE(0x06),
    rxSplit: buf.readUInt16LE(0x08),
    txSplit: buf.readUInt16LE(0x0a),
    pttMode: buf.readUInt8(0x0c),
    txModMeter: buf.readUInt8(0x0d),
    micGain: buf.readUInt8(0x0e),
    txDeviation: buf.readUInt8(0x0f),
    xtal671: buf.readInt8(0x10),
    battStyle: buf.readUInt8(0x11),
    scanRange: buf.readUInt16LE(0x12),
    scanPersist: buf.readUInt16LE(0x14),
    scanResume: buf.readUInt8(0x16),
    ultraScan: buf.readUInt8(0x17),
    toneMonitor: buf.readUInt8(0x18),
    lcdBrightness: buf.readUInt8(0x19),
    lcdTimeout: buf.readUInt8(0x1a),
    breathe: buf.readUInt8(0x1b),
    dtmfDev: buf.readUInt8(0x1c),
    gamma: buf.readUInt8(0x1d),
    repeaterTone: buf.readUInt16LE(0x1e),
    vfoState: [],
    keyLock: buf.readUInt8(0x46),
    bluetooth: buf.readUInt8(0x47),
    powerSave: buf.readUInt8(0x48),
    keyTones: buf.readUInt8(0x49),
    ste: buf.readUInt8(0x4a),
    rfGain: buf.readUInt8(0x4b),
    sBarStyle: buf.readUInt8(0x4c),
    sqNoiseLev: buf.readUInt8(0x4d),
    lastFmtFreq: buf.readUInt32LE(0x4e),
    vox: buf.readUInt8(0x52),
    voxTail: buf.readUInt16LE(0x53),
    txTimeout: buf.readUInt8(0x55),
    dimmer: buf.readUInt8(0x56),
    dtmfSpeed: buf.readUInt8(0x57),
    noiseGate: buf.readUInt8(0x58),
    scanUpdate: buf.readUInt8(0x59),
    asl: buf.readUInt8(0x5a),
    disableFmt: buf.readUInt8(0x5b),
    pin: buf.readUInt16LE(0x5c),
    pinAction: buf.readUInt8(0x5e),
    lcdInverted: buf.readUInt8(0x5f),
    afFilters: buf.readUInt8(0x60),
    ifFreq: buf.readUInt8(0x61),
    sBarAlwaysOn: buf.readUInt8(0x62),
    filler: buf.slice(0x63, 0x63 + 29)
  }

  // Parse the 2 VFO state blocks.
  // Each block is 19 bytes long:
  // - First VFO: starts at 0x20
  // - Second VFO: starts at 0x20 + 19 = 0x33
  settings.vfoState = [0, 1].map(i => {
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
