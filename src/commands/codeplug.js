import chalk from "chalk";
import { confirm } from "@inquirer/prompts";
import { readCodeplug, writeCodeplug } from "../radio/codeplug.js";

export function writeCodeplugCommand(program) {
  program
    .command("write-codeplug")
    .description("Write complete radio configuration (use with caution!)")
    .requiredOption("-p, --port <path>", "Serial port path")
    .requiredOption("-f, --file <file>", "Codeplug file to write")
    .action(async (cmd) => {
      try {
        const confirmed = await confirm({
          message: chalk.redBright(
            "WARNING: This will overwrite ALL radio settings. Continue?"
          ),
          default: false,
        });

        if (!confirmed) {
          console.log(chalk.yellow("Operation canceled"));
          return;
        }

        await writeCodeplug(cmd.port, cmd.file);
      } catch (error) {
        console.error(chalk.red("\nFatal error during write:"), error.message);
        console.log(
          chalk.yellow("Radio may be in unstable state - reconnect and retry")
        );
      }
    });
}

export function readCodeplugCommand(program) {
    program
      .command("read-codeplug")
      .description("Read complete radio configuration (all memory blocks)")
      .requiredOption("-p, --port <path>", "Serial port path")
      .option("-o, --output <file>", "Output file name", "codeplug.nfw")
      .action(async (cmd) => {
        try {
          console.log(chalk.yellow("Reading codeplug..."));
          await readCodeplug(cmd.port, cmd.output);
          console.log(chalk.green(`Codeplug saved to ${cmd.output}`));
        } catch (error) {
          console.error(chalk.red("\nError reading codeplug:"), error.message);
        }
      });
  }