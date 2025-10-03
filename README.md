<div align="center">
<a href="https://www.google.com/sheets/about/" target="_blank" rel="noopener noreferrer">
  <img width="64" src="https://www.gstatic.com/images/branding/product/2x/sheets_2020q4_48dp.png" alt="Google Sheets logo">
</a>
<h2>Sheet cmd</h2>
<p>A CLI tool to interact with Google Sheets - perfect for LLM integrations</p>
</div>



## :star: Features

- **Multi-spreadsheet support** - Manage multiple Google Sheets with separate credentials
- **Active spreadsheet system** - Set once, use everywhere (no need for -s flag)
- **Complete tab management** - Create, rename, copy, and remove tabs
- **Data operations** - Read, write, append rows with multiple output formats
- **Formula preservation** - Backup/restore with formulas intact (CSV-raw format)
- **Import/Export** - CSV import and export to JSON/CSV formats
- **Backup & Restore** - Full or partial backups with formula preservation
- **Secure credential management** - All credentials stored locally on your machine
- **LLM-friendly** - Designed for AI tool integrations like Claude Code
- **Shell completion** - Auto-completion for zsh and bash
- **Self-updating** - Built-in update mechanism that detects your package manager

## :question: Motivation

Why build a CLI for Google Sheets?

Because I want to enable LLMs like [Claude Code](https://www.anthropic.com/claude-code) to easily interact with my Google Sheets data. This tool provides a simple, secure, and flexible way to manage multiple spreadsheets with different credentials, making it perfect for AI-powered workflows.

## :rocket: Quick Start

1. **Get your Google Service Account credentials** from [Google Cloud Console](https://console.cloud.google.com/)
2. **Add your spreadsheet**: `sheet-cmd spreadsheet add` (Interactive setup)
3. **Set as active**: `sheet-cmd spreadsheet switch my-sheet`
4. **List tabs**: `sheet-cmd sheet list-tabs`

## :bulb: Usage

### Installation

```bash
npm install sheet-cmd -g
# to uninstall run: npm uninstall sheet-cmd -g
```

### General

```bash
sheet-cmd update                          # Update to latest version (auto-detects npm/yarn/pnpm)
sheet-cmd --help                          # Show available commands
sheet-cmd <command> --help                # Show help for specific command
```

### Spreadsheet Management

```bash
sheet-cmd spreadsheet add                 # Add spreadsheet (interactive)
sheet-cmd spreadsheet list                # List all spreadsheets (* = active)
sheet-cmd spreadsheet switch <name>       # Set active spreadsheet
sheet-cmd spreadsheet active              # Show currently active spreadsheet
sheet-cmd spreadsheet remove [name]       # Remove spreadsheet
```

### Sheet Operations

All sheet commands use the active spreadsheet if `-s` flag is not specified.

#### Tab Management

```bash
sheet-cmd sheet list-tabs                 # List all tabs
sheet-cmd sheet add-tab -t <name>         # Add a new tab
sheet-cmd sheet remove-tab -t <name>      # Remove a tab
sheet-cmd sheet rename-tab -t <old> -n <new>  # Rename a tab
sheet-cmd sheet copy-tab -t <name> --to <new>  # Copy a tab
```

#### Data Operations

```bash
# Read sheet content
sheet-cmd sheet read-sheet -t <name>                    # Read in markdown format
sheet-cmd sheet read-sheet -t <name> -f csv             # Read in CSV format
sheet-cmd sheet read-sheet -t <name> -f csv-raw         # Read with formulas (CSV)
sheet-cmd sheet read-sheet -t <name> -o output.md       # Save to file

# Write to cells
sheet-cmd sheet write-cell -t <name> -c A1 -v "Hello"   # Write to single cell
sheet-cmd sheet write-cell -t <name> -r A1:B2 -v "val1, val2; val3, val4"  # Write to range

# Append rows
sheet-cmd sheet append-row -t <name> -v "col1, col2, col3"  # Append new row
```

#### Import/Export

```bash
# Import CSV
sheet-cmd sheet import-csv -t <name> -f data.csv        # Import CSV
sheet-cmd sheet import-csv -t <name> -f data.csv --skip-header  # Skip first row

# Export data
sheet-cmd sheet export -t <name> -f json -o output.json # Export to JSON
sheet-cmd sheet export -t <name> -f csv -o output.csv   # Export to CSV
sheet-cmd sheet export -t <name> -r B2:I25 -f csv       # Export range to CSV
```

#### Backup & Restore

```bash
# Backup (saves in CSV format with formulas preserved)
sheet-cmd sheet backup -o ./backup/                     # Backup all tabs
sheet-cmd sheet backup -o ./backup/ -t monthly          # Backup specific tab

# Restore (preserves formulas)
sheet-cmd sheet restore -i ./backup/2025-10-03T04-40-32/  # Restore all tabs
sheet-cmd sheet restore -i ./backup/2025-10-03T04-40-32/ -t monthly  # Restore specific tab
sheet-cmd sheet restore -i ./backup/2025-10-03T04-40-32/ --create-tabs  # Create tabs if needed
```

## :gear: Shell Completion

Enable autocompletion for commands and subcommands in your shell:

```bash
# Install completion for your current shell (auto-detects and gives instructions)
sheet-cmd completion install
```

After installation, restart your shell or source your shell config file:

```bash
# For zsh
source ~/.zshrc

# For bash
source ~/.bashrc
```

Now you can use tab completion:
- `sheet-cmd <TAB>` → shows: spreadsheet, sheet, update, completion
- `sheet-cmd spreadsheet <TAB>` → shows: add, list, switch, active, remove
- `sheet-cmd sheet <TAB>` → shows: list-tabs, read-sheet, add-tab, remove-tab, rename-tab, copy-tab, write-cell, append-row, import-csv, export, backup, restore

## :package: Setting Up Google Service Account

To use this tool, you need a Google Service Account with access to your spreadsheet:

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create or select a project**
3. **Enable Google Sheets API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. **Create a Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the details and click "Create"
5. **Create a Key**
   - Click on the service account you created
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Select "JSON" and click "Create"
   - Download and save the JSON file
6. **Share your Google Sheet**
   - Open your Google Sheet
   - Click "Share"
   - Add the service account email (found in the JSON file)
   - Give it "Editor" permissions

You'll need:
- **Spreadsheet ID**: From the URL `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
- **Service Account Email**: From the JSON file (`client_email`)
- **Private Key**: From the JSON file (`private_key`)

## :file_folder: Configuration

Configuration files are stored in:
- **Linux/WSL**: `~/.config/sheet-cmd/`
- **macOS**: `~/Library/Preferences/sheet-cmd/`
- **Windows**: `~/AppData/Roaming/sheet-cmd/`

Files:
- `user_metadata.json` - Stores active spreadsheet name
- `config.json` - Stores all spreadsheet credentials and settings

Example `config.json`:
```json
{
  "spreadsheets": {
    "my-sheet": {
      "name": "my-sheet",
      "spreadsheet_id": "1ABC...",
      "service_account_email": "my-service-account@project.iam.gserviceaccount.com",
      "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
    }
  },
  "settings": {
    "max_results": 50,
    "default_columns": "A:Z"
  }
}
```

## :wrench: Development

```bash
npm run dev                               # Run in development
npm run build                             # Build for production
npm run test                              # Run tests
```

## :scroll: License

MIT License - see [LICENSE](LICENSE) file for details.
