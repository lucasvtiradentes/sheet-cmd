# gsheet-lvt

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
