import { SerialPort } from 'serialport'

class SerialConnection {
  /**
   * Enumerates serial ports on the system.
   * @returns {Promise<Array<object>>} A Promise that resolves with an array of port objects.
   * Each port object contains information about the port (path, manufacturer, etc.).
   * Returns an empty array if no ports are found or an error occurs.
   */
  async getSerialPorts() {
    try {
      const ports = await SerialPort.list()
      return ports
        .filter((port) => port.path.includes('ttyUSB'))
        .map((port) => ({
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
   * @param {string} path The path of the serial port to open.
   * @param {object} options Options for the SerialPort constructor (baudRate, etc.).
   * @returns {Promise<SerialPort>} A Promise that resolves with a new SerialPort instance.
   * @throws {Error} If the port cannot be opened.
   */
  async openPort(path: string, options: object): Promise<SerialPort> {
    return new Promise((resolve, reject) => {
      const port = new SerialPort({path, ...options})

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
   * @param {SerialPort} port The SerialPort instance to close.
   * @returns {Promise<void>} A Promise that resolves when the port is closed.
   */
  async closePort(port) {
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
   * @param {SerialPort} port The SerialPort instance to write to.
   * @param {Buffer|string} data The data to write.
   * @returns {Promise<void>} A Promise that resolves when the data is written.
   */
  async writeData(port, data) {
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
   * @param {SerialPort} port The SerialPort instance to read from.
   * @param {function} dataHandler A function to handle incoming data.
   * @param {function} errorHandler A function to handle errors.
   */
  readData(port, dataHandler, errorHandler) {
    port.on('data', dataHandler)
    port.on('error', errorHandler)
  }

  /**
   * Lists available baud rates.
   * @returns {Array<number>} An array of commonly used baud rates.
   */
  getBaudRates() {
    return [
      110, 300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 74880, 115200, 230400,
      250000, 500000, 1000000, 2000000, 3000000, 4000000, 8000000, 9000000
    ]
  }
}

export default SerialConnection
