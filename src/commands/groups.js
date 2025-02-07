import chalk from "chalk";
import { input, confirm } from "@inquirer/prompts";
import { readGroupLabels, writeGroupLabel } from "../radio/group-labels.js";
import RadioCommunicator from "../radio/radio-communicator.js";

export function groupsCommand(program) {
  const groupsCmd = program
    .command("groups")
    .description("Manage group labels on the radio");

  // Subcommand: Read groups
  groupsCmd
    .command("read")
    .description("Read all group labels from the radio")
    .requiredOption("-p, --port <path>", "Serial port path")
    .option("-o, --output <file>", "Output JSON file")
    .action(async (cmd) => {
      const radio = new RadioCommunicator(cmd.port);
      try {
        await radio.connect();
        await radio.initialize();

        console.log(chalk.yellow("Reading group labels..."));
        const groups = await readGroupLabels(radio);

        if (cmd.output) {
          require("fs").writeFileSync(cmd.output, JSON.stringify(groups, null, 2));
          console.log(chalk.green(`Saved ${groups.length} groups to ${cmd.output}`));
        } else {
          console.log(chalk.green.bold("\nGroup Labels:"));
          console.table(
            groups.map((g) => ({
              Group: g.group,
              Label: g.label,
            }))
          );
        }
      } catch (error) {
        console.error(chalk.red("Error:"), error.message);
      } finally {
        await radio.close();
      }
    });

  // Subcommand: Write group
  groupsCmd
    .command("write")
    .description("Update a group label")
    .requiredOption("-p, --port <path>", "Serial port path")
    .option("-g, --group <char>", "Group letter (A-O)")
    .option("-l, --label <text>", "New label (max 5 characters)")
    .action(async (cmd) => {
      const radio = new RadioCommunicator(cmd.port);
      try {
        await radio.connect();

        // Disable radio before interactive prompts
        await radio.executeCommand(Buffer.from([0x45]), {
          expectedLength: 1,
          timeout: 5000,
        });

        // Read current groups first
        const groups = await readGroupLabels(radio);

        let groupIndex = -1;
        let groupChar = cmd.group;

        // If group not provided, show current groups and prompt
        if (!groupChar) {
          console.log(chalk.green.bold("\nCurrent Groups:"));
          console.table(groups.map((g) => ({ Group: g.group, Label: g.label })));

          groupChar = await input({
            message: "Enter group letter (A-O):",
            validate: (value) => /^[A-O]$/i.test(value),
          });
        }

        // Convert to index (A=0, B=1, ..., O=14)
        groupIndex = groupChar.toUpperCase().charCodeAt(0) - 65;
        if (groupIndex < 0 || groupIndex > 14) {
          throw new Error("Invalid group letter. Must be A-O");
        }

        // Get current label
        const currentLabel = groups[groupIndex].label || "";

        // Get new label (use provided or prompt)
        let label = cmd.label;
        if (!label) {
          label = await input({
            message: `Enter new label for group ${String.fromCharCode(
              65 + groupIndex
            )}:`,
            default: currentLabel,
            validate: (value) => value.length <= 5,
          });
        }

        // Sanitize input
        const cleanLabel = label
          .trim()
          .substring(0, 5)
          .replace(/[^\x20-\x7E]/g, "") // Remove non-ASCII printable characters
          .replace(/\0/g, ""); // Remove null characters

        // Write and verify with extended timeout
        console.log(chalk.yellow("Writing label..."));
        await writeGroupLabel(radio, groupIndex, cleanLabel);

        // Read back to confirm
        console.log(chalk.yellow("Verifying update..."));
        const updated = await readGroupLabels(radio);

        console.log(chalk.green.bold("\nUpdated Group Label:"));
        console.table([
          {
            Group: String.fromCharCode(65 + groupIndex),
            "Old Label": currentLabel,
            "New Label": updated[groupIndex].label,
          },
        ]);
      } catch (error) {
        console.error(chalk.red("Error:"), error.message);
      } finally {
        // Always re-enable the radio
        try {
          await radio.executeCommand(Buffer.from([0x46]), {
            expectedLength: 1,
            timeout: 5000,
          });
        } catch (e) {
          console.error(
            chalk.yellow("Warning: Failed to re-enable radio"),
            e.message
          );
        }

        await radio.close();
      }
    });
}