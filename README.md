# nicFW Radio Management Tool

<p align="center">
  A modern, cross-platform tool for managing your radio's codeplug and settings
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#development">Development</a> •
  <a href="#building">Building</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#license">License</a>
</p>

---

## Features

### 📻 Complete Radio Management
- **Channels**: Read, create, edit, and write channel memories with all parameters
- **Groups**: Manage channel grouping for easier navigation
- **Band Plans**: View and edit radio band restrictions
- **Settings**: Configure radio-wide settings and preferences

### 🎛️ Advanced Functionality
- **DTMF Presets**: Manage up to 20 DTMF preset sequences including PTT ID sequences
- **Scan Presets**: Configure custom scan lists for quick access
- **Firmware**: Update your radio's firmware directly through the application

### 💻 User-Friendly Interface
- Modern, responsive UI built with React and Fluent UI
- Context menus for quick actions
- Drag and drop channel reordering
- Import/export to CSV files

### 🔌 Connectivity
- Serial port connectivity
- Automatic port detection
- Progress indication for long operations

## Screenshots
![Screenshot From 2025-04-09 08-55-18](https://github.com/user-attachments/assets/c147819f-f667-40e6-acd9-eab2301c30fc)

## Installation

Download the latest release for your operating system:

- [Windows Installer](https://github.com/your-username/nicFW-electron/releases)
- [macOS DMG](https://github.com/your-username/nicFW-electron/releases)
- [Linux AppImage](https://github.com/your-username/nicFW-electron/releases)

## Development

This application is built with Electron, React, TypeScript, and Fluent UI.

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Yarn](https://yarnpkg.com/) package manager

### Setup

```bash
$ yarn
```

### Development

```bash
$ yarn dev
```

### Build

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```
