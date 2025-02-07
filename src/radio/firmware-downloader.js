import axios from 'axios';
import * as cheerio from 'cheerio'
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class FirmwareDownloader {
  static BASE_URL = 'https://www.nicsure.co.uk/h3/nightly.php';
  static HTTPS_AGENT = new https.Agent({ rejectUnauthorized: false });

  constructor(outputDir = 'firmware') {
    this.outputDir = path.resolve(outputDir);
    this.versionFile = path.join(this.outputDir, 'latest_version.txt');
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  getStoredVersion() {
    if (fs.existsSync(this.versionFile)) {
      return fs.readFileSync(this.versionFile, 'utf8').trim();
    }
    return null;
  }

  storeVersion(version) {
    fs.writeFileSync(this.versionFile, version, 'utf8');
  }

  async downloadFile(url, version) {
    const outputFilename = `firmware_v2_${version}.bin`;
    const outputPath = path.join(this.outputDir, outputFilename);
    
    const writer = fs.createWriteStream(outputPath);
    const response = await axios.get(url, {
      responseType: 'stream',
      httpsAgent: FirmwareDownloader.HTTPS_AGENT
    });
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(outputPath));
      writer.on('error', reject);
    });
  }

  parseFirmwareInfo(html) {
    const $ = cheerio.load(html);
    const version = $('#versionNum2').val();
    
    if (!version) {
      throw new Error('Firmware version not found in page');
    }

    return {
      version,
      firmwareLink: "https://www.nicsure.co.uk/h3/firmware2.bin"
    };
  }

  async checkForUpdates(force = false) {
    try {
      console.log(chalk.yellow('Fetching firmware information...'));
      const response = await axios.get(FirmwareDownloader.BASE_URL, {
        httpsAgent: FirmwareDownloader.HTTPS_AGENT
      });
      
      const { version, firmwareLink } = this.parseFirmwareInfo(response.data);
      const storedVersion = this.getStoredVersion();

      console.log(chalk.green(`Latest firmware version: ${version}`));
      console.log(chalk.dim(`Download URL: ${firmwareLink}`));

      if (storedVersion === version && !force) {
        console.log(chalk.blue('Already have latest version'));
        return { updated: false, version };
      }

      console.log(chalk.yellow('Downloading new firmware...'));
      const outputPath = await this.downloadFile(firmwareLink, version);
      this.storeVersion(version);

      console.log(chalk.green(`Firmware saved to: ${outputPath}`));
      return { updated: true, version, path: outputPath };

    } catch (error) {
      console.error(chalk.red('Firmware check failed:'), error.message);
      throw error;
    }
  }
}