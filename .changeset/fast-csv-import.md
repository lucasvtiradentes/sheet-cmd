---
"gsheet-lvt": patch
---

Import CSV files with a single Google Sheets values update instead of appending rows one at a time.

Allow `sheet write --initial-cell` to write JSON table values from a start cell and auto-calculate the destination range.

Infer numeric-looking JSON string values by default when writing, with `--no-infer-types` available to keep them as text.
