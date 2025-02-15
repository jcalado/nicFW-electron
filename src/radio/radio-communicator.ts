import { SerialPort } from 'serialport'
import EventEmitter from 'events'
import fs from 'fs'

class RadioCommunicator extends EventEmitter {
  port: SerialPort | null
  constructor(portPath) {
    super()
    this.port = null
    this.portPath = portPath
    this.currentBaudRate = 38400 // Default baud rate 38400
    this.buffer = Buffer.alloc(0)
    this.currentOperation = null
  }

  setPortPath(portPath) {
    this.portPath = portPath
    if (this.port && this.port.isOpen) {
      // If port is open, close it before setting new path
      this.port.close((err) => {
        if (err) {
          console.error('Error closing port:', err)
        } else {
          this.port = null // Reset port after closing
          this.isOpen = false
        }
      })
    } else {
      this.port = null
      this.isOpen = false
    }
  }

  get currentPortPath() {
    return this.portPath
  }

  get portAvailable() {
    return this.port && this.port.isOpen
  }

  async setBaudRate(newBaudRate) {
    if (this.currentBaudRate === newBaudRate) return
    if (!this.port || !this.port.isOpen) {
      // Check if port exists and is open
      throw new Error('Port is not open')
    }
    await new Promise((resolve, reject) => {
      this.port.update({ baudRate: newBaudRate }, (err) => {
        if (err) reject(err)
        else {
          this.currentBaudRate = newBaudRate
          resolve()
        }
      })
    })
  }

  async connect() {
    if (!this.portPath) {
      throw new Error('Port path is not set')
    }

    if (this.isOpen) {
      // Check the isOpen flag
      return // If already open, resolve immediately
    }

    this.port = new SerialPort({
      path: this.portPath,
      baudRate: 38400,
      autoOpen: false
    })

    return new Promise((resolve, reject) => {
      this.port.open((err) => {
        if (err) {
          reject(err)
          return
        }
        this.isOpen = true // Set the isOpen flag
        this.port.on('data', (data) => this.handleData(data))
        resolve()
      })
    })
  }

  async disconnect() {
    return new Promise((resolve, reject) => {
      if (this.port && this.port.isOpen) {
        this.port.close((err) => {
          if (err) {
            reject(err)
            return
          }
          this.isOpen = false // Reset the flag when port is closed
          resolve()
        })
      } else {
        resolve() // Resolve immediately if the port is not open
      }
    })
  }

  handleData(data) {
    this.buffer = Buffer.concat([this.buffer, data])
    if (this.currentOperation) {
      this.currentOperation.checkData()
    }
  }

