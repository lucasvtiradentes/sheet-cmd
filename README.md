<div align="center">
<a href="https://www.google.com/sheets/about/" target="_blank" rel="noopener noreferrer">
  <img width="64" src=".github/image/sheet.png" alt="Google Sheets logo">
</a>
<h2>Sheet CMD</h2>
<p>
  <a href="#rocket-quick-start">Quick Start</a> • <a href="#bulb-usage">Usage</a> • <a href="#package-additional-information">Additional Information</a>
</p>
</div>

## Overview

Manage Google Sheets from the command line: read, write, import/export data across multiple accounts and spreadsheets.

## :sparkles: Features

&nbsp;&nbsp;&nbsp;✔️ **OAuth 2.0 authentication** - secure access without service accounts<br>
&nbsp;&nbsp;&nbsp;✔️ **Multi-account support** - manage personal, work, and other Google accounts<br>
&nbsp;&nbsp;&nbsp;✔️ **Interactive Drive browsing** - select spreadsheets directly from Google Drive<br>
&nbsp;&nbsp;&nbsp;✔️ **Active context system** - set account/spreadsheet/sheet once, use everywhere<br>
&nbsp;&nbsp;&nbsp;✔️ **Data operations** - read, write, append with markdown/CSV/JSON formats<br>
&nbsp;&nbsp;&nbsp;✔️ **LLM-friendly** - designed for AI integrations like Claude Code<br>

## :rocket: Quick Start

```bash
# 1. Install
npm install -g gsheet-lvt

# 2. Setup Google OAuth credentials
# → See "Google Cloud Console Setup" section below

# 3. Add your Google account
gsheet account add
# → Follow the setup instructions
# → Paste Client ID and Client Secret
# → Browser opens for authentication
# → Grant permissions

# 4. Add a spreadsheet
gsheet spreadsheet add
# → Browse and select from Google Drive

# 5. Select a sheet
gsheet sheet select
# → Choose sheet to work with

# 6. Start using!
gsheet sheet read
```

<details>
<summary><b>Google Cloud Console Setup</b></summary>

To use gsheet, you need OAuth 2.0 credentials from Google Cloud Console:

**1. Go to [Google Cloud Console](https://console.cloud.google.com/)**

**2. Create or select a project**
- May require setting up billing (free tier available)

**3. Enable APIs**
- Go to "APIs & Services" > "Library"
- Search and enable "Google Sheets API"
- Search and enable "Google Drive API"

**4. Configure OAuth Consent Screen**
- Go to: [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
- User Type: **External**
- App name: gsheet (or any name)
- User support email: your email
- Developer contact: your email
- Click "SAVE AND CONTINUE"

**5. Add Scopes**
- Go to: [Add scopes](https://console.cloud.google.com/auth/scopes)
- Click "ADD OR REMOVE SCOPES"
- Search and add:
  - `.../auth/spreadsheets`
  - `.../auth/drive.readonly`
- Click "UPDATE" then "SAVE AND CONTINUE"

**6. Add Test Users**
- Go to: [Add test users](https://console.cloud.google.com/auth/audience)
- Click "ADD USERS"
- Add your email address
- Click "SAVE AND CONTINUE"

**7. Create OAuth 2.0 Client ID**
- Go to: [Credentials](https://console.cloud.google.com/apis/credentials)
- Click "CREATE CREDENTIALS" > "OAuth client ID"
- Application type: **Desktop app**
- Name: gsheet
- Click "CREATE"
- **Copy the Client ID and Client Secret**

**Note**: The first time you authenticate, you'll see an "unverified app" warning. This is normal for apps in testing mode. Click "Advanced" → "Go to [app name] (unsafe)" to proceed.

</details>

## :bulb: Usage

All commands use the **active account**, **active spreadsheet**, and **active sheet** by default. Set once, use everywhere.

<!-- COMMANDS:START -->
### Account Commands

**add** - Add a Google account via OAuth

```bash
gsheet account add
```

**list** - List all configured Google accounts

```bash
gsheet account list
```

**select** - Select active Google account

```bash
gsheet account select [email]
```

Arguments:
- `email`: Account email to select (optional - interactive if not provided)

**remove** - Remove a Google account

```bash
gsheet account remove [email]
```

Arguments:
- `email`: Account email to remove (optional - interactive if not provided)

**reauth** - Re-authenticate the active account

```bash
gsheet account reauth
```

### Spreadsheet Commands

**add** - Add a new spreadsheet (interactive by default, use --id for manual)

```bash
gsheet spreadsheet add [--id <value>] [--name <value>]
```

Options:
- `--id <value>`: Spreadsheet ID or URL (skips interactive selection)
- `--name <value>`: Local name for the spreadsheet

**list** - List all configured spreadsheets

```bash
gsheet spreadsheet list [--output <value>]
```

Options:
- `-o, --output <value>`: Output format

**remove** - Remove a spreadsheet configuration

```bash
gsheet spreadsheet remove [--id <value>]
```

Options:
- `--id <value>`: Spreadsheet ID or URL (skips interactive selection)

**select** - Select a different spreadsheet (sets as active)

```bash
gsheet spreadsheet select [--id <value>] [--add] [--name <value>]
```

Options:
- `--id <value>`: Spreadsheet ID or URL (skips interactive selection)
- `--add`: Add the spreadsheet if it is not configured
- `--name <value>`: Local name to use with --add

**active** - Show the currently active spreadsheet

```bash
gsheet spreadsheet active [--output <value>]
```

Options:
- `-o, --output <value>`: Output format

### Sheet Commands

**list** - List all sheets in a spreadsheet

```bash
gsheet sheet list [--output <value>]
```

Options:
- `-o, --output <value>`: Output format

**active** - Show the currently active sheet

```bash
gsheet sheet active [--output <value>]
```

Options:
- `-o, --output <value>`: Output format

**select** - Select a sheet (sets as active)

```bash
gsheet sheet select [--name <value>]
```

Options:
- `-n, --name <value>`: Tab name (skips interactive selection)

**read** - Read the complete content of a sheet

```bash
gsheet sheet read [--name <value>] [--output <value>] [--formulas] [--export <value>] [--range <value>]
```

Options:
- `-n, --name <value>`: Tab name (uses active if not provided)
- `-o, --output <value>`: Output format
- `-f, --formulas`: Include formulas instead of values
- `-e, --export <value>`: Export to file
- `-r, --range <value>`: Range to read (e.g., A1:B10)

**add** - Add a new sheet to the spreadsheet

```bash
gsheet sheet add --name <value>
```

Options:
- `-n, --name <value>`: Tab name (required)

**remove** - Remove a sheet from the spreadsheet

```bash
gsheet sheet remove [--name <value>]
```

Options:
- `-n, --name <value>`: Tab name (uses active if not provided)

**rename** - Rename a sheet in the spreadsheet

```bash
gsheet sheet rename [--name <value>] --new-name <value>
```

Options:
- `-n, --name <value>`: Current tab name (uses active if not provided)
- `--new-name <value>`: New tab name (required)

**copy** - Copy a sheet to a new sheet

```bash
gsheet sheet copy [--name <value>] --to <value>
```

Options:
- `-n, --name <value>`: Source tab name (uses active if not provided)
- `--to <value>`: Destination tab name (required)

**write** - Write to a specific cell or range of cells

```bash
gsheet sheet write [--name <value>] [--cell <value>] [--range <value>] --value <value> [--no-preserve]
```

Options:
- `-n, --name <value>`: Tab name (uses active if not provided)
- `-c, --cell <value>`: Cell address (e.g., A1) - required if --range not provided
- `-r, --range <value>`: Range (e.g., A1:B2) - required if --cell not provided
- `-v, --value <value>`: Value to write (use , for columns, ; for rows) (required)
- `--no-preserve`: Overwrite cells with formulas or data validation

**append** - Append a new row to the end of the sheet

```bash
gsheet sheet append [--name <value>] --value <value>
```

Options:
- `-n, --name <value>`: Tab name (uses active if not provided)
- `-v, --value <value>`: Values to append (comma-separated) (required)

**import** - Import CSV file to a sheet

```bash
gsheet sheet import [--name <value>] --file <value> [--skip-header]
```

Options:
- `-n, --name <value>`: Tab name (uses active if not provided)
- `-f, --file <value>`: CSV file path (required)
- `--skip-header`: Skip header row when importing

**export** - Export sheet data to JSON or CSV format

```bash
gsheet sheet export [--name <value>] [--range <value>] --format <value> [--output <value>]
```

Options:
- `-n, --name <value>`: Tab name (uses active if not provided)
- `-r, --range <value>`: Range to export (optional)
- `-f, --format <value>`: Export format (required)
- `-o, --output <value>`: Output file path

**row-add** - Add a row to the sheet

```bash
gsheet sheet row-add --row <value> [--name <value>] [--above] [--below] [--formulas] [--count <value>]
```

Options:
- `-r, --row <value>`: Row number (1-indexed) (required)
- `-n, --name <value>`: Tab name (uses active if not provided)
- `--above`: Insert row above the specified row
- `--below`: Insert row below the specified row
- `-f, --formulas`: Copy formatting, formulas, and data validation from adjacent row
- `-c, --count <value>`: Number of rows to add (default: 1)

**row-remove** - Remove a row from the sheet

```bash
gsheet sheet row-remove --row <value> [--name <value>] [--above] [--below] [--count <value>]
```

Options:
- `-r, --row <value>`: Row number (1-indexed) (required)
- `-n, --name <value>`: Tab name (uses active if not provided)
- `--above`: Remove rows above the specified row
- `--below`: Remove rows below the specified row
- `-c, --count <value>`: Number of rows to remove (default: 1)

### Update

**update** - Update gsheet to latest version

```bash
gsheet update
```

### Completion Commands

**completion** - Generate shell completion scripts

```bash
gsheet completion [shell]
```

Arguments:
- `shell`: Shell to generate completion for (bash, fish, zsh)

**install** - Install shell completion for your current shell

```bash
gsheet completion install
```
<!-- COMMANDS:END -->

## :package: Additional Information

**Prerequisites:** Node.js 18+, Google Account, Linux/macOS/Windows

<details>
<summary><b>Configuration Files</b></summary>

Configuration files are stored in:
- **Linux/WSL**: `~/.config/gsheet/`
- **macOS**: `~/Library/Preferences/gsheet/`
- **Windows**: `%APPDATA%/gsheet/`

**Files:**
- `user_metadata.json` - Stores accounts, active selections, and spreadsheets
- `config.json` - Stores general settings

**Example structure:**
```json
{
  "config_path": "~/.config/gsheet/config.json",
  "activeAccount": "user@gmail.com",
  "accounts": {
    "user@gmail.com": {
      "email": "user@gmail.com",
      "oauth": {
        "client_id": "xxx.apps.googleusercontent.com",
        "client_secret": "xxx",
        "refresh_token": "xxx",
        "access_token": "xxx",
        "expiry_date": 1234567890
      },
      "activeSpreadsheet": "my-budget",
      "spreadsheets": {
        "my-budget": {
          "spreadsheet_id": "1ABC...",
          "activeSheet": "monthly"
        }
      }
    }
  }
}
```

**Security**: All OAuth tokens are stored locally and automatically refreshed before expiry.

</details>

<details>
<summary><b>LLM Integration</b></summary>

Sheet CMD is designed to be LLM-friendly, making it easy for AI tools like [Claude Code](https://www.anthropic.com/claude-code) to interact with your Google Sheets data.

**Why this matters:**
- Simple command structure that LLMs can easily understand
- Active context system reduces command complexity
- Clear output formats (markdown, CSV, JSON)
- OAuth 2.0 means no service account credentials to manage
- Multi-account support for different contexts

**Example Claude Code workflow:**
```bash
# Claude can read your budget spreadsheet
gsheet sheet read --name "Budget" --output markdown

# Process the data and write results back
gsheet sheet write --name "Analysis" --cell A1 --value "Summary"

# Export for further analysis
gsheet sheet export --name "Data" --format json --output data.json
```

</details>

<details>
<summary><b>Uninstallation</b></summary>

To completely remove gsheet:

```bash
# 1. Remove shell completions (if installed)
gsheet completion uninstall

# 2. Uninstall the package
npm uninstall -g gsheet-lvt

# 3. (Optional) Remove configuration files
# Linux/WSL: rm -rf ~/.config/gsheet/
# macOS: rm -rf ~/Library/Preferences/gsheet/
# Windows: Remove %APPDATA%/gsheet/
```

</details>

<details>
<summary><b>Development setup</b></summary>

For local development:

```bash
# Clone repository
git clone https://github.com/lucasvtiradentes/sheet-cmd.git
cd sheet-cmd

# Install dependencies
npm install

# Build
npm run build

# Run in development
npm run dev -- sheet list

# Run tests
npm run test
npm run test:e2e

# Type checking
npm run typecheck

# Linting
npm run lint
```

</details>

---

<div align="center">
  <p>
    <a target="_blank" href="https://www.linkedin.com/in/lucasvtiradentes/"><img src="https://img.shields.io/badge/-linkedin-blue?logo=Linkedin&logoColor=white" alt="LinkedIn"></a>
    <a target="_blank" href="mailto:lucasvtiradentes@gmail.com"><img src="https://img.shields.io/badge/gmail-red?logo=gmail&logoColor=white" alt="Gmail"></a>
  </p>
  <p>Made with ❤️ by <b>Lucas Vieira</b></p>
</div>
