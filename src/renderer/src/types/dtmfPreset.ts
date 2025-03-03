export interface DTMFPreset {
  presetNumber: number;
  label: string;
  sequence: string;  // The DTMF sequence as a string (e.g., "123456789*#")
  length: number;    // The length of the sequence (1-9)
}
