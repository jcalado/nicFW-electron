type VfoState = {
  group: number
  lastGroup: number
  groupModeChannels: any[] // Define a more specific type if possible
  mode: number
}

const AfFilters = {
  All: 0,
  'Hi-Pass + Lo-Pass': 1,
  'Hi-Pass + De-emf': 2,
  'Hi-Pass Only': 3,
  'Lo-Pass + De-emf': 4,
  'Lo-Pass Only': 5,
  'De-emphasis Only': 6,
  'None': 7,
  'Fsk Mode': 8
}

const PttOptions = {
  Dual: 0,
  Single: 1,
  Hybrid: 2
}

const ASLOptions = {
  "Off": 0,
  "COS": 1,
  "USB": 2,
  "Inverted COS": 3
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
  pttMode: typeof PttOptions
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
  asl: typeof ASLOptions
  disableFmt: number
  pin: number
  pinAction: number
  lcdInverted: number
  afFilters: typeof AfFilters
  ifFreq: number
  sBarAlwaysOn: number
  filler: Buffer
}

export { AfFilters, PttOptions, ASLOptions }
export type { RadioSettings, VfoState }
