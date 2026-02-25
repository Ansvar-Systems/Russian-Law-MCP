#!/usr/bin/env tsx
/**
 * check-updates.ts — Freshness monitoring for Russian Law MCP.
 *
 * 1. Makes a HEAD request to pravo.gov.ru to check reachability
 * 2. Compares the census date with current date
 * 3. If census is >30 days old, prints a warning
 *
 * Exit codes:
 *   0 — fresh (census <30 days old)
 *   1 — stale (census >30 days old) or error
 *
 * Usage: npm run check-updates
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CENSUS_PATH = path.resolve(__dirname, '../data/census.json');
const PRAVO_URL = 'https://pravo.gov.ru/';
const STALE_THRESHOLD_DAYS = 30;

// ─────────────────────────────────────────────────────────────────────────────
// Check pravo.gov.ru reachability
// ─────────────────────────────────────────────────────────────────────────────

async function checkPravoReachability(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(PRAVO_URL, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (response.ok || response.status === 301 || response.status === 302) {
      console.log(`  pravo.gov.ru: reachable (HTTP ${response.status})`);
      return true;
    } else {
      console.warn(`  pravo.gov.ru: unexpected status ${response.status}`);
      return false;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`  pravo.gov.ru: unreachable (${message})`);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Check census freshness
// ─────────────────────────────────────────────────────────────────────────────

interface CensusFile {
  generated_at: string;
  stats?: {
    total: number;
    ingestable: number;
  };
}

function checkCensusFreshness(): { fresh: boolean; daysOld: number; censusDate: string } {
  if (!fs.existsSync(CENSUS_PATH)) {
    console.error('  census.json not found. Run: npm run ingest:census');
    return { fresh: false, daysOld: -1, censusDate: 'missing' };
  }

  const census = JSON.parse(fs.readFileSync(CENSUS_PATH, 'utf-8')) as CensusFile;
  const generatedAt = new Date(census.generated_at);
  const now = new Date();
  const daysOld = Math.floor((now.getTime() - generatedAt.getTime()) / (24 * 60 * 60 * 1000));
  const fresh = daysOld <= STALE_THRESHOLD_DAYS;

  return { fresh, daysOld, censusDate: census.generated_at };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('Russian Law MCP — Freshness Check\n');

  // 1. Check pravo.gov.ru reachability
  console.log('Source reachability:');
  const reachable = await checkPravoReachability();

  // 2. Check census freshness
  console.log('\nCensus freshness:');
  const { fresh, daysOld, censusDate } = checkCensusFreshness();

  if (daysOld === -1) {
    console.error('  MISSING — no census.json found');
  } else if (fresh) {
    console.log(`  OK — census is ${daysOld} day(s) old (generated: ${censusDate})`);
  } else {
    console.warn(`  STALE — census is ${daysOld} day(s) old (threshold: ${STALE_THRESHOLD_DAYS})`);
    console.warn(`  Generated: ${censusDate}`);
    console.warn('  Action: run "npm run ingest:census" to refresh');
  }

  // 3. Summary
  console.log('\n─────────────────────────────────');
  if (fresh && reachable) {
    console.log('Status: FRESH');
    process.exit(0);
  } else if (fresh && !reachable) {
    console.log('Status: FRESH (source unreachable — may be transient)');
    process.exit(0);
  } else {
    console.log('Status: STALE — update recommended');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
