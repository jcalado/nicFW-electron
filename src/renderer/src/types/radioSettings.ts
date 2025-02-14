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

const PinActions = {
  "Off": 0,
  "Unlock": 1,
  "Power Off": 2,
}

const SBarOptions = {
  "Segment": 0,
  "Stepped": 1,
  "Solid": 2
}

const BattOptions = {
  "Off": 0,
  "Icon": 1,
  "Percent": 2,
  "Voltage": 3
}

const IfOptions = {
  "8.46": 0,
  "7.25": 1,
  "6.35": 2,
  "5.64": 3,
  "5.08": 4,
  "4.62": 5,
  "4.23": 6
}

const KeytoneOptions =  {
  "Off": 0,
  "On": 1,
  "Differential":2 ,
  "Voice": 3
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
  battStyle: typeof BattOptions
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
  keyTones: typeof KeytoneOptions
  ste: number
  rfGain: number
  sBarStyle: typeof SBarOptions
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
  pinAction: typeof PinActions
  lcdInverted: number
  afFilters: typeof AfFilters
  ifFreq: typeof IfOptions
  sBarAlwaysOn: number
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
