import { readCodeplug } from '../radio/codeplug'
import { decodeChannelBlock, encodeChannelBlock } from '../radio/channel-memories'
import { decodeBandPlan } from '../radio/band-plan'
import { readSettings } from '../radio/settings'
import { decodeScanPresetBlock, encodeScanPresetBlock } from '../radio/scan-presets'
import RadioCommunicator from '../radio/radio-communicator'
import { Channel, Group, Band, RadioSettings, ScanPreset } from '../renderer/src/types'

class CodeplugService {
  private codeplug: Buffer | null = null
  private radio: RadioCommunicator

  constructor(radio: RadioCommunicator) {
    this.radio = radio
  }

  /**
   * Fetches the entire codeplug from the radio.
   */
  async fetchCodeplug(onProgress?: (progress: number) => void): Promise<void> {
    try {
      await this.radio.connect()
      await this.radio.initialize()
      this.codeplug = await readCodeplug(this.radio, (progress: number) => {
        // console.log(`Fetching codeplug: ${progress}%`)
        if (onProgress) {
          onProgress(progress) // Notify the caller of progress
        }
      })
    } catch (error) {
      console.error('Error fetching codeplug:', error)
      throw error
    } finally {
      await this.radio.close()
    }
  }

  /**
   * Reads and decodes channel data from the codeplug.
   */
  async readChannels(): Promise<Channel[]> {
    if (!this.codeplug) {
      throw new Error('Codeplug not fetched. Call fetchCodeplug() first.')
    }

    const channels: Channel[] = []
    for (let blockNum = 2; blockNum <= 197; blockNum++) {
      const blockData = this.codeplug.subarray(blockNum * 32, (blockNum + 1) * 32)
      const channel = decodeChannelBlock(blockData)
      if (channel) {
        channels.push({
          channelNumber: blockNum - 1, // Channel 1 = Block 2
          ...channel
        })
      }
    }
    return channels
  }

  async writeChannels(channels: Channel[]): Promise<void> {
    if (!this.codeplug) {
      throw new Error('Codeplug not fetched. Call fetchCodeplug() first.')
    }

    await this.radio.connect()
    await this.radio.initialize()

    for (const channel of channels) {
      console.log('channel:', channel)
      const blockData = encodeChannelBlock(channel)

      await this.radio.writeBlock(channel.channelNumber + 1, blockData)

      blockData.copy(this.codeplug, (channel.channelNumber + 1) * 32, 0, 32)
    }

    if (channels.length < 199) {
      const emptyBlock = Buffer.alloc(32)
      for (let blockNum = channels.length + 2; blockNum <= 199; blockNum++) {
        await this.radio.writeBlock(blockNum, emptyBlock)

        // IMPORTANT: Also clear these channels in the in-memory codeplug
        emptyBlock.copy(this.codeplug, blockNum * 32, 0, 32)
      }
    }

    await this.radio.restart()
  }

  /**
   * Reads and decodes group data from the codeplug.
   */
  async readGroups(): Promise<Group[]> {
    if (!this.codeplug) {
      throw new Error('Codeplug not fetched. Call fetchCodeplug() first.')
    }

    // Groups are stored in blocks 228-231
    const groupBlocks = [
      this.codeplug.subarray(228 * 32, 229 * 32),
      this.codeplug.subarray(229 * 32, 230 * 32),
      this.codeplug.subarray(230 * 32, 231 * 32),
      this.codeplug.subarray(231 * 32, 232 * 32)
    ]

    const fullData = Buffer.concat([
      groupBlocks[0].subarray(16), // First 16 bytes of block 228 are before our data
      groupBlocks[1], // Full block 229
      groupBlocks[2], // Full block 230
      groupBlocks[3].subarray(0, 16) // First 16 bytes of block 231
    ])

    const groups: Group[] = []
    for (let i = 0; i < 15; i++) {
      const offset = i * 6
      const nameData = fullData.subarray(offset, offset + 5)
      const label = nameData
        .toString('ascii')
        .replace(/\0/g, ' ') // Replace nulls with spaces
        .replace(/[^\x20-\x7E]/g, '') // Filter non-printable ASCII
        .trim()

      groups.push({
        group: String.fromCharCode(65 + i), // A-O
        label
      })
    }
    return groups
  }

