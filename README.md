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
- **Import/Export** - CSV import and export to JSON/CSV formats
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
4. **List tabs**: `sheet-cmd sheet list-sheets`

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

#### Sheet Management

```bash
sheet-cmd sheet list-sheets                 # List all sheets
sheet-cmd sheet add-sheet -n <name>         # Add a new sheet
sheet-cmd sheet remove-sheet -n <name>      # Remove a sheet
sheet-cmd sheet rename-sheet -n <old> --new-name <new>  # Rename a sheet
sheet-cmd sheet copy-sheet -n <name> --to <new>  # Copy a sheet
```

#### Data Operations

```bash
# Read sheet content
sheet-cmd sheet read-sheet -n <name>                    # Read in markdown format
sheet-cmd sheet read-sheet -n <name> -o csv             # Read in CSV format
sheet-cmd sheet read-sheet -n <name> -f                 # Read with formulas
sheet-cmd sheet read-sheet -n <name> -e output.md       # Save to file

# Write to cells
sheet-cmd sheet write-cell -n <name> -c A1 -v "Hello"   # Write to single cell
sheet-cmd sheet write-cell -n <name> -r A1:B2 -v "val1, val2; val3, val4"  # Write to range

# Append rows
sheet-cmd sheet append-row -n <name> -v "col1, col2, col3"  # Append new row
```

#### Import/Export

```bash
# Import CSV
sheet-cmd sheet import-csv -n <name> -f data.csv        # Import CSV
sheet-cmd sheet import-csv -n <name> -f data.csv --skip-header  # Skip first row
sheet-cmd sheet import-csv -n <name> -f data.csv --clear  # Clear existing data before importing

# Export data
sheet-cmd sheet export -n <name> -f json -o output.json # Export to JSON
sheet-cmd sheet export -n <name> -f csv -o output.csv   # Export to CSV
sheet-cmd sheet export -n <name> -r B2:I25 -f csv       # Export range to CSV
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
- `sheet-cmd sheet <TAB>` → shows: list-sheets, read-sheet, add-sheet, remove-sheet, rename-sheet, copy-sheet, write-cell, append-row, import-csv, export

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
