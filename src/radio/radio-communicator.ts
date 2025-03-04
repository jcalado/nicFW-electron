import { SerialPort, SerialPortOpenOptions } from 'serialport'
import EventEmitter from 'events'

interface CommandOptions {
  waitForResponse?: boolean
  expectedLength?: number
  timeout?: number
}

interface Operation {
  checkData: () => void
}

class RadioCommunicator extends EventEmitter {
  private port: SerialPort | null
  private portPath: string | null
  private currentBaudRate: number
  private buffer: Buffer
  private currentOperation: Operation | null
  private isOpen: boolean

  constructor(portPath?: string) {
    super()
    this.port = null
    this.portPath = portPath || null
    this.currentBaudRate = 38400 // Default baud rate 38400
    this.buffer = Buffer.alloc(0)
    this.currentOperation = null
    this.isOpen = false // Initialize isOpen flag
  }

  setPortPath(portPath: string): void {
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

  get currentPortPath(): string {
    return this.portPath || ''
  }

  async openPort(): Promise<void> {
    this.port?.open()
  }

  get portAvailable(): boolean {
    return Boolean(this.port && this.port.isOpen)
  }

  async setBaudRate(newBaudRate: number): Promise<void> {
    if (this.currentBaudRate === newBaudRate) return
    if (!this.port || !this.port.isOpen) {
      // Check if port exists and is open
      throw new Error('Port is not open')
    }

    return new Promise<void>((resolve, reject) => {
      this.port!.update({ baudRate: newBaudRate }, (err) => {
        if (err) reject(err)
        else {
          this.currentBaudRate = newBaudRate
          resolve()
        }
      })
    })
  }

  async connect(): Promise<void> {
    if (!this.portPath) {
      throw new Error('Port path is not set')
    }

    if (this.isOpen) {
      return // If already open, resolve immediately
    }

    // Close existing port if it exists
    if (this.port) {
      await this.disconnect()
    }

    this.port = new SerialPort({
      path: this.portPath,
      baudRate: this.currentBaudRate,
      autoOpen: false
    } as SerialPortOpenOptions<any>)

    return new Promise<void>((resolve, reject) => {
      this.port!.open((err) => {
        if (err) {
          reject(err)
          return
        }
        this.isOpen = true // Set the isOpen flag
        this.port!.on('data', (data) => this.handleData(data))
        this.port!.on('error', (err) => this.emit('error', err))
        resolve()
      })
    })
  }

  async disconnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.port || !this.port.isOpen) {
        this.isOpen = false
        resolve()
        return
      }

      this.port.close((err) => {
        this.isOpen = false
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  private handleData(data: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, data])
    if (this.currentOperation) {
      this.currentOperation.checkData()
    }
  }

  /**
   * Sends a command to the serial port.
   * @param command - The command to send. If a string, it is converted to a Buffer using utf8 encoding.
   * @param options - Additional options for the operation.
   * @returns A Promise that resolves with the response from the device or rejects on error.
   */
  async executeCommand(
    command: Buffer | string,
    options: CommandOptions = {}
  ): Promise<Buffer | void> {
    if (!this.port || !this.port.isOpen) {
      throw new Error('Port is not open')
    }

    const { waitForResponse = true, expectedLength, timeout = 2000 } = options
    const cmdBuffer = Buffer.isBuffer(command) ? command : Buffer.from(command, 'utf8')

    return new Promise<Buffer | void>((resolve, reject) => {
      if (!waitForResponse) {
        this.port!.write(cmdBuffer, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
        return
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

      this.port!.write(cmdBuffer, (err) => {
        if (err) {
          clearTimeout(timer)
          this.currentOperation = null
          reject(err)
        }
      })
    })
  }

  async initialize(): Promise<Buffer | void> {
    return await this.executeCommand(Buffer.from([0x45]), { expectedLength: 1 })
  }

  async readBlock(blockNumber: number): Promise<Buffer> {
    const response = (await this.executeCommand(Buffer.from([0x30, blockNumber]), {
      expectedLength: 34
    })) as Buffer

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

  async writeBlock(blockNumber: number, data: Buffer): Promise<boolean> {
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
      waitForResponse: false
    })

    await this.executeCommand(blockWithChecksum, { expectedLength: 1 })

    return true
  }

  calculateChecksum(data: Buffer): number {
    return data.reduce((sum, byte) => sum + byte, 0) & 0xff
  }

  async close(): Promise<void> {
    return this.disconnect()
  }

  async restart(): Promise<void> {
    // Restart the radio
    await this.executeCommand(Buffer.from([0x49]), {
      waitForResponse: false
    })
  }

  async flashFirmware(
    firmware: Buffer,
    progressCallback?: (progress: number) => void
  ): Promise<void> {
    const originalBaud = this.currentBaudRate

    // Close existing connection
    await this.disconnect()

    // Open new connection at high baud rate
    this.port = new SerialPort({
      path: this.portPath,
      baudRate: 115200,
      autoOpen: false
    } as SerialPortOpenOptions<any>)

    return new Promise<void>((resolve, reject) => {
      this.port!.open(async (openErr) => {
        if (openErr) {
          reject(openErr)
          return
        }

        this.isOpen = true

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

          let currentBlock = 0
          const totalBlocks = Math.ceil(firmware.length / 32)
          let flashStarted = false
          let initTimeout: NodeJS.Timeout

          const cleanup = () => {
            if (this.port) {
              this.port.removeAllListeners('data')
              this.port.on('data', this.handleData.bind(this))
            }
            clearTimeout(initTimeout)
          }

          const handleInitData = (data: Buffer) => {
            for (const byte of data) {
              if (byte === 0xa5) {
                if (!flashStarted) {
                  flashStarted = true
                  this.port!.write(initSequence)

                  setTimeout(startFlashing, 500)
                  this.port!.removeListener('data', handleInitData)
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
            const end = Math.min(start + 32, firmware.length)
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
            const waitForAck = (data: Buffer) => {
              for (const byte of data) {
                if (byte === 0xa3) {
                  this.port!.removeListener('data', waitForAck)
                  currentBlock++
                  updateProgress()

                  // Send next block only after receiving 0xA3
                  sendNextBlock()
                  return
                }
              }
            }

            // Listen for 0xA3 acknowledgment
            if (this.port) {
              this.port.removeAllListeners('data')
              this.port.on('data', waitForAck)

              // Send current block
              this.port.write(packet, (err) => {
                if (err) return finishFlashing(err)
              })
            }
          }

          const updateProgress = () => {
            const percent = Math.floor((currentBlock / totalBlocks) * 100)
            if (progressCallback) {
              progressCallback(percent)
            }
          }

          const startFlashing = () => {
            sendNextBlock()
          }

          const finishFlashing = (error?: Error) => {
            cleanup()
            if (error) {
              reject(error)
            } else {
              resolve()
            }

            // Restore original baud rate
            setTimeout(async () => {
              try {
                await this.disconnect()
                this.port = new SerialPort({
                  path: this.portPath,
                  baudRate: originalBaud,
                  autoOpen: false
                } as SerialPortOpenOptions<any>)
                await this.connect()
              } catch (err) {
                console.error('Failed to restore original baud rate:', err)
              }
            }, 1000)
          }

          // Initial setup
          this.port!.removeAllListeners('data')
          this.port!.on('data', handleInitData)

          // Set timeout for bootloader detection
          initTimeout = setTimeout(() => {
            cleanup()
            reject(new Error('Timed out waiting for bootloader response'))
          }, 10000)
        } catch (error) {
          await this.disconnect()
          reject(error)
        }
      })
    })
  }

  // Uncomment if needed
  /*
  async readCodeplug(progressCallback?: (progress: number) => void): Promise<Buffer> {
    try {
      const codeplug = Buffer.alloc(8192);
      for (let blockNum = 0; blockNum < 256; blockNum++) {
        const blockData = await this.readBlock(blockNum);
        blockData.copy(codeplug, blockNum * 32);
        if (progressCallback) {
          const percent = Math.floor(((blockNum + 1) / 256) * 100);
          progressCallback(percent);
        }
      }

      await this.executeCommand(Buffer.from([0x46]), { expectedLength: 1 });
      return codeplug;
    } finally {
      // Don't close the connection here, let the caller decide
    }
  }
  */
}

export default RadioCommunicator
