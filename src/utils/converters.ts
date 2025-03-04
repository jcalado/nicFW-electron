import { ChannelGroups } from '../main/types'

export function toDecimalFreq(bkfreq) {
  return (bkfreq >>> 0) / 100000;
}

export function fromGroupBytes(byte1: number, byte2: number): ChannelGroups {
  return {
    g0: byte1 & 0x0F,           // Lower 4 bits of first byte
    g1: (byte1 & 0xF0) >> 4,    // Upper 4 bits of first byte
    g2: byte2 & 0x0F,           // Lower 4 bits of second byte
    g3: (byte2 & 0xF0) >> 4     // Upper 4 bits of second byte
  };
}

export function toGroupBytes(groups: ChannelGroups): { byte1: number; byte2: number } {
  // Extract values, ensuring they're within the valid range (0-15)
  const g0 = Math.min(Math.max(0, groups.g0 || 0), 15) & 0x0F;
  const g1 = Math.min(Math.max(0, groups.g1 || 0), 15) & 0x0F;
  const g2 = Math.min(Math.max(0, groups.g2 || 0), 15) & 0x0F;
  const g3 = Math.min(Math.max(0, groups.g3 || 0), 15) & 0x0F;

  // Compose the bytes
  const byte1 = g0 | (g1 << 4);  // g0 in lower bits, g1 in upper bits
  const byte2 = g2 | (g3 << 4);  // g2 in lower bits, g3 in upper bits

  return { byte1, byte2 };
}

export function toToneString(tonew) {
  if (tonew === 0) return "Off";
  if (tonew <= 3000) return (tonew / 10).toFixed(1);
  return `DCS ${(tonew & 0x3fff).toString(8).padStart(3, "0")}${
    tonew & 0x8000 ? "I" : "N"
  }`;
}

export function toToneWord(toneStr) {
  // Handle "Off" case
  if (!toneStr || toneStr.toLowerCase() === "off") {
    return 0;
  }

  // Handle CTCSS tones (e.g., "67.0" or "CTCSS 67.0")
  const ctcssMatch = toneStr.match(/(?:ctcss\s+)?(\d+(?:\.\d+)?)/i);
  if (ctcssMatch) {
    // Convert frequency to tenths of Hz and ensure within valid range
    const tone = Math.round(parseFloat(ctcssMatch[1]) * 10);
    if (tone > 0 && tone <= 3000) {
      return tone;
    }
  }

  // Handle DCS codes (e.g., "DCS 023N" or "DCS 023I")
  const dcsMatch = toneStr.match(/dcs\s+(\d+)([NI])/i);
  if (dcsMatch) {
    const code = parseInt(dcsMatch[1], 8); // Parse as octal
    const invert = dcsMatch[2].toUpperCase() === "I";

    // Combine DCS code with inversion flag
    // DCS uses bits 0-13 for code, bit 15 for inversion
    if (code >= 0 && code <= 0x3fff) {
      return 0x4000 | (invert ? 0x8000 : 0) | code;
    }
  }

  // Invalid format returns 0 (Off)
  return 0;
}
