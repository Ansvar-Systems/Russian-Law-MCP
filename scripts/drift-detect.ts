#!/usr/bin/env tsx
/**
 * drift-detect.ts — Content drift detection for Russian Law MCP.
 *
 * Loads fixtures/golden-hashes.json and compares SHA-256 hashes
 * of normalized provision text against the current database.
 *
 * Reports: OK, DRIFT, ERROR, SKIP
 *
 * Exit codes:
 *   0 — all hashes match (no drift)
 *   1 — error (e.g., database not found, provision missing)
 *   2 — drift detected (content has changed)
 *
 * Usage: npm run drift:detect
 */

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, '../data/database.db');
const HASHES_PATH = path.resolve(__dirname, '../fixtures/golden-hashes.json');

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface HashEntry {
  document_id: string;
  article: string;
  sha256: string;
  snippet: string;
}

interface GoldenHashesFile {
  schema_version: string;
  jurisdiction: string;
  description: string;
  normalization: string;
  entries: HashEntry[];
}

type Status = 'OK' | 'DRIFT' | 'ERROR' | 'SKIP';

interface CheckResult {
  document_id: string;
  article: string;
  status: Status;
  expected_hash?: string;
  actual_hash?: string;
  message?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

function main(): void {
  console.log('Russian Law MCP — Drift Detection\n');

  // Load hashes fixture
  if (!fs.existsSync(HASHES_PATH)) {
    console.error(`  ERROR: ${HASHES_PATH} not found`);
    process.exit(1);
  }

  const hashesFile = JSON.parse(fs.readFileSync(HASHES_PATH, 'utf-8')) as GoldenHashesFile;
  console.log(`Loaded ${hashesFile.entries.length} hash entries from golden-hashes.json\n`);

  // Open database
  if (!fs.existsSync(DB_PATH)) {
    console.error(`  ERROR: database not found at ${DB_PATH}`);
    process.exit(1);
  }

  const db = new Database(DB_PATH, { readonly: true });

  const results: CheckResult[] = [];
  let driftCount = 0;
  let errorCount = 0;
  let okCount = 0;
  let skipCount = 0;

  for (const entry of hashesFile.entries) {
    const { document_id, article, sha256: expectedHash } = entry;

    try {
      // Query provision from database
      const row = db.prepare(
        'SELECT content FROM provisions WHERE law_id = ? AND article = ?'
      ).get(document_id, article) as { content: string } | undefined;

      if (!row) {
        results.push({
          document_id,
          article,
          status: 'ERROR',
          message: 'Provision not found in database',
        });
        errorCount++;
        continue;
      }

      // Normalize and hash
      const normalized = normalizeText(row.content);
      const actualHash = sha256(normalized);

      if (actualHash === expectedHash) {
        results.push({ document_id, article, status: 'OK' });
        okCount++;
      } else {
        results.push({
          document_id,
          article,
          status: 'DRIFT',
          expected_hash: expectedHash,
          actual_hash: actualHash,
          message: `Content has changed. Snippet: "${normalized.substring(0, 60)}..."`,
        });
        driftCount++;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({
        document_id,
        article,
        status: 'ERROR',
        message,
      });
      errorCount++;
    }
  }

  db.close();

  // Print results
  for (const r of results) {
    const statusIcon =
      r.status === 'OK' ? 'OK   ' :
      r.status === 'DRIFT' ? 'DRIFT' :
      r.status === 'ERROR' ? 'ERROR' :
      'SKIP ';

    const detail = r.message ? ` — ${r.message}` : '';
    console.log(`  [${statusIcon}] ${r.document_id} art.${r.article}${detail}`);
  }

  // Summary
  console.log(`\n─────────────────────────────────`);
  console.log(`Results: ${okCount} OK, ${driftCount} DRIFT, ${errorCount} ERROR, ${skipCount} SKIP`);

  if (errorCount > 0) {
    console.log('Exit: 1 (errors found)');
    process.exit(1);
  } else if (driftCount > 0) {
    console.log('Exit: 2 (drift detected — re-ingestion needed)');
    process.exit(2);
  } else {
    console.log('Exit: 0 (all hashes match)');
    process.exit(0);
  }
}

main();
