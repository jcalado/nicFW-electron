import { input, select } from "@inquirer/prompts";
import { toToneWord, toGroupWord } from "../utils/converters.js";

/**
 * Edits a channel interactively.
 *
 * @param {Channel} channel - The channel to edit.
 * @returns {Promise<Channel>} The edited channel.
 */
export async function editChannelInteractively(channel) {
  // Channel Name
  const name = await input({
    message: "Channel Name:",
    default: channel.name,
  });

  // RX Frequency
  const rxFreq = await input({
    message: "RX Frequency (MHz):",
    default: channel.rxFreq.toFixed(5),
    validate: (value) => !isNaN(value) || "Must be a number",
  });

  // TX Frequency
  const txFreq = await input({
    message: "TX Frequency (MHz):",
    default: channel.txFreq.toFixed(5),
    validate: (value) => !isNaN(value) || "Must be a number",
  });

  // RX Tone
  const rxTone = await input({
    message: "RX Tone (Off/Frequency):",
    default: channel.rxTone,
    validate: validateTone,
  });

  // TX Tone
  const txTone = await input({
    message: "TX Tone (Off/Frequency):",
    default: channel.txTone,
    validate: validateTone,
  });

  // TX Power
  const txPower = await input({
    message: "TX Power (0-255):",
    default: channel.txPower.toString(),
    validate: (value) => {
      const num = parseInt(value);
      return (num >= 0 && num <= 255) || "Must be 0-255";
    },
  });

  // Groups
  const groups = await input({
    message: "Groups (A-P, max 4 letters):",
    default: channel.groups,
    validate: validateGroups,
  });

  // Bandwidth
  const bandwidth = await select({
    message: "Bandwidth:",
    choices: [
      { value: "Wide", label: "Wide" },
      { value: "Narrow", label: "Narrow" },
    ],
    default: channel.bandwidth,
  });

  // Modulation
  const modulation = await select({
    message: "Modulation:",
    choices: [
      { value: "FM", label: "FM" },
      { value: "NFM", label: "NFM" },
      { value: "AM", label: "AM" },
      { value: "USB", label: "USB" },
    ],
    default: channel.modulation,
  });

  return {
    ...channel,
    name,
    rxFreq: parseFloat(rxFreq),
    txFreq: parseFloat(txFreq),
    txPower: parseInt(txPower),
    rxTone,
    txTone,
    groups: groups.toUpperCase().substring(0, 4),
    bandwidth,
    modulation,
  };
}

function validateTone(value) {
  if (value.toLowerCase() === "off") return true;
  if (/^\d+(\.\d+)?$/.test(value)) return true;
  return 'Use format: "off", or a number like 74.4';
}

function validateGroups(value) {
  return /^[A-P]{0,4}$/i.test(value) || "Only letters A-P, max 4 characters";
}