  /**
   * Sends a command to the serial port.
   * @param {Buffer|string} command - The command to send. If a string, it is converted to a Buffer using utf8 encoding.
   * @param {Object} options - Additional options for the operation.
   * @param {boolean} [options.waitForResponse=true] - Whether or not to wait for a response from the device.
   * @param {number} [options.expectedLength] - The expected length of the response, in bytes. Required if waitForResponse is true.
   * @param {number} [options.timeout=2000] - The timeout duration, in milliseconds. Ignored if waitForResponse is false.
   * @returns {Promise<Buffer>} A Promise that resolves with the response from the device or rejects on error.
   */
  async executeCommand(command, options = {}) {
    const { waitForResponse = true, expectedLength, timeout = 2000 } = options

    return new Promise((resolve, reject) => {
      if (!waitForResponse) {
        return this.port.write(command, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      }

      if (!expectedLength) {
        reject(new Error('expectedLength is required when waitForResponse is true'))
        return
      }

      const timer = setTimeout(() => {
        this.currentOperation = null
        reject(new Error(`Timeout after ${timeout}ms`))
      }, timeout)

      this.currentOperation = {
        checkData: () => {
          if (this.buffer.length >= expectedLength) {
            clearTimeout(timer)
            const response = this.buffer.slice(0, expectedLength)
            this.buffer = this.buffer.slice(expectedLength)
            this.currentOperation = null
            resolve(response)
          }
        }
      }

      this.port.write(command, (err) => {
        if (err) {
          clearTimeout(timer)
          this.currentOperation = null
          reject(err)
        }
      })
    })
  }

  async initialize() {
    await this.executeCommand(Buffer.from([0x45]), { expectedLength: 1 })
    // await this.executeCommand(Buffer.from([0x46]), 1);
  }

  async readBlock(blockNumber) {
    const response = await this.executeCommand(Buffer.from([0x30, blockNumber]), {
      expectedLength: 34
    })

    if (response[0] !== 0x30) {
      throw new Error(`Invalid response header: 0x${response[0].toString(16)}`)
    }

    const payload = response.subarray(1, 33)
    const checksum = response[33]
    const calculated = this.calculateChecksum(payload)

    if (checksum !== calculated) {
      throw new Error(
        `Checksum mismatch (received 0x${checksum.toString(
          16
        )}, calculated 0x${calculated.toString(16)})`
      )
    }

    return payload
  }

  async writeBlock(blockNumber, data) {
    if (data.length !== 32) {
      throw new Error('Block data must be exactly 32 bytes')
    }

    // Calculate checksum
    const checksum = this.calculateChecksum(data)

    await this.executeCommand(Buffer.from([0x45]), { expectedLength: 1 })

    // Prepare the write command
    const command = Buffer.from([0x31, blockNumber])
    const blockWithChecksum = Buffer.concat([data, Buffer.from([checksum])])

    // Send the command and block data
    await this.executeCommand(command, {
      expectedLength: 0,
      waitForResponse: false
    }) // Send write command
    await this.executeCommand(blockWithChecksum, { expectedLength: 1 }) // Send block data + checksum

    // Wait for ACK
    // const ack = await this.executeCommand(Buffer.from([0x31]), 1);
    // if (ack[0] !== 0x31) {
    //   throw new Error("Write operation failed: No ACK received");
    // }

    return true
  }

  calculateChecksum(data) {
    return data.reduce((sum, byte) => sum + byte, 0) & 0xff
  }

  async close() {
    return new Promise((resolve) => {
      this.port.close(resolve)
    })
  }

  async restart() {
    // Restart the radio
    await this.executeCommand(Buffer.from([0x49]), {
      expectedLength: 0,
      waitForResponse: false
    })
  }

  async flashFirmware(firmware: Buffer, progressCallback?: (progress: number) => void) {
    const originalBaud = this.currentBaudRate
    const totalBlocks = Math.ceil(firmware.length / 32)

    this.port.close()
    this.port = new SerialPort({
      path: this.portPath,
      baudRate: 115200,
      autoOpen: false
    })
    this.port.open()

    try {
      const initSequence = Buffer.from([
        0xa0,
        0xee,
        0x74,
        0x71,
        0x07,
        0x74,
        ...Array(30).fill(0x55)
      ])

      return new Promise((resolve, reject) => {
        let currentBlock = 0
        const totalBlocks = Math.ceil(firmware.length / 32)
        let flashStarted = false
        let initTimeout

        const cleanup = () => {
          this.port.removeAllListeners('data')
          this.port.on('data', this.handleData.bind(this))
          clearTimeout(initTimeout)
        }

        const handleInitData = (data) => {
          for (const byte of data) {
            if (byte === 0xa5) {
              if (!flashStarted) {
                flashStarted = true
                this.executeCommand(initSequence, {
                  expectedLength: 0,
                  waitForResponse: false
                })

                setTimeout(startFlashing, 500)
                this.port.removeListener('data', handleInitData)
                return
              }
            }
          }
        }

        const sendNextBlock = () => {
          if (currentBlock >= totalBlocks) {
            finishFlashing()
            return
          }

          const start = currentBlock * 32
          const end = start + 32
          let blockData = firmware.slice(start, end)
          if (blockData.length < 32) {
            blockData = Buffer.concat([blockData, Buffer.alloc(32 - blockData.length).fill(0xff)])
          }

          const packet = Buffer.alloc(36)
          packet[0] = currentBlock === totalBlocks - 1 ? 0xa2 : 0xa1
          packet.writeUInt16BE(currentBlock, 1)
          blockData.copy(packet, 4)
          packet[3] = blockData.reduce((sum, byte) => sum + byte, 0) & 0xff

          // Handler for waiting for 0xA3 acknowledgment
          const waitForAck = (data) => {
            for (const byte of data) {
              if (byte === 0xa3) {
                this.port.removeListener('data', waitForAck)
                currentBlock++
                updateProgress()

                // Send next block only after receiving 0xA3
                sendNextBlock()
                return
              }
            }
          }

          // Listen for 0xA3 acknowledgment
          this.port.removeAllListeners('data')
          this.port.on('data', waitForAck)

          // Send current block
          this.port.write(packet, (err) => {
            if (err) return finishFlashing(err)
          })
        }

        const updateProgress = () => {
          const percent = ((currentBlock / totalBlocks) * 100).toFixed(1)
          process.stdout.write(`\rFlashing progress: ${percent}%`)
          progressCallback(percent)
          if (currentBlock >= totalBlocks) process.stdout.write('\n')
        }

        const startFlashing = () => {
          sendNextBlock()
        }

        const finishFlashing = (error) => {
          cleanup()
          error ? reject(error) : resolve()
        }

        // Initial setup
        this.port.removeAllListeners('data')
        this.port.on('data', handleInitData)
      })
    } finally {
      await this.setBaudRate(originalBaud)
    }
  }

  // async readCodeplug(progressCallback?: (progress: number) => void) {
  //   try {
  //     const codeplug = Buffer.alloc(8192)
  //     for (let blockNum = 0; blockNum < 256; blockNum++) {
  //       const blockData = await this.readBlock(blockNum)
  //       blockData.copy(codeplug, blockNum * 32)
  //       let percent = (((blockNum + 1) / 256) * 100).toFixed(0)
  //       progressCallback(percent)
  //     }

  //     await this.executeCommand(Buffer.from([0x46]), { expectedLength: 1 })


  //     return codeplug
  //   } finally {
  //     await this.close()
  //   }
  // }
}

export default RadioCommunicator
