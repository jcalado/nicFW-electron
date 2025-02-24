import { toGroupString, toToneString, toToneWord, toGroupWord } from '../utils/converters.js'

export function decodeChannelBlock(block) {
  const rx = block.readUInt32BE(0)
  if (rx === 0) return null

  const rxFreq = rx / 100000
  const txFreq = block.readUInt32BE(4) / 100000
  const rxSubToneRaw = block.readUInt16BE(8)
  const txSubToneRaw = block.readUInt16BE(10)
  const txPower = block.readUInt8(12)

  // Decode groups union (2 bytes)
  const groupsVal = block.readUInt16BE(13)
  const groups = {
    g0: groupsVal & 0x0F,
    g1: (groupsVal >> 4) & 0x0F,
    g2: (groupsVal >> 8) & 0x0F,
    g3: (groupsVal >> 12) & 0x0F
  }

  // Read bits (1 byte at offset 15)
  const bitsByte = block.readUInt8(15)
  const bits = {
    bandwidth: (bitsByte & 0x01) ? 'Wide' : 'Narrow',
    modulation: ['FM', 'NFM', 'AM', 'USB'][(bitsByte >> 1) & 0x03] || 'Unknown',
    position: (bitsByte >> 3) & 0x01,
    pttID: (bitsByte >> 4) & 0x03,
    reversed: Boolean((bitsByte >> 6) & 0x01),
    busyLock: Boolean((bitsByte >> 7) & 0x01)
  }

  // Reserved bytes (optional – returning as Buffer)
  const reserved = block.subarray(16, 20)

  const name = block.subarray(20, 32).toString('ascii').replace(/\x00/g, '')

  return {
    rxFreq,
    txFreq,
    rxSubTone: toToneString(rxSubToneRaw),
    txSubTone: toToneString(txSubToneRaw),
    txPower,
    groups,
    bits,
    reserved,
    name
  }
}

export async function readChannelMemories(radio) {
  const channels = []

  for (let blockNum = 2; blockNum <= 197; blockNum++) {
    try {
      const block = await radio.readBlock(blockNum)
      const channel = decodeChannelBlock(block)
      if (channel) {
        channels.push({
          channelNumber: blockNum - 1,
          ...channel
        })
      }
    } catch (error) {
      console.error(`Error reading channel ${blockNum - 1}:`, error.message)
    }
  }

  return channels
}

export function encodeChannelBlock(channel) {
  const block = Buffer.alloc(32)

  // RX Frequency (4 bytes)
  block.writeUInt32LE(Math.round(channel.rxFreq * 100000), 0)

  // TX Frequency (4 bytes)
  block.writeUInt32LE(Math.round(channel.txFreq * 100000), 4)

  // RX Tone (2 bytes)
  block.writeUInt16LE(toToneWord(channel.rxTone), 8)

  // TX Tone (2 bytes)
  block.writeUInt16LE(toToneWord(channel.txTone), 10)

  // TX Power (1 byte)
  block.writeUInt8(channel.txPower, 12)

  // Groups (2 bytes)
  block.writeUInt16LE(toGroupWord(channel.groups), 13)

  // Bandwidth + Modulation (1 byte)
  const bw = channel.bandwidth === 'Wide' ? 0 : 1
  const mod = ['FM', 'NFM', 'AM', 'USB'].indexOf(channel.modulation)
  block.writeUInt8((mod << 1) | bw, 15)

  // Channel Name (12 bytes)
  const nameBuf = Buffer.from(channel.name.substring(0, 12), 'ascii')
  nameBuf.copy(block, 20)

  // Calculate checksum
  block[32] = block.slice(0, 32).reduce((sum, byte) => sum + byte, 0) & 0xff

  return block
}
