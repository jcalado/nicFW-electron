export async function readGroupLabels(radio) {
  // Read 4 blocks (228-231) containing the 96-byte group label area
  const blocks = [
    await radio.readBlock(228), // 0xE4
    await radio.readBlock(229), // 0xE5
    await radio.readBlock(230), // 0xE6
    await radio.readBlock(231), // 0xE7
  ];

  // Combine blocks and extract the 96-byte region starting at address 7312
  const fullData = Buffer.concat([
    blocks[0].subarray(16), // First 16 bytes of block 228 are before our data
    blocks[1], // Full block 229
    blocks[2], // Full block 230
    blocks[3].subarray(0, 16), // First 16 bytes of block 231
  ]);

  const labels = [];
  for (let i = 0; i < 15; i++) {
    const offset = i * 6;
    const nameData = fullData.subarray(offset, offset + 5);
    const label = nameData
      .toString("ascii")
      .replace(/\0/g, " ") // Replace nulls with spaces
      .replace(/[^\x20-\x7E]/g, "") // Filter non-printable ASCII
      .trim();

    labels.push({
      group: String.fromCharCode(65 + i), // A-O
      label,
    });
  }

  return labels;
}

export async function writeGroupLabel(radio, index, name) {
  if (index < 0 || index > 14) throw new Error("Invalid group index (0-14)");

  // Calculate exact EEPROM address (7312 + index * 6)
  const eepromAddress = 7312 + index * 6;

  // Determine which blocks need to be modified
  const startBlock = Math.floor(eepromAddress / 32);
  const endBlock = Math.floor((eepromAddress + 5) / 32); // 6 bytes might span 2 blocks

  // Read affected blocks
  const blocks = new Map();
  for (let blockNum = startBlock; blockNum <= endBlock; blockNum++) {
    blocks.set(blockNum, await radio.readBlock(blockNum));
  }

  // Calculate position within first block
  const blockOffset = eepromAddress % 32;

  // Encode the label data (5 chars + null terminator)
  const labelData = Buffer.alloc(6, 0);
  const cleanName = name.trim().slice(0, 5);

  labelData.write(cleanName, 0, 5, "ascii");

  // Split data across blocks if needed
  const bytesInFirstBlock = Math.min(6, 32 - blockOffset);
  labelData.subarray(0, bytesInFirstBlock).copy(blocks.get(startBlock), blockOffset);

  if (bytesInFirstBlock < 6) {
    // Handle cross-block write
    const remainingBytes = 6 - bytesInFirstBlock;
    labelData.subarray(bytesInFirstBlock).copy(blocks.get(endBlock), 0);
  }

  // Write modified blocks back
  for (const [blockNum, blockData] of blocks) {
    await radio.writeBlock(blockNum, blockData);
  }
}
