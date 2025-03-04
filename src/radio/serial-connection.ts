import { SerialPort } from 'serialport'

interface SerialPortInfo {
  path: string
  manufacturer?: string
  serialNumber?: string
  pnpId?: string
  vendorId?: string
  productId?: string
}

class SerialConnection {
  /**
   * Enumerates serial ports on the system.
   * @returns A Promise that resolves with an array of port objects.
   * Each port object contains information about the port (path, manufacturer, etc.).
   * Returns an empty array if no ports are found or an error occurs.
   */
  async getSerialPorts(): Promise<SerialPortInfo[]> {
    try {
      const ports = await SerialPort.list()
      return ports.map((port) => ({
        path: port.path,
        manufacturer: port.manufacturer,
        serialNumber: port.serialNumber,
        pnpId: port.pnpId,
        vendorId: port.vendorId,
        productId: port.productId
      }))
    } catch (error) {
      console.error('Error listing serial ports:', error)
      return [] // Return an empty array in case of error
    }
  }

  /**
   * Opens a serial port.
   * @param path The path of the serial port to open.
   * @param options Options for the SerialPort constructor (baudRate, etc.).
   * @returns A Promise that resolves with a new SerialPort instance.
   * @throws {Error} If the port cannot be opened.
   */
  async openPort(path: string, options: any): Promise<SerialPort> {
    return new Promise((resolve, reject) => {
      const port = new SerialPort({ path, ...options })

      port.on('open', () => {
        resolve(port)
      })

      port.on('error', (err) => {
        reject(err)
      })
    })
  }

  /**
   * Closes a serial port.
   * @param port The SerialPort instance to close.
   * @returns A Promise that resolves when the port is closed.
   */
  async closePort(port: SerialPort): Promise<void> {
    return new Promise((resolve, reject) => {
      port.close((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * Writes data to a serial port.
   * @param port The SerialPort instance to write to.
   * @param data The data to write.
   * @returns A Promise that resolves when the data is written.
   */
  async writeData(port: SerialPort, data: Buffer | string): Promise<void> {
    return new Promise((resolve, reject) => {
      port.write(data, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * Reads data from a serial port. (Handles data events internally).
   * @param port The SerialPort instance to read from.
   * @param dataHandler A function to handle incoming data.
   * @param errorHandler A function to handle errors.
   */
  readData(
    port: SerialPort,
    dataHandler: (data: Buffer) => void,
    errorHandler: (error: Error) => void
  ): void {
    port.on('data', dataHandler)
    port.on('error', errorHandler)
  }

  /**
   * Lists available baud rates.
   * @returns An array of commonly used baud rates.
   */
  getBaudRates(): number[] {
    return [
      110, 300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 74880, 115200, 230400,
      250000, 500000, 1000000, 2000000, 3000000, 4000000, 8000000, 9000000
    ]
  }
}

export default SerialConnection
