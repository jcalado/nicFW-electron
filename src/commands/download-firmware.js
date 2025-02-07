import chalk from "chalk";
import { FirmwareDownloader } from "../radio/firmware-downloader.js";


export function downloadFirmwareCommand(program) {
  program
    .command("download-firmware")
    .description("Check for firmware updates and download latest version")
    .option(
      "-o, --output-dir <dir>",
      "Output directory for firmware files",
      "firmware"
    )
    .option("-f, --force", "Force download even if version matches", false)
    .action(async (cmd) => {
      try {
        const updater = new FirmwareDownloader(cmd.outputDir);
        const result = await updater.checkForUpdates(cmd.force);

        if (result.updated) {
          console.log(
            chalk.green.bold(
              `Successfully downloaded version ${result.version}`
            )
          );
          console.log(chalk.dim(`Firmware saved to: ${result.path}`));
        } else {
          console.log(
            chalk.blue("No update needed - already have latest version")
          );
        }
      } catch (error) {
        console.error(
          chalk.red.bold("Firmware update check failed:"),
          error.message
        );
        process.exit(1);
      }
    });
}
