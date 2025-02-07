import fs from 'fs';
import chalk from 'chalk';
import RadioCommunicator from './radio-communicator.js';

export async function readCodeplug(portPath, outputFile) {
  const radio = new RadioCommunicator(portPath);

  try {
    await radio.connect();

    await radio.executeCommand(Buffer.from([0x45]), { expectedLength: 1 });

    const codeplug = Buffer.alloc(8192);
    for (let blockNum = 0; blockNum < 256; blockNum++) {
      const blockData = await radio.readBlock(blockNum);
      blockData.copy(codeplug, blockNum * 32);

      process.stdout.write(
        `\rReading block ${blockNum.toString().padStart(3)}/255 (${(
          ((blockNum + 1) / 256) *
          100
        ).toFixed(1)}%)`
      );
    }

    await radio.executeCommand(Buffer.from([0x46]), { expectedLength: 1 });
    fs.writeFileSync(outputFile, codeplug);

    console.log(chalk.green(`\nCodeplug saved to ${outputFile} (${codeplug.length} bytes)`));
  } finally {
    await radio.close();
  }
}

export async function writeCodeplug(portPath, filePath) {
  const radio = new RadioCommunicator(portPath);

  try {
    const codeplug = fs.readFileSync(filePath);
    if (codeplug.length !== 8192) {
      throw new Error("Invalid codeplug size (must be 8192 bytes)");
    }

    await radio.connect();
    console.log(chalk.yellow("Starting codeplug write - DO NOT INTERRUPT!"));

    await radio.executeCommand(Buffer.from([0x45]), { expectedLength: 1 });

    for (let blockNum = 0; blockNum < 256; blockNum++) {
      const blockData = codeplug.subarray(blockNum * 32, (blockNum + 1) * 32);
      const checksum = radio.calculateChecksum(blockData);

      await radio.executeCommand(Buffer.from([0x31, blockNum]), {
        waitForResponse: false,
      });

      const response = await radio.executeCommand(
        Buffer.concat([blockData, Buffer.from([checksum])]),
        { expectedLength: 1, timeout: 3000 }
      );

      if (response[0] !== 0x31) {
        throw new Error(`Verification failed at block ${blockNum}`);
      }

      process.stdout.write(
        `\rWriting block ${blockNum.toString().padStart(3)}/255 (${(
          ((blockNum + 1) / 256) *
          100
        ).toFixed(1)}%)`
      );
    }

    await radio.executeCommand(Buffer.from([0x46]), { expectedLength: 1 });
    await radio.restart();

    console.log(chalk.green("\nCodeplug write successful! Radio restarting..."));
  } finally {
    await radio.close();
  }
}