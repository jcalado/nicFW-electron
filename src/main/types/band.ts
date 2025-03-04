/**
 * Represents a frequency band in the radio's band plan
 */
export enum Modulation {
  'Ignore' = 0,
  'FM' = 1,
  'AM' = 2,
  'USB' = 3,
  'Enforce FM' = 4,
  'Enforce AM' = 5,
  'Enforce USB' = 6,
  'Enforce None' = 7
}
export enum Bandwidth {
  'Ignore' = 0,
  'Wide' = 1,
  'Narrow' = 2,
  'Enforce Wide' = 3,
  'Enforce Narrow' = 4,
  'FM Tuner' = 5
}
export default interface Band {
  /**
   * Band number (1-20)
   */
  bandNumber: number

  /**
   * Start frequency in MHz
   */
  start: number

  /**
   * End frequency in MHz
   */
  end: number

  /**
   * Maximum power level (0-128) or "Auto"
   */
  maxPower: number | 'Auto'

  /**
   * Whether transmission is allowed in this band
   */
  txAllowed: boolean

  /**
   * Whether frequency should wrap around at band edges
   */
  wrap: boolean

  /**
   * Modulation type enforced in this band
   */
  modulation: Modulation

  /**
   * Bandwidth setting for this band
   */
  bandwidth: Bandwidth
}
