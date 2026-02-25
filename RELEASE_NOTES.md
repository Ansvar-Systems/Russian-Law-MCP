# Release Notes

## v0.1.0 (2026-02-25)

### Initial Release

First public release of the Russian Law MCP server.

### Features

- **108 federal laws** covering the Constitution, 25 codes, 7 federal constitutional laws, and 75 federal laws
- **5,364 provisions** with full-text search (FTS5 with BM25 ranking)
- **13 tools** for comprehensive legal research:
  - `search_legislation` -- Full-text search across all provisions
  - `get_provision` -- Retrieve specific provision by document and article
  - `validate_citation` -- Zero-hallucination citation validation
  - `build_legal_stance` -- Aggregate citations for a legal question
  - `format_citation` -- Format citations per Russian conventions
  - `check_currency` -- Verify if a statute is in force
  - `get_eu_basis` -- Get EU/international legal basis for a Russian statute
  - `get_russian_implementations` -- Find Russian laws implementing EU instruments
  - `search_eu_implementations` -- Search EU documents with Russian implementation info
  - `get_provision_eu_basis` -- Provision-level EU cross-references
  - `validate_eu_compliance` -- Check EU compliance status
  - `list_sources` -- Data provenance metadata
  - `about` -- Server metadata and statistics

### Data Sources

- All legislation sourced from **pravo.gov.ru** (Official Internet Portal for Legal Information)
- Federal laws not copyrightable per Article 1259 of the Civil Code

### Deployment Options

- **npm**: `npx @ansvar/russian-law-mcp`
- **Remote**: `https://russian-law-mcp.vercel.app/mcp`
- **Docker**: Multi-stage build included

### Key Domain Coverage

| Domain | Key Laws |
|--------|----------|
| Data Protection | 152-FZ, 149-FZ, 242-FZ |
| Cybersecurity | 187-FZ, 63-FZ, 126-FZ |
| Criminal | UK RF, UPK RF, KoAP RF |
| Civil/Commercial | GK RF Parts 1-4 |
| Labor | TK RF, 79-FZ |
| Tax | NK RF Parts 1-2 |

### Known Limitations

- Some laws ingested as stub entries (single provision) pending full article-level parsing
- No regional legislation, court decisions, or legal commentary
- See [COVERAGE_LIMITATIONS.md](COVERAGE_LIMITATIONS.md) for full details
