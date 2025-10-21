<div align="center">
<a href="https://www.google.com/sheets/about/" target="_blank" rel="noopener noreferrer">
  <img width="64" src=".github/image/sheet.png" alt="Google Sheets logo">
</a>
<h2>Sheet cmd</h2>
<p>A CLI tool to interact with Google Sheets</p>
<p>
  <a href="https://www.npmjs.com/package/sheet-cmd"><img src="https://img.shields.io/npm/v/sheet-cmd.svg" alt="npm version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <br>
  <a href="#star-features">Features</a> • <a href="#question-motivation">Motivation</a> • <a href="#rocket-quick-start">Quick Start</a> • <a href="#bulb-usage">Usage</a> • <a href="#package-setup">Setup</a> • <a href="#wrench-development">Development</a>
</p>

</div>

## :star: Features

- **OAuth 2.0 Authentication** - Secure authentication via Google OAuth (no service accounts needed)
- **Multi-account support** - Manage multiple Google accounts (personal, work, etc.)
- **Account-based organization** - Each account manages its own spreadsheets
- **Interactive spreadsheet selection** - Browse and select from your Google Drive spreadsheets
- **Active account/spreadsheet system** - Set once, use everywhere (no need for flags)
- **Complete sheet management** - Create, rename, copy, and remove sheets
- **Data operations** - Read, write, append rows with multiple output formats
- **Import/Export** - CSV import and export to JSON/CSV formats
- **Automatic token refresh** - Tokens refresh automatically before expiry
- **Secure credentials** - All credentials stored locally on your machine
- **LLM-friendly** - Designed for AI tool integrations like Claude Code
- **Shell completion** - Auto-completion for zsh and bash
- **Self-updating** - Built-in update mechanism that detects your package manager

## :question: Motivation

Why build a CLI for Google Sheets?

Because I want to enable LLMs like [Claude Code](https://www.anthropic.com/claude-code) to easily interact with my Google Sheets data. This tool provides a simple, secure, and flexible way to manage multiple accounts and spreadsheets, making it perfect for AI-powered workflows. With OAuth 2.0 authentication, you can safely grant access without sharing service account credentials.

## :rocket: Quick Start

```bash
# Install
npm install sheet-cmd -g

# Add Google account (OAuth)
sheet-cmd account add

# Add spreadsheet (interactive - browse Google Drive)
sheet-cmd spreadsheet add

# Start using
sheet-cmd sheet list
```

## :bulb: Usage

### Commands Overview

```bash
sheet-cmd --help                    # Show help
sheet-cmd update                    # Update to latest version
```

<details>
<summary><b>Account Management</b></summary>

```bash
sheet-cmd account add                   # Add Google account via OAuth
sheet-cmd account list                  # List all accounts (* = active)
sheet-cmd account select <email>        # Select active account
sheet-cmd account remove <email>        # Remove account
sheet-cmd account reauth                # Re-authenticate active account
```

</details>

<details>
<summary><b>Spreadsheet Management</b></summary>

All spreadsheet commands use the active account.

```bash
sheet-cmd spreadsheet add                      # Add spreadsheet (interactive - browse Google Drive)
sheet-cmd spreadsheet add --id <spreadsheet-id> # Add spreadsheet by ID (manual entry)
sheet-cmd spreadsheet list                     # List all spreadsheets (* = active)
sheet-cmd spreadsheet select <name>            # Select active spreadsheet
sheet-cmd spreadsheet active                   # Show currently active spreadsheet
sheet-cmd spreadsheet remove [name]            # Remove spreadsheet
```

</details>

<details>
<summary><b>Sheet Management</b></summary>

All sheet commands use the active spreadsheet if `-s` flag is not specified.

```bash
sheet-cmd sheet list                              # List all sheet
sheet-cmd sheet add -n <name>                      # Add a new sheet
sheet-cmd sheet remove -n <name>                   # Remove a sheet
sheet-cmd sheet rename -n <old> --new-name <new>  # Rename a sheet
sheet-cmd sheet copy -n <name> --to <new>         # Copy a sheet
```

</details>

<details>
<summary><b>Data Operations</b></summary>

```bash
# Read sheet content
sheet-cmd sheet read -n <name>                    # Read in markdown format
sheet-cmd sheet read -n <name> -o csv             # Read in CSV format
sheet-cmd sheet read -n <name> -f                 # Read with formulas
sheet-cmd sheet read -n <name> -e output.md       # Save to file

# Write to cells
sheet-cmd sheet write -n <name> -c A1 -v "Hello"   # Write to single cell
sheet-cmd sheet write -n <name> -r A1:B2 -v "val1, val2; val3, val4"  # Write to range

# Append rows
sheet-cmd sheet append -n <name> -v "col1, col2, col3"  # Append new row
```

</details>

<details>
<summary><b>Import/Export</b></summary>

```bash
# Import CSV
sheet-cmd sheet import -n <name> -f data.csv        # Import CSV with headers
sheet-cmd sheet import -n <name> -f data.csv --skip-header  # Skip first row

# Export data
sheet-cmd sheet export -n <name> -f json -o output.json # Export to JSON
sheet-cmd sheet export -n <name> -f csv -o output.csv   # Export to CSV
sheet-cmd sheet export -n <name> -r B2:I25 -f csv       # Export range to CSV
```

</details>

<details>
<summary><b>Shell Completion</b></summary>

```bash
# Install completion
sheet-cmd completion install

# Reload shell
source ~/.zshrc   # for zsh
source ~/.bashrc  # for bash

# Use sheet completion
sheet-cmd <TAB>
sheet-cmd spreadsheet <TAB>
sheet-cmd sheet <TAB>
```

</details>

## :package: Setup

### Getting OAuth Credentials from Google Cloud Console

To use this tool, you need OAuth 2.0 credentials:

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create or select a project**
3. **Enable APIs**
   - Go to "APIs & Services" > "Library"
   - Search and enable "Google Sheets API"
   - Search and enable "Google Drive API"
4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - User Type: **External**
   - Fill in app name, user support email, developer email
   - **Add test users**: Add your email address(es)
   - **Scopes**: The app will request required scopes automatically
5. **Create OAuth 2.0 Client ID**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: **Desktop app**
   - Give it a name (e.g., "sheet-cmd")
   - Click "Create"
   - **Copy the Client ID and Client Secret**

You'll need:
- **OAuth Client ID**: From the credentials you created
- **OAuth Client Secret**: From the credentials you created

**Note**: The first time you authenticate, you'll see an "unverified app" warning. This is normal for apps in testing mode. Click "Advanced" → "Go to [app name] (unsafe)" to proceed.

### Configuration Files

Configuration files are stored in:
- **Linux/WSL**: `~/.config/sheet-cmd/`
- **macOS**: `~/Library/Preferences/sheet-cmd/`
- **Windows**: `~/AppData/Roaming/sheet-cmd/`

Files:
- `user_metadata.json` - Stores accounts, active account, and spreadsheets
- `config.json` - Stores general settings

Example `user_metadata.json` structure:
```json
{
  "config_path": "~/.config/sheet-cmd/config.json",
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
          "spreadsheet_id": "1ABC..."
        }
      }
    }
  }
}
```

**Security**: All OAuth tokens are stored locally and automatically refreshed before expiry.

## :wrench: Development

```bash
npm install                     # Install dependencies
npm run dev                     # Run in development
npm run build                   # Build for production
npm run test:e2e                # Run E2E tests
```

## :scroll: License

MIT License - see [LICENSE](LICENSE) file for details.
