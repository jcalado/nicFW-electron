import { toDecimalFreq } from "../utils/converters.js";

const BAND_MODULATION = [
  "Ignore",
  "FM",
  "AM",
  "USB",
  "Enforce FM",
  "Enforce AM",
  "Enforce USB",
  "Enforce None",
];

const BAND_BANDWIDTH = [
  "Ignore",
  "Wide",
  "Narrow",
  "Enforce Wide",
  "Enforce Narrow",
  "FM Tuner",
];

export function decodeBandPlan(blocks) {
  const fullBlock = Buffer.concat(blocks);

  // Validate magic numbers
  if (fullBlock[0] !== 0xa4 || fullBlock[1] !== 0x6d) {
    throw new Error("Invalid band plan magic numbers");
  }

  const bands = [];

  // 20 bands total (1-20) in 7 blocks of 3 bands each (last block has 2 bands + padding)
  for (let r = 1; r <= 20; r++) {
    const addr = 2 + (r - 1) * 10;
    const startFreq = toDecimalFreq(fullBlock.readUInt32BE(addr));
    const endFreq = toDecimalFreq(fullBlock.readUInt32BE(addr + 4));
    const maxPower = fullBlock[addr + 8];
    const flags = fullBlock[addr + 9];

    bands.push({
      bandNumber: r,
      start: startFreq >= 18 ? startFreq : 0,
      end: endFreq <= 1300 ? endFreq : 0,
      maxPower: maxPower || "Auto",
      txAllowed: !!(flags & 0x01),
      wrap: !!(flags & 0x02),
      modulation: BAND_MODULATION[(flags >> 2) & 0x07],
      bandwidth: BAND_BANDWIDTH[(flags >> 5) & 0x07],
    });
  }

  // Special handling for band 20
  bands[19] = {
    bandNumber: 20,
    start: 18.0,
    end: 1300.0,
    txAllowed: false,
    wrap: false,
    modulation: "Ignore",
    bandwidth: "Ignore",
    maxPower: "Auto",
  };

  return bands;
}

export async function readBandPlan(radio) {
  const blocks = [];

  try {
    // Disable radio during read
    await radio.executeCommand(Buffer.from([0x45]), { expectedLength: 1 });

    // Read 7 blocks (D0-D6)
    for (let blockNum = 0xd0; blockNum <= 0xd6; blockNum++) {
      const block = await radio.readBlock(blockNum);
      blocks.push(block.subarray(0, 32)); // Extract just the data payload
    }

    // Re-enable radio
    await radio.executeCommand(Buffer.from([0x46]), { expectedLength: 1 });
  } catch (error) {
    await radio.executeCommand(Buffer.from([0x46]), { expectedLength: 1 }); // Ensure radio re-enabled
    throw error;
  }

  return decodeBandPlan(blocks);
}
