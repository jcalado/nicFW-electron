import { ScanPreset } from '../renderer/src/types';

/**
 * Decodes a scan preset block from binary buffer, following the same logic as the C# implementation
 */
export function decodeScanPresetBlock(block: Buffer, presetNumber: number): ScanPreset | null {
  // Read start frequency - using big endian (matches Converter.ToInt32 in C#)
  const startFreq = block.readUInt32BE(0);

  // C# code has this validation check for valid frequency (min 1.8MHz = 1800000)
  if (startFreq < 1800000) {
    console.log(`Preset ${presetNumber} appears to have invalid frequency: ${startFreq}`);
    return null;
  }

  // Read range - using big endian
  const rangekHz = block.readUInt16BE(4);

  // Calculate end frequency like the C# code does
  const endFreq = startFreq + (rangekHz * 1000);

  // Read step in 10kHz units (convert to MHz for display)
  const stepkHz = block.readUInt16BE(6);

  // Read resume time
  const resume = block.readUInt8(8);

  // Read persist (in 0.1s units in C#)
  const persist = block.readUInt8(9);

  // Decode the bits field
  const bitsByte = block.readUInt8(10);
  const modIndex = (bitsByte & 0x03);  // Just like C# code
  const modulation = ['FM', 'NFM', 'AM', 'USB'][modIndex] as 'FM' | 'NFM' | 'AM' | 'USB';
  const ultrascan = ((bitsByte & 0xFC) >> 2);  // C# uses (bitsByte & 252) >> 2

  // Read the label (8 bytes in C#, not 9)
  const label = block.subarray(11, 19).toString('ascii').replace(/\x00/g, ' ').trim();

  console.log(`Decoded preset ${presetNumber}: startFreq=${startFreq/100000}, endFreq=${endFreq/100000}, step=${stepkHz/100}, modulation=${modulation}, label=${label}`);

  return {
    presetNumber,
    startFreq: startFreq / 100000,   // Convert to MHz like C# does
    range: rangekHz / 100,          // Convert to MHz
    step: stepkHz / 100,            // Convert to MHz
    resume,
    persist: persist / 10,          // C# displays in 0.1s units
    modulation,
    ultrascan,
    label
  };
}

/**
 * Encodes a scan preset to a binary buffer, following the same logic as the C# implementation
 */
export function encodeScanPresetBlock(preset: ScanPreset): Buffer {
  const block = Buffer.alloc(20);

  // Write start frequency in 10Hz units (converts from MHz)
  const startFreqHz = Math.round(preset.startFreq * 100000);
  block.writeUInt32BE(startFreqHz, 0);

  // Calculate and write range in kHz units
  const rangekHz = Math.round(preset.range * 100);
  block.writeUInt16BE(rangekHz, 4);

  // Write step in 10kHz units
  const stepkHz = Math.round(preset.step * 100);
  block.writeUInt16BE(stepkHz, 6);

  // Write resume time
  block.writeUInt8(preset.resume, 8);

  // Write persist time (convert from decimal seconds to 0.1s units)
  block.writeUInt8(Math.round(preset.persist * 10), 9);

  // Write modulation and ultrascan bits
  const modIndex = ['FM', 'NFM', 'AM', 'USB'].indexOf(preset.modulation);
  const bitsByte = (modIndex & 0x03) | ((preset.ultrascan & 0x3F) << 2);
  block.writeUInt8(bitsByte, 10);

  // Write label - 8 bytes in C# code, padded with spaces
  if (preset.label) {
    const labelBuffer = Buffer.alloc(9, 0x20); // Space-padded (0x20 = space)
    const labelString = preset.label.substring(0, 8).padEnd(8, ' ');
    labelBuffer.write(labelString, 0, 8, 'ascii');
    labelBuffer[8] = 0; // Null terminator
    labelBuffer.copy(block, 11);
  } else {
    // Fill with spaces and null terminator if no label
    for (let i = 0; i < 8; i++) block[11 + i] = 0x20;
    block[19] = 0;
  }

  return block;
}
