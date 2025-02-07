import { Command } from "commander";
import { channelsCommand } from "./commands/channels.js";
import { downloadFirmwareCommand } from "./commands/download-firmware.js";
import { flashFirmwareCommand } from "./commands/flash-firmware.js";
import { groupsCommand } from "./commands/groups.js";
import { readBandsCommand } from "./commands/read-bands.js";

import {
  readCodeplugCommand,
  writeCodeplugCommand,
} from "./commands/codeplug.js";

const program = new Command();

program
  .name("radio-tool")
  .description("Radio Configuration Management CLI")
  .version("1.0.0");

channelsCommand(program);
downloadFirmwareCommand(program);
flashFirmwareCommand(program);
groupsCommand(program);
readBandsCommand(program);
readCodeplugCommand(program);
writeCodeplugCommand(program);

program.parse(process.argv);
