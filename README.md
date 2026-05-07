<a name="TOC"></a>

<div align="center">
  <!-- <DYNFIELD:HEADER_LOGO> -->
  <a href="https://www.google.com/sheets/about/" target="_blank" rel="noopener noreferrer">
    <img width="64" src=".github/image/sheet.png" alt="Google Sheets logo">
  </a>
  <div>gsheet</div>
  <!-- </DYNFIELD:HEADER_LOGO> -->
  <br />
  <a href="#-overview">Overview</a> • <a href="#-motivation">Motivation</a> • <a href="#-features">Features</a> • <a href="#-packages">Packages</a> • <a href="#-quick-start">Quick Start</a> • <a href="#-commands">Commands</a> • <a href="#-configuration">Configuration</a> • <a href="#-license">License</a>
</div>

<!-- <DYNFIELD:TOP_DIVIDER> -->
<div width="100%" align="center">
  <img src="https://cdn.jsdelivr.net/gh/lucasvtiradentes/pretty-session@main/.github/image/divider.png" />
</div>
<!-- </DYNFIELD:TOP_DIVIDER> -->

## 🎺 Overview

gsheet is a CLI and Node.js library for managing Google Sheets from the terminal or from scripts.

## ❓ Motivation

Google Sheets is often the easiest place to store operational data, but the browser workflow is slow for repeated reads, writes, imports, exports, and AI-agent automation. gsheet keeps account, spreadsheet, and sheet context locally so commands and scripts can work with short, repeatable calls.

## ⭐ Features

- OAuth 2.0 login without service accounts
- Multi-account support for personal, work, and other Google accounts
- Interactive Google Drive spreadsheet selection
- Active account, spreadsheet, and sheet context
- Read, write, append, import, and export workflows
- Markdown, CSV, and JSON output for CLI and AI-agent usage
- npm library exports for scripts that need direct Google Sheets access

## 🚀 Quick Start

1. Install the CLI globally:
   ```sh
   npm i -g gsheet-lvt
   # now you can use "gs" or "gsheet"
   ```

<div  align="center">
  <a href="https://www.npmjs.com/package/gsheet-lvt"><img src="https://img.shields.io/npm/v/gsheet-lvt?label=npm&color=cb3837&logo=npm" alt="npm"></a>
</div>

2. Add a Google account:

   ```sh
   gs account add
   ```

3. Add and select a spreadsheet:

   ```sh
   gs spreadsheet add
   gs sheet select
   ```

4. Read the active sheet:

   ```sh
   gs sheet read
   ```

## 🧰 Commands

<!-- <DYNFIELD:COMMANDS> -->
```sh
# account commands
gs account add
gs account list
gs account select [email]
gs account remove [email]
gs account reauth

# spreadsheet commands
gs spreadsheet add [--id <value>] [--name <value>]
gs spreadsheet list [--output <value>]
gs spreadsheet remove [--id <value>]
gs spreadsheet select [--id <value>] [--add] [--name <value>]
gs spreadsheet active [--output <value>]

# sheet commands
gs sheet list [--output <value>]
gs sheet active [--output <value>]
gs sheet select [--name <value>]
gs sheet read [--name <value>] [--output <value>] [--formulas] [--export <value>] [--range <value>]
gs sheet add --name <value>
gs sheet remove [--name <value>]
gs sheet rename [--name <value>] --new-name <value>
gs sheet copy [--name <value>] --to <value>
gs sheet write [--name <value>] [--cell <value>] [--range <value>] --value <value> [--no-preserve]
gs sheet append [--name <value>] --value <value>
gs sheet import [--name <value>] --file <value> [--skip-header]
gs sheet export [--name <value>] [--range <value>] --format <value> [--output <value>]
gs sheet row-add --row <value> [--name <value>] [--above] [--below] [--formulas] [--count <value>]
gs sheet row-remove --row <value> [--name <value>] [--above] [--below] [--count <value>]

gs update

# completion commands
gs completion zsh
gs completion bash
gs completion fish
```
<!-- </DYNFIELD:COMMANDS> -->

## 🛠️ Development

Install the dev CLI once to use `gsheetd` and `gsd` anywhere on your machine while testing local source changes:

```sh
pnpm dev:install
gsheetd --help
gsd --help
pnpm dev:uninstall
```

## ⚙️ Configuration

Configuration is stored locally under the app config directory for your OS:

- Linux/WSL: `~/.config/gsheet/`
- macOS: `~/Library/Preferences/gsheet/`
- Windows: `%APPDATA%/gsheet/`

OAuth tokens are stored locally and refreshed automatically before expiry.

<!-- <DYNFIELD:CONFIG_JSON> -->
```json
{
  "config_path": "~/.config/gsheet/config.json",
  "user_metadata_path": "~/.config/gsheet/user_metadata.json",
  "activeAccount": "user@gmail.com",
  "activeSpreadsheet": "my-budget",
  "activeSheet": "monthly"
}
```
<!-- </DYNFIELD:CONFIG_JSON> -->

## 📜 License

[MIT](https://github.com/lucasvtiradentes/sheet-cmd/blob/main/LICENSE)

<!-- <DYNFIELD:FOOTER> -->
<div width="100%" align="center">
  <img src="https://cdn.jsdelivr.net/gh/lucasvtiradentes/pretty-session@main/.github/image/divider.png" />
</div>

<br />

<div align="center">
  <div>
    <a target="_blank" href="https://www.linkedin.com/in/lucasvtiradentes/"><img src="https://img.shields.io/badge/-linkedin-blue?logo=Linkedin&logoColor=white" alt="LinkedIn"></a>
    <a target="_blank" href="mailto:lucasvtiradentes@gmail.com"><img src="https://img.shields.io/badge/gmail-red?logo=gmail&logoColor=white" alt="Gmail"></a>
    <a target="_blank" href="https://x.com/lucasvtiradente"><img src="https://img.shields.io/badge/-X-black?logo=X&logoColor=white" alt="X"></a>
    <a target="_blank" href="https://github.com/lucasvtiradentes"><img src="https://img.shields.io/badge/-github-gray?logo=Github&logoColor=white" alt="Github"></a>
  </div>
</div>
<!-- </DYNFIELD:FOOTER> -->
