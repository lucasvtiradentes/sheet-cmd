# gsheet-lvt

## 0.2.1

### Patch Changes

- c68e72c: Import CSV files with a single Google Sheets values update instead of appending rows one at a time.

  Allow `sheet write --initial-cell` to write JSON table values from a start cell and auto-calculate the destination range.

  Infer numeric-looking JSON string values by default when writing, with `--no-infer-types` available to keep them as text.

  Infer numeric-looking CSV values by default when importing, with `--no-infer-types` available to keep them as text.

  Standardize type inference across cell writes and appended rows, and allow CSV imports to start from `--initial-cell`.

- d583fc0: Keep development shell completions bound only to development binary names and document completion setup.

## 0.2.0

### Minor Changes

- 36ae13f: Add spreadsheet creation support through the CLI and library API.

  The release adds a new `spreadsheet create` command, Drive file scope handling, and runtime-aware command names in user-facing guidance so `gs`, `gsheet`, and dev binaries show the correct command name.

## 0.1.0

### Minor Changes

- db64b6f: Rename the package and CLI to the new gsheet identity.

  This release publishes the package as `gsheet-lvt`, exposes the `gsheet` and `gs` binaries, and resets the package history for the new npm package.

  It also migrates the CLI to Caporal, centralizes command metadata, regenerates README command docs from the command catalog, improves shell completion generation, and adds a library entrypoint for importing Google Sheets helpers from npm.

  The command surface now includes account, spreadsheet, sheet, update, and explicit completion commands for `zsh`, `bash`, and `fish`. Local development shims are available as `gsheetd` and `gsd`.
