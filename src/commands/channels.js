import chalk from "chalk";
import { input, confirm, number } from "@inquirer/prompts";
import { readChannelMemories, encodeChannelBlock } from "../radio/channel-memories.js";
import { editChannelInteractively } from "../radio/channel-editor.js";
import RadioCommunicator from "../radio/radio-communicator.js";

export function channelsCommand(program) {
  const channelsCmd = program
    .command("channels")
    .description("Manage channel memories on the radio");

  // Subcommand: Read channels
  channelsCmd
    .command("read")
    .description("Read all channel memories from the radio")
    .requiredOption("-p, --port <path>", "Serial port path")
    .option("-o, --output <file>", "Output JSON file")
    .action(async (cmd) => {
      const radio = new RadioCommunicator(cmd.port);
      try {
        await radio.connect();
        await radio.initialize();
        const channels = await readChannelMemories(radio);
        console.log(chalk.yellow("Reading channel memories..."));


        if (cmd.output) {
          require("fs").writeFileSync(cmd.output, JSON.stringify(channels, null, 2));
          console.log(chalk.green(`Saved ${channels.length} channels to ${cmd.output}`));
        } else {
          console.log(chalk.green.bold("\nChannel Memories:"));
          console.table(
            channels.map((c) => ({
              Channel: c.channelNumber,
              Name: c.name,
              "RX Freq": c.rxFreq.toFixed(5),
              "TX Freq": c.txFreq.toFixed(5),
              "TX Power": c.txPower,
              Modulation: c.modulation,
            }))
          );
        }
      } catch (error) {
        console.error(chalk.red("Error:"), error.message);
      } finally {
        await radio.close();
      }
    });

  // Subcommand: Edit channel
  channelsCmd
    .command("edit")
    .description("Interactively edit a memory channel")
    .requiredOption("-p, --port <path>", "Serial port path")
    .action(async (cmd) => {
      const radio = new RadioCommunicator(cmd.port);
      try {
        await radio.connect();
        await radio.initialize();

        // Read all channels first
        const channels = await readChannelMemories(radio);

        console.log(chalk.green.bold("\nChannel Memories:"));
        console.table(
          channels.map((c) => ({
            Channel: c.channelNumber,
            Name: c.name,
            "RX Freq": c.rxFreq.toFixed(5),
            "TX Freq": c.txFreq.toFixed(5),
            "TX Power": c.txPower,
            Modulation: c.modulation,
          }))
        );

        // Select channel
        const channelNumber = await number({
          message: "Enter channel number to edit (1-199):",
          validate: (value) => (value >= 1 && value <= 199) || "Invalid channel",
        });

        const original = channels.find((c) => c.channelNumber === channelNumber);
        if (!original) throw new Error("Channel not found");

        // Edit channel
        const edited = await editChannelInteractively(original);

        // Confirm changes
        const saveConfirmed = await confirm({
          message: "Save changes to radio?",
          default: false,
        });

        if (saveConfirmed) {
          const blockNumber = channelNumber + 1; // Channel 1 = Block 2
          const blockData = encodeChannelBlock(edited);
          console.log("Writing to radio...");
          await radio.writeBlock(blockNumber, blockData);
          console.log(chalk.green("Channel saved successfully"));
          await radio.executeCommand(Buffer.from([0x46]), { expectedLength: 1 });
        } else {
          console.log(chalk.yellow("Changes discarded"));
        }
      } catch (error) {
        console.error(chalk.red.bold("Error:"), error.message);
      } finally {
        await radio.restart();
        await radio.close();
      }
    });
}