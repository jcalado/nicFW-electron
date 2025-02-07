import chalk from "chalk";
import fs from "fs";
import RadioCommunicator from "../radio/radio-communicator.js";

export function flashFirmwareCommand(program) {
  program
    .command("flash-firmware")
    .description("Flash firmware to the device")
    .requiredOption("-p, --port <path>", "Serial port path")
    .requiredOption("-f, --firmware <file>", "Path to firmware file")
    .action(async (cmd) => {
      try {
        // Read and prepare firmware
        const firmwareData = fs.readFileSync(cmd.firmware);
        const fileSize = firmwareData.length;
        const paddedSize = Math.ceil(fileSize / 32) * 32;
        const firmware = Buffer.alloc(paddedSize, 0);
        firmwareData.copy(firmware);

        // Connect and flash
        const radio = new RadioCommunicator(cmd.port);
        await radio.connect();

        console.log(
          chalk.yellow(
            'Put radio in bootloader mode:\n' +
            '1. Turn radio OFF\n' +
            '2. Press and hold PTT (H3) or Flashlight (H8) button\n' +
            '3. Turn radio ON while holding button\n' +
            '4. Release button when instructed'
          )
        );

        await radio.flashFirmware(firmware);

        // Restart the radio
        await radio.restart();

        console.log(chalk.green.bold('Firmware flash successful!'));
      } catch (error) {
        console.error(chalk.red.bold('Flash failed:'), error.message);
      }
    });
}