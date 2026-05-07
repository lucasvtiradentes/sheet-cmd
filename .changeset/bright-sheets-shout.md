---
"gsheet-lvt": minor
---

Rename the package and CLI to the new gsheet identity.

This release publishes the package as `gsheet-lvt`, exposes the `gsheet` and `gs` binaries, and resets the package history for the new npm package.

It also migrates the CLI to Caporal, centralizes command metadata, regenerates README command docs from the command catalog, improves shell completion generation, and adds a library entrypoint for importing Google Sheets helpers from npm.

The command surface now includes account, spreadsheet, sheet, update, and explicit completion commands for `zsh`, `bash`, and `fish`. Local development shims are available as `gsheetd` and `gsd`.
