interface Band {
  bandNumber: number
  start: number
  end: number
  maxPower: number
  txAllowed: boolean
  wrap: boolean
  modulation: string
  bandwidth: string
}

export default Band
