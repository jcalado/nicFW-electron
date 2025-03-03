interface ScanPreset {
  presetNumber: number
  startFreq: number
  range: number
  step: number
  resume: number
  persist: number
  modulation: 'FM' | 'NFM' | 'AM' | 'USB'
  ultrascan: number
  label: string
}

export default ScanPreset
