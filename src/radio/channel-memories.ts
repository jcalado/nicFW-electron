import { toToneString, toToneWord, toGroupBytes } from '../utils/converters'
import { compactGroups } from '../utils/groups'
import { Channel, RxModulation, PttID, Bandwidth } from '../main/types/channel'

export function decodeChannelBlock(block): Channel | null {
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
    g0: groupsVal & 0x0f,
    g1: (groupsVal >> 4) & 0x0f,
    g2: (groupsVal >> 8) & 0x0f,
    g3: (groupsVal >> 12) & 0x0f
  }

  // Read bits (1 byte at offset 15)
  const bitsByte = block.readUInt8(15)
  const bits = {
    bandwidth: (bitsByte & 0x01 ? Bandwidth.Narrow : Bandwidth.Wide) as Bandwidth,
    modulation: (RxModulation[(bitsByte >> 1) & 0x03] || RxModulation.Auto) as RxModulation,
    position: (bitsByte >> 3) & 0x01,
    pttID: (PttID[(bitsByte >> 4) & 0x03] || PttID.Off) as PttID,
    reversed: Boolean((bitsByte >> 6) & 0x01),
    busyLock: Boolean((bitsByte >> 7) & 0x01)
  }

  // Reserved bytes (optional – returning as Buffer)
  const reserved = block.subarray(16, 20)

  // eslint-disable-next-line no-control-regex
  const name = block.subarray(20, 32).toString('ascii').replace(/\x00/g, '')

  return {
    channelNumber: 0,
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

// export async function readChannelMemories(radio): Promise<Channel[]> {
//   const channels: Channel[] = []

//   for (let blockNum = 2; blockNum <= 197; blockNum++) {
//     try {
//       const block = await radio.readBlock(blockNum)
//       const channel = decodeChannelBlock(block)
//       if (channel) {
//         channels.push({
//           channelNumber: blockNum - 1,
//           ...channel
//         })
//       }
//     } catch (error) {
//       console.error(`Error reading channel ${blockNum - 1}:`, error.message)
//     }
//   }

//   return channels
// }

export function encodeChannelBlock(channel: Channel): Buffer {
  const block = Buffer.alloc(32) // 33 bytes including checksum

  const compactedGroups = compactGroups(channel.groups)

  // RX Frequency (4 bytes)
  block.writeUInt32BE(Math.round(channel.rxFreq * 100000), 0)

  // TX Frequency (4 bytes)
  block.writeUInt32BE(Math.round(channel.txFreq * 100000), 4)

  // RX Tone (2 bytes)
  block.writeUInt16BE(toToneWord(channel.rxSubTone), 8)

  // TX Tone (2 bytes)
  block.writeUInt16BE(toToneWord(channel.txSubTone), 10)

  // TX Power (1 byte)
  block.writeUInt8(channel.txPower, 12)

  // Groups (2 bytes)
  const groupBytes = toGroupBytes(compactedGroups)
  block.writeUInt8(groupBytes.byte1, 13)
  block.writeUInt8(groupBytes.byte2, 14)

  // Bit Flags (1 byte)
  const bitsByte =
    (channel.bits.bandwidth === Bandwidth.Wide ? 0 : 1) |
    ((channel.bits.modulation & 0x03) << 1) |
    ((channel.bits.position & 0x01) << 3) |
    ((channel.bits.pttID & 0x03) << 4) |
    ((channel.bits.reversed ? 1 : 0) << 6) |
    ((channel.bits.busyLock ? 1 : 0) << 7)
  block.writeUInt8(bitsByte, 15)

  // Channel Name (12 bytes) - Padded with nulls
  const nameBuf = Buffer.alloc(12, 0)
  const channelName = channel.name.substring(0, 12)
  nameBuf.write(channelName, 0, channelName.length, 'ascii')
  nameBuf.copy(block, 20)

  return block
}
