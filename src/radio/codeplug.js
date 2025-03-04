import fs from 'fs'

/**
 * Reads the codeplug from the specified radio port and saves it to a file.
 *
 * @param {string} portPath - The path to the radio port.
 * @param {string} outputFile - The path to the output file where the codeplug will be saved.
 * @returns {Promise<void>} A promise that resolves when the codeplug has been read and saved.
 * @throws Will throw an error if the radio connection or file operations fail.
 */
export async function readCodeplug(radio, progressCallback) {
  try {
    // await radio.connect();

    // await radio.executeCommand(Buffer.from([0x45]), { expectedLength: 1 });

    const codeplug = Buffer.alloc(8192)
    for (let blockNum = 0; blockNum < 256; blockNum++) {
      const blockData = await radio.readBlock(blockNum)
      blockData.copy(codeplug, blockNum * 32)

      let percent = (((blockNum + 1) / 256) * 100).toFixed(0)
      progressCallback(percent)
    }

    await radio.executeCommand(Buffer.from([0x46]), { expectedLength: 1 })

    return codeplug
  } finally {
    await radio.close()
  }
}

export async function writeCodeplug(radio, codeplug, progressCallback) {

  try {
    if (codeplug.length !== 8192) {
      throw new Error('Invalid codeplug size (must be 8192 bytes)')
    } else {
      console.log('Codeplug size is valid')
    }


    if (!radio.portAvailable) {
      await radio.port?.open()
    }

    await radio.executeCommand(Buffer.from([0x45]), { expectedLength: 1 })

    for (let blockNum = 0; blockNum < 256; blockNum++) {
      const blockData = codeplug.subarray(blockNum * 32, (blockNum + 1) * 32)
      const checksum = radio.calculateChecksum(blockData)

      await radio.executeCommand(Buffer.from([0x31, blockNum]), {
        waitForResponse: false
      })

      const response = await radio.executeCommand(
        Buffer.concat([blockData, Buffer.from([checksum])]),
        { expectedLength: 1, timeout: 3000 }
      )

      if (response[0] !== 0x31) {
        throw new Error(`Verification failed at block ${blockNum}`)
      }

      let percent = (((blockNum + 1) / 256) * 100).toFixed(0)
      progressCallback(percent)
    }

    await radio.executeCommand(Buffer.from([0x46]), { expectedLength: 1 })
    await radio.restart()

    console.log('\nCodeplug write successful! Radio restarting...')
  } finally {
    await radio.close()
  }
}


export async function saveCodeplug(codeplug, filePath) {
  fs.writeFileSync(filePath, codeplug)
}
