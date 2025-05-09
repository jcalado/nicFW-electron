type VfoState = {
  group: number
  lastGroup: number
  groupModeChannels: number[] // Should be exactly 16 numbers
  mode: number
}

enum AfFilters {
  All = 0,
  'Hi-Pass + Lo-Pass' = 1,
  'Hi-Pass + De-emf' = 2,
  'Hi-Pass Only' = 3,
  'Lo-Pass + De-emf' = 4,
  'Lo-Pass Only' = 5,
  'De-emphasis Only' = 6,
  None = 7,
  'Fsk Mode' = 8
}

enum PttOptions {
  Dual = 0,
  Single = 1,
  Hybrid = 2
}

enum ASLOptions {
  Off = 0,
  COS = 1,
  USB = 2,
  'Inverted COS' = 3
}

enum PinActions {
  'Off' = 0,
  'Unlock' = 1,
  'Power Off' = 2
}

enum SBarOptions {
  'Segment' = 0,
  'Stepped' = 1,
  'Solid' = 2
}

enum BattOptions {
  'Off' = 0,
  'Icon' = 1,
  'Percent' = 2,
  'Voltage' = 3
}

enum IfOptions {
  '8.46 Hz' = 0,
  '7.25 Hz' = 1,
  '6.35 Hz' = 2,
  '5.64 Hz' = 3,
  '5.08 Hz' = 4,
  '4.62 Hz' = 5,
  '4.23 Hz' = 6
}

enum KeytoneOptions {
  'Off' = 0,
  'On' = 1,
  'Differential' = 2,
  'Voice' = 3
}

type RadioSettings = {
  magic: number
  squelch: number
  dualWatch: number
  autoFloor: number
  activeVfo: number
  step: number
  rxSplit: number
  txSplit: number
  pttMode: PttOptions
  txModMeter: number
  micGain: number
  txDeviation: number
  xtal671: number
  battStyle: BattOptions
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
  keyTones: KeytoneOptions
  ste: number
  rfGain: number
  sBarStyle: SBarOptions
  sqNoiseLev: number
  lastFmtFreq: number
  vox: number
  voxTail: number
  txTimeout: number
  dimmer: number
  dtmfSpeed: number
  noiseGate: number
  scanUpdate: number
  asl: ASLOptions
  disableFmt: number
  pin: number
  pinAction: PinActions
  lcdInverted: number
  afFilters: AfFilters
  ifFreq: IfOptions
  sBarAlwaysOn: number
  lockedVfo: number
  vfoLockActive: number
  dualWatchDelay: number
  subToneDeviation: number
  filler: Buffer
}

export {
  AfFilters,
  ASLOptions,
  BattOptions,
  IfOptions,
  KeytoneOptions,
  PttOptions,
  PinActions,
  SBarOptions
}
export type { RadioSettings, VfoState }