  /**
   * Updates groups in the codeplug.
   */
  async updateGroups(groups: Group[]): Promise<void> {
    if (!this.codeplug) {
      throw new Error('Codeplug not fetched. Call fetchCodeplug() first.')
    }

    // Groups are stored in blocks 228-231
    const groupBlocks = [
      this.codeplug.subarray(228 * 32, 229 * 32), // Block 228
      this.codeplug.subarray(229 * 32, 230 * 32), // Block 229
      this.codeplug.subarray(230 * 32, 231 * 32), // Block 230
      this.codeplug.subarray(231 * 32, 232 * 32) // Block 231
    ]

    // Create a buffer to hold the full group data (96 bytes)
    const fullData = Buffer.alloc(96) // 15 groups * 6 bytes + padding

    // Write group data to the buffer
    groups.forEach((group, i) => {
      const offset = i * 6
      const label = group.label.padEnd(5, '\0').substring(0, 5) // Ensure 5 characters
      fullData.write(label, offset, 5, 'ascii') // Write label (5 bytes)
      fullData.writeUInt8(0, offset + 5) // Null terminator (1 byte)
    })

    // Split the full data back into the original blocks
    groupBlocks[0].fill(0) // Clear block 228
    groupBlocks[1].fill(0) // Clear block 229
    groupBlocks[2].fill(0) // Clear block 230
    groupBlocks[3].fill(0) // Clear block 231

    // Copy the first 16 bytes of fullData to block 228 (offset 16)
    fullData.subarray(0, 16).copy(groupBlocks[0], 16)

    // Copy the next 32 bytes of fullData to block 229
    fullData.subarray(16, 48).copy(groupBlocks[1])

    // Copy the next 32 bytes of fullData to block 230
    fullData.subarray(48, 80).copy(groupBlocks[2])

    // Copy the remaining 16 bytes of fullData to block 231
    fullData.subarray(80, 96).copy(groupBlocks[3], 0, 16)

    // Write the updated blocks back to the codeplug
    const blockNumbers = [228, 229, 230, 231]
    for (let i = 0; i < blockNumbers.length; i++) {
      await this.radio.writeBlock(blockNumbers[i], groupBlocks[i])
    }

    this.radio.restart()
  }

  /**
   * Reads and decodes settings from the codeplug.
   */
  async readSettings(): Promise<RadioSettings> {
    if (!this.codeplug) {
      throw new Error('Codeplug not fetched. Call fetchCodeplug() first.')
    }

    // Settings are stored in blocks 200-203
    const settingsBlocks = [
      this.codeplug.subarray(200 * 32, 201 * 32),
      this.codeplug.subarray(201 * 32, 202 * 32),
      this.codeplug.subarray(202 * 32, 203 * 32),
      this.codeplug.subarray(203 * 32, 204 * 32)
    ]

    const settingsBuffer = Buffer.concat(settingsBlocks)
    return readSettings(this.radio, settingsBuffer)
  }

  /**
   * Reads and decodes band plan data from the codeplug.
   */
  async readBandPlan(): Promise<Band[]> {
    if (!this.codeplug) {
      throw new Error('Codeplug not fetched. Call fetchCodeplug() first.')
    }

    // Band plan is stored in blocks 0xD0-0xD6
    const bandBlocks = []
    for (let blockNum = 0xd0; blockNum <= 0xd6; blockNum++) {
      bandBlocks.push(this.codeplug.subarray(blockNum * 32, (blockNum + 1) * 32))
    }
    const bands = decodeBandPlan(bandBlocks)
    console.log('Band plan:', bands)
    return bands
  }

  /**
   * Reads and decodes scan preset data from the codeplug.
   */
  async readScanPresets(): Promise<ScanPreset[]> {
    if (!this.codeplug) {
      throw new Error('Codeplug not fetched. Call fetchCodeplug() first.')
    }

    const presets: ScanPreset[] = []

    // Scan presets are stored at 0x1B00 (block 432)
    // Each preset is 20 bytes, and there are 20 presets
    const startBlock = 216 // 0x1B00
    const bytesPerPreset = 20
    const totalPresets = 20
    const totalBytes = bytesPerPreset * totalPresets // 400 bytes

    // Create a buffer for all presets data
    const presetsBuffer = Buffer.alloc(totalBytes)

    console.log(
      `Reading scan presets: ${totalBytes} bytes from ${startBlock} to ${startBlock + Math.ceil(totalBytes / 32) - 1}`
    )

    // Extract the preset data from the codeplug
    let presetsOffset = 0
    for (let blockNum = startBlock; presetsOffset < totalBytes; blockNum++) {
      const blockData = this.codeplug.subarray(blockNum * 32, (blockNum + 1) * 32)
      const bytesToCopy = Math.min(32, totalBytes - presetsOffset)

      blockData.copy(presetsBuffer, presetsOffset, 0, bytesToCopy)
      presetsOffset += bytesToCopy

      console.log(
        `Read block ${blockNum}: copied ${bytesToCopy} bytes, total ${presetsOffset}/${totalBytes}`
      )
    }

    // Now extract each preset from the buffer
    for (let i = 0; i < totalPresets; i++) {
      const presetData = presetsBuffer.subarray(i * bytesPerPreset, (i + 1) * bytesPerPreset)
      console.log(
        `Preset ${i + 1} raw data:`,
        Array.from(presetData)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' ')
      )

      const preset = decodeScanPresetBlock(presetData, i+1)
      if (preset) {
        console.log(`Decoded preset ${i + 1}:`, preset)
        presets.push(preset)
      } else {
        console.log(`Preset ${i + 1} was null`)
      }
    }

    return presets
  }

  /**
   * Writes scan preset data to the radio.
   */
  async writeScanPresets(presets: ScanPreset[]): Promise<void> {
    if (!this.codeplug) {
      throw new Error('Codeplug not fetched. Call fetchCodeplug() first.')
    }

    await this.radio.connect()
    await this.radio.initialize()

    console.log(presets)

    // Create a buffer to hold all scan preset data (20 bytes * 20 presets)
    const presetsBuffer = Buffer.alloc(20 * 20, 0) // Initialize with zeros

    // Filter out invalid preset numbers and sort by presetNumber
    const validPresets = presets.filter(p => p.presetNumber >= 0 && p.presetNumber <= 20);
    const sortedPresets = validPresets.sort((a, b) => a.presetNumber - b.presetNumber)

    console.log(`Writing ${sortedPresets.length} scan presets`)

    // Encode each preset into the buffer at the position specified by presetNumber
    for (const preset of sortedPresets) {
      console.log(`Writing scan preset ${preset.presetNumber}:`, preset)
      const presetData = encodeScanPresetBlock(preset)

      // Use presetNumber (1-based) to determine where to write in the buffer
      const bufferOffset = preset.presetNumber * 20

      // Verify we're writing within buffer boundaries (this check is redundant now but kept for safety)
      if (bufferOffset >= 0 && bufferOffset + 20 <= presetsBuffer.length) {
        presetData.copy(presetsBuffer, bufferOffset, 0, 20)
        console.log(`Encoded preset ${preset.presetNumber} at offset ${bufferOffset}`)
      } else {
        console.warn(`Preset ${preset.presetNumber} is out of range (offset: ${bufferOffset})`)
      }
    }

    // Write data in 32-byte blocks to the radio
    const startBlock = 216 // 0x1B00
    const totalBytes = presetsBuffer.length

    console.log(
      `Writing ${totalBytes} bytes of scan preset data to blocks ${startBlock}-${startBlock + Math.ceil(totalBytes / 32) - 1}`
    )

    // Write in 32-byte blocks
    for (let offset = 0; offset < totalBytes; offset += 32) {
      const blockData = Buffer.alloc(32)
      const bytesToCopy = Math.min(32, totalBytes - offset)

      // Copy data from presets buffer to block
      presetsBuffer.copy(blockData, 0, offset, offset + bytesToCopy)

      // Calculate block number
      const blockNum = startBlock + Math.floor(offset / 32)

      console.log(`Writing block ${blockNum}: ${bytesToCopy} bytes from offset ${offset}`)

      // Write the block to the radio
      await this.radio.writeBlock(blockNum, blockData)

      // Also update the in-memory codeplug
      blockData.copy(this.codeplug, blockNum * 32, 0, 32)
    }

    console.log('Scan presets written successfully')
    await this.radio.restart()
  }
}

export default CodeplugService
