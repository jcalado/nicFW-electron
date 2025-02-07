import chalk from "chalk";
import fs from "fs";
import { readBandPlan } from "../radio/band-plan.js";
import RadioCommunicator from "../radio/radio-communicator.js";

export function readBandsCommand(program) {
  program
    .command("read-bands")
    .description("Read band plan settings from the radio")
    .requiredOption("-p, --port <path>", "Serial port path")
    .option("-o, --output <file>", "Output JSON file")
    .action(async (cmd) => {
      const radio = new RadioCommunicator(cmd.port);
      try {
        await radio.connect();
        await radio.initialize();

        console.log(chalk.yellow("Reading band plan..."));
        const bands = await readBandPlan(radio);

        if (cmd.output) {
          fs.writeFileSync(cmd.output, JSON.stringify(bands, null, 2));
          console.log(chalk.green(`Saved ${bands.length} bands to ${cmd.output}`));
        } else {
          console.log(chalk.green.bold("\nBand Plan:"));
          console.table(
            bands.map((b) => ({
              Band: b.bandNumber,
              "Start (MHz)": b.start.toFixed(5),
              "End (MHz)": b.end.toFixed(5),
              "TX Allowed": b.txAllowed ? "Yes" : "No",
              Modulation: b.modulation,
              Bandwidth: b.bandwidth,
              "Wrap Around": b.wrapAround ? "Yes" : "No",
              "Max Power": b.maxPower,
            }))
          );
        }
      } catch (error) {
        console.error(chalk.red("Error:"), error.message);
      } finally {
        await radio.close();
      }
    });
}