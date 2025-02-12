export interface Channel {
  channelNumber: number
  rxFreq: number // in 0.1 Hz units converted to Hz (e.g., divided by 100000)
  txFreq: number // in 0.1 Hz units converted to Hz
  rxSubTone: string // decoded using toToneString
  txSubTone: string // decoded using toToneString
  txPower: number
  groups: ChannelGroups
  bits: ChannelBits
  reserved?: Buffer // data reserved from offset 16 to 20
  name: string // channel name (max 12 characters)
}

export interface ChannelGroups {
  g0: number // lower 4 bits
  g1: number // next 4 bits
  g2: number // next 4 bits
  g3: number // upper 4 bits
}

export interface ChannelBits {
  bandwidth: 'Wide' | 'Narrow'
  modulation: 'FM' | 'NFM' | 'AM' | 'USB' | 'Unknown'
  position: number
  pttID: string
  reversed: boolean
  busyLock: boolean
}

export default Channel
