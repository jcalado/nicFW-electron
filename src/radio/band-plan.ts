import Band, { Modulation, Bandwidth } from '../main/types/band'
import { toDecimalFreq } from '../utils/converters'

export function decodeBandPlan(blocks): Band[] {
  const fullBlock = Buffer.concat(blocks)

  // Validate magic numbers
  if (fullBlock[0] !== 0xa4 || fullBlock[1] !== 0x6d) {
    throw new Error('Invalid band plan magic numbers')
  }

  const bands: Band[] = []

  // 20 bands total (1-20) in 7 blocks of 3 bands each (last block has 2 bands + padding)
  for (let r = 1; r <= 20; r++) {
    const addr = 2 + (r - 1) * 10
    const startFreq = toDecimalFreq(fullBlock.readUInt32BE(addr))
    const endFreq = toDecimalFreq(fullBlock.readUInt32BE(addr + 4))
    const maxPower = fullBlock[addr + 8]
    const flags = fullBlock[addr + 9]

    bands.push({
      bandNumber: r,
      start: startFreq >= 18 ? startFreq : 0,
      end: endFreq <= 1300 ? endFreq : 0,
      wrap: !!(flags & 0x02),
      modulation: ((flags >> 2) & 0x07) as Modulation,
      bandwidth: ((flags >> 5) & 0x07) as Bandwidth,
      maxPower: maxPower === 0xff ? 'Auto' : maxPower,
      txAllowed: !!(flags & 0x01)
    })
  }
  return bands
}

export async function readBandPlan(radio): Promise<Band[]> {
  const blocks: Buffer[] = []

  try {
    // Disable radio during read
    await radio.executeCommand(Buffer.from([0x45]), { expectedLength: 1 })

    // Read 7 blocks (D0-D6)
    for (let blockNum = 0xd0; blockNum <= 0xd6; blockNum++) {
      const block = await radio.readBlock(blockNum)
      blocks.push(block.subarray(0, 32)) // Extract just the data payload
    }

    // Re-enable radio
    await radio.executeCommand(Buffer.from([0x46]), { expectedLength: 1 })
  } catch (error) {
    await radio.executeCommand(Buffer.from([0x46]), { expectedLength: 1 }) // Ensure radio re-enabled
    throw error
  }

  return decodeBandPlan(blocks)
}
