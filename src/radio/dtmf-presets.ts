import { DTMFPreset } from '../renderer/src/types';

/**
 * Decodes raw DTMF preset data from a buffer.
 * @param data Buffer containing raw DTMF preset data
 * @param presetNumber The preset number (0-19)
 * @returns DTMFPreset object or null if invalid
 */
export function decodeDTMFPresetBlock(data: Buffer, presetNumber: number): DTMFPreset | null {
  if (!data || data.length < 12) {
    return null;
  }

  // The first byte contains the length in the upper 4 bits and first digit in lower 4 bits
  const length = (data[0] >> 4) & 0x0F;

  // Extract the sequence digits (up to 9 digits - stored in 5 bytes)
  const digits: number[] = [];
  digits.push(data[0] & 0x0F);  // d0 (lower 4 bits of byte 0)
  digits.push((data[1] >> 4) & 0x0F);  // d1 (upper 4 bits of byte 1)
  digits.push(data[1] & 0x0F);  // d2 (lower 4 bits of byte 1)
  digits.push((data[2] >> 4) & 0x0F);  // d3 (upper 4 bits of byte 2)
  digits.push(data[2] & 0x0F);  // d4 (lower 4 bits of byte 2)
  digits.push((data[3] >> 4) & 0x0F);  // d5 (upper 4 bits of byte 3)
  digits.push(data[3] & 0x0F);  // d6 (lower 4 bits of byte 3)
  digits.push((data[4] >> 4) & 0x0F);  // d7 (upper 4 bits of byte 4)
  digits.push(data[4] & 0x0F);  // d8 (lower 4 bits of byte 4)

  // Convert digits to characters
  const sequence = digits
    .slice(0, length)
    .map(digit => {
      switch(digit) {
        case 10: return '*';
        case 11: return '#';
        case 12: return 'A';
        case 13: return 'B';
        case 14: return 'C';
        case 15: return 'D';
        default: return digit.toString();
      }
    })
    .join('');

  // Extract the label (null-terminated string)
  let label = '';
  for (let i = 5; i < 12; i++) {
    if (data[i] === 0) break;
    label += String.fromCharCode(data[i]);
  }

  return {
    presetNumber,
    label,
    sequence,
    length
  };
}

/**
 * Encodes a DTMF preset into a buffer.
 * @param preset The DTMF preset to encode
 * @returns Buffer containing encoded DTMF preset data
 */
export function encodeDTMFPresetBlock(preset: DTMFPreset): Buffer {
  const buffer = Buffer.alloc(12, 0);

  // Ensure length is valid (1-9)
  const length = Math.min(9, Math.max(1, preset.length || preset.sequence.length));

  // Convert sequence string to digit values
  const digits = preset.sequence.split('').map(char => {
    switch(char) {
      case '*': return 10;
      case '#': return 11;
      case 'A': return 12;
      case 'B': return 13;
      case 'C': return 14;
      case 'D': return 15;
      default: return parseInt(char, 10) || 0;
    }
  }).slice(0, length);

  // Pad digits to always have 9 entries
  while (digits.length < 9) {
    digits.push(0);
  }

  // Write length and first digit
  buffer[0] = ((length & 0x0F) << 4) | (digits[0] & 0x0F);

  // Write remaining digits
  buffer[1] = ((digits[1] & 0x0F) << 4) | (digits[2] & 0x0F);
  buffer[2] = ((digits[3] & 0x0F) << 4) | (digits[4] & 0x0F);
  buffer[3] = ((digits[5] & 0x0F) << 4) | (digits[6] & 0x0F);
  buffer[4] = ((digits[7] & 0x0F) << 4) | (digits[8] & 0x0F);

  // Write label (up to 7 characters + null terminator)
  const labelBuffer = Buffer.from(preset.label.padEnd(7, '\0').substring(0, 7) + '\0', 'ascii');
  labelBuffer.copy(buffer, 5, 0, 7);

  return buffer;
}
