# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Build & Development
- `npm run build` - Build TypeScript to dist/
- `npm run dev` - Run TypeScript directly with tsx
- `npm run typecheck` - Check TypeScript types without emitting

### Turbo Commands
- `npm run turbo:typecheck` - Run typecheck with Turbo (cached)
- `npm run turbo:build` - Run build with Turbo (cached)
- `npm run turbo:dev` - Run dev with Turbo

### Release & Publishing
- `npm run changeset` - Create a changeset for version management
- `npm run release` - Build and publish to npm (automated via GitHub Actions)

## Architecture Overview

This is a CLI tool for Google Sheets that provides a secure, multi-spreadsheet management interface perfect for LLM integrations like Claude Code.

### Command Structure
Commands follow a hierarchical pattern using Commander.js:

#### Spreadsheet Management (`sheet-cmd spreadsheet`)
- `add` - Add a new spreadsheet (interactive)
- `list` - List all configured spreadsheets (* = active)
- `remove` - Remove a spreadsheet configuration
- `switch` - Sets the active spreadsheet (no need for -s flag in subsequent commands)
- `active` - Shows which spreadsheet is currently active

#### Sheet Operations (`sheet-cmd sheet`)
All sheet commands use the active spreadsheet if `-s` flag is not specified.

**Tab Management:**
- `list-tabs` - List all tabs/sheets in a spreadsheet
- `add-tab -t <name>` - Add a new tab/sheet
- `remove-tab -t <name>` - Remove a tab/sheet
- `rename-tab -t <old> -n <new>` - Rename a tab/sheet
- `copy-tab -t <name> --to <new>` - Copy a tab to a new tab

**Data Operations:**
- `read-sheet -t <name> [-f format] [-o file]` - Read sheet content (formats: markdown, csv, csv-raw)
- `write-cell -t <name> -c <cell> -v <value>` - Write to a single cell
- `write-cell -t <name> -r <range> -v <values>` - Write to a range (use `,` for columns, `;` for rows)
- `append-row -t <name> -v <values>` - Append a row to the end

**Import/Export:**
- `import-csv -t <name> -f <file> [--skip-header]` - Import CSV file to a tab
- `export -t <name> [-r range] -f <format> [-o file]` - Export to JSON or CSV

**Backup/Restore:**
- `backup -o <dir> [-t tab]` - Backup all tabs (or specific tab) in CSV format with formulas
- `restore -i <dir> [-t tab] [--create-tabs]` - Restore from backup (preserves formulas)

#### Utility Commands
- `sheet-cmd update` - Self-update functionality
- `sheet-cmd completion install` - Shell completion management

Each command is modular and self-contained in `src/commands/`.

**⚠️ IMPORTANT: Shell Completion Maintenance**
When adding, removing, or modifying commands/subcommands, you MUST update the shell completion scripts in `src/commands/completion.ts`:
- Update `ZSH_COMPLETION_SCRIPT` with new commands and their descriptions
- Update `BASH_COMPLETION_SCRIPT` with new command lists
- Test completion works: `npm run build && node dist/cli.js completion install`

### Configuration Management
The `ConfigManager` class handles all configuration:
- Configs stored in OS-specific directories (Linux: `~/.config/sheet-cmd/`)
- Uses JSON format for configs
- Two-tier system:
  - `user_metadata.json` - Stores active config path and active spreadsheet name
  - `config.json` - Stores all spreadsheet credentials and settings
- Supports multiple Google Sheets with separate credentials per spreadsheet
- Active spreadsheet system: Set once with `switch`, use everywhere without -s flag
- Auto-cleanup: Removing a spreadsheet clears it as active if it was set

### Google Sheets Integration
The `GoogleSheetsService` wraps the `google-spreadsheet` library:
- Uses service account authentication
- Supports reading/writing cells and entire sheets
- Handles multiple spreadsheets with different credentials
- Credentials stored securely in local config

### Type Safety
- Uses Zod for runtime validation and type generation
- Strict TypeScript configuration
- Clear separation between Google Sheets API types and internal types

### Key Design Patterns
- Command Pattern for CLI commands
- Singleton Pattern for ConfigManager
- Service Pattern for GoogleSheetsService
- Repository Pattern for spreadsheet credential management

## Important Notes

- Always check for existing patterns before implementing new features
- Multi-spreadsheet support is a core feature - maintain compatibility
- Error messages should be user-friendly with helpful hints
- Cross-platform compatibility is required (Linux, macOS, Windows, WSL)
- Security is critical - credentials are stored locally and never exposed
- The tool is designed to be LLM-friendly with clear, structured outputs

## Adding New Commands

When adding a new command:

1. Create a new file in `src/commands/sheet/` or `src/commands/spreadsheet/`
2. Implement the command using Commander.js following existing patterns
3. Export a factory function (e.g., `createYourCommand()`)
4. Add the command to the appropriate index file
5. Update shell completion scripts in `src/commands/completion.ts`
6. Update help text in `src/cli.ts`
7. Test with `npm run dev -- your-command`
8. Build and verify with `npm run build`

## Google Sheets Service

The `GoogleSheetsService` provides:

**Sheet Information:**
- `getSheetInfo()` - Get spreadsheet metadata and list of tabs

**Reading Data:**
- `getSheetData(sheetName, includeFormulas?)` - Read all data from a sheet (with optional formulas)
- `getSheetDataRange(sheetName, range, includeFormulas?)` - Read data from a specific range

**Writing Data:**
- `writeCell(sheetName, cell, value)` - Write to a single cell
- `writeCellRange(sheetName, range, values[][])` - Write to a range of cells (preserves formulas)
- `appendRow(sheetName, values[])` - Append a new row to the end of a sheet

**Tab Management:**
- `addSheet(sheetName)` - Create a new tab/sheet
- `removeSheet(sheetName)` - Delete a tab/sheet
- `renameSheet(oldName, newName)` - Rename a tab/sheet
- `copySheet(sheetName, newSheetName)` - Duplicate a tab/sheet

When extending the service, maintain the existing patterns and error handling.
