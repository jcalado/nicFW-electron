interface Channel {
  channelNumber: number
  rxFreq: number
  txFreq: number
  rxTone: string
  txTone: string
  txPower: number
  groups: string
  bandwidth: string
  modulation: string
  name: string
}

export default Channel
