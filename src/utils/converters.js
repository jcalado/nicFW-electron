export function toDecimalFreq(bkfreq) {
  return (bkfreq >>> 0) / 100000;
}

export function toGroupString(groupw) {
  let str = "";
  groupw &= 0xffff;
  for (let i = 0; i < 4; i++) {
    const nibble = (groupw >> (4 * i)) & 0xf;
    if (nibble > 0 && nibble < 16) {
      str = String.fromCharCode(64 + nibble) + str;
    }
  }
  return str;
}

export function toGroupWord(groupStr) {
  let word = 0;
  // Convert string to uppercase to match toGroupString behavior
  groupStr = (groupStr || "").toUpperCase();

  // Process each character (max 4 chars, right to left)
  for (let i = 0; i < Math.min(groupStr.length, 4); i++) {
    const char = groupStr[groupStr.length - 1 - i]; // Read right to left
    const value = char.charCodeAt(0) - 64; // 'A'=1, 'B'=2, etc

    // Only process valid characters (A-P = 1-16)
    if (value > 0 && value < 16) {
      word |= value << (4 * i); // Place nibble in correct position
    }
  }

  return word & 0xffff; // Ensure 16-bit value
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
