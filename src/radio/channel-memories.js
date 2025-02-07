import {
  toGroupString,
  toToneString,
  toToneWord,
  toGroupWord,
} from "../utils/converters.js";

function decodeChannelBlock(block) {
  const rx = block.readUInt32LE(0);
  if (rx === 0) return null;

  return {
    rxFreq: rx / 100000,
    txFreq: block.readUInt32LE(4) / 100000,
    rxTone: toToneString(block.readUInt16LE(8)),
    txTone: toToneString(block.readUInt16LE(10)),
    txPower: block[12],
    groups: toGroupString(block.readUInt16LE(13)),
    bandwidth: block[15] & 0x01 ? "Wide" : "Narrow",
    modulation:
      ["FM", "NFM", "AM", "USB"][(block[15] >> 1) & 0x03] || "Unknown",
    name: block.subarray(20, 32).toString("ascii").replace(/\x00/g, ""),
  };
}

export async function readChannelMemories(radio) {
  const channels = [];

  for (let blockNum = 2; blockNum <= 199; blockNum++) {
    try {
      const block = await radio.readBlock(blockNum);
      const channel = decodeChannelBlock(block);
      if (channel) {
        channels.push({
          channelNumber: blockNum - 1,
          ...channel,
        });
      }
    } catch (error) {
      console.error(`Error reading channel ${blockNum - 1}:`, error.message);
    }
  }

  return channels;
}

export function encodeChannelBlock(channel) {
  const block = Buffer.alloc(32);

  // RX Frequency (4 bytes)
  block.writeUInt32LE(Math.round(channel.rxFreq * 100000), 0);

  // TX Frequency (4 bytes)
  block.writeUInt32LE(Math.round(channel.txFreq * 100000), 4);

  // RX Tone (2 bytes)
  block.writeUInt16LE(toToneWord(channel.rxTone), 8);

  // TX Tone (2 bytes)
  block.writeUInt16LE(toToneWord(channel.txTone), 10);

  // TX Power (1 byte)
  block.writeUInt8(channel.txPower, 12);

  // Groups (2 bytes)
  block.writeUInt16LE(toGroupWord(channel.groups), 13);

  // Bandwidth + Modulation (1 byte)
  const bw = channel.bandwidth === "Wide" ? 0 : 1;
  const mod = ["FM", "NFM", "AM", "USB"].indexOf(channel.modulation);
  block.writeUInt8((mod << 1) | bw, 15);

  // Channel Name (12 bytes)
  const nameBuf = Buffer.from(channel.name.substring(0, 12), "ascii");
  nameBuf.copy(block, 20);

  // Calculate checksum
  block[32] = block.slice(0, 32).reduce((sum, byte) => sum + byte, 0) & 0xff;

  return block;
}