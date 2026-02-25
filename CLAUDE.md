# CLAUDE.md — Russian Law MCP

## Git Workflow
- **Never push directly to `main`** — always go through `dev` first
- Create feature branches from `dev`
- PR to `dev` → verify → PR to `main`

## Project Overview
Russian Federal Law MCP server. 13 tools for querying Russian federal statutes, EU/international cross-references, and legal citations.

## Key Commands
- `npm run build` — Compile TypeScript
- `npm run test` — Run unit tests
- `npm run test:contract` — Run contract tests
- `npm run build:db` — Build SQLite from seed files
- `npm run ingest` — Ingest from pravo.gov.ru
- `npm run validate` — Full validation (lint + test + contract)

## Database
SQLite with FTS5 full-text search. Tables: laws, provisions, provisions_fts, eu_references, db_metadata.
Zero-hallucination: never generates citations, only returns verified database entries.
