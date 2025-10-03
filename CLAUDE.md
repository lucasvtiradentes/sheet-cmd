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
- `sheet-cmd spreadsheet [add|list|remove]` - Spreadsheet configuration management
- `sheet-cmd sheet [list-tabs]` - Sheet operations
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
- Two-tier system: `user_metadata.json` points to active `config.json`
- Supports multiple Google Sheets with separate credentials per spreadsheet

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
- `getSheetInfo()` - Get spreadsheet metadata and list of tabs
- `getSheetData()` - Read data from a specific sheet
- `updateCell()` - Update a single cell
- `updateMultipleCells()` - Batch update multiple cells
- `addRow()` - Append a new row to a sheet

When extending the service, maintain the existing patterns and error handling.
