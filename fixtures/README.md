# Test Fixtures

## golden-tests.json

Contract test definitions for the Russian Law MCP server. Each test specifies:

- **tool**: the MCP tool to call
- **input**: parameters to pass
- **assertions**: validation rules (`result_not_empty`, `min_results:N`, `text_contains:X`, `result_null`, `result_empty`, `no_error`, `fields_present:field1,field2`)

Uses real document IDs from the production database (e.g., `constitution-rf`, `fz-152-2006`).

Run: `npm run test:contract`

## golden-hashes.json

SHA-256 hashes of normalized constitutional provision text. Used by `scripts/drift-detect.ts` to detect when source text has changed and the database needs re-ingestion.

Normalization: `content.replace(/\s+/g, ' ').trim().toLowerCase()`

Run: `npm run drift:detect`
