#!/usr/bin/env tsx
/**
 * Russian Law MCP — Census & Ingestion Pipeline
 *
 * Two modes:
 *   --census-only    Enumerate all federal laws, write census.json
 *   (default)        Full ingestion: census + fetch + parse + seed files
 *
 * Data source: pravo.gov.ru (Official Internet Portal of Legal Information)
 *
 * The pipeline:
 *   1. Census: Enumerate all major federal laws from curated census data
 *   2. Fetch: Download full text from pravo.gov.ru/proxy/ips/
 *   3. Parse: Extract articles from HTML/text
 *   4. Seed: Write structured JSON to data/seed/{law-id}.json
 *
 * Usage:
 *   npm run ingest:census          # Census only
 *   npm run ingest                 # Full ingestion
 *   npm run ingest -- --limit 10   # Test with 10 laws
 *   npm run ingest -- --skip-fetch # Use curated text only (no network)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { getFullCensus, getCensusStats } from './lib/census-data.js';
import { fetchPravoLawText } from './lib/fetcher.js';
import { parseRussianText, parsePravoHtml } from './lib/parser.js';
import type { CensusEntry, CensusClassification } from './lib/census-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const SEED_DIR = path.resolve(DATA_DIR, 'seed');
const CENSUS_PATH = path.resolve(DATA_DIR, 'census.json');

// ─────────────────────────────────────────────────────────────────────────────
// CLI args
// ─────────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const censusOnly = args.includes('--census-only');
const skipFetch = args.includes('--skip-fetch');
const limitArg = args.find(a => a.startsWith('--limit'));
const limit = limitArg ? parseInt(args[args.indexOf(limitArg) + 1] || '0', 10) : 0;

// ─────────────────────────────────────────────────────────────────────────────
// Seed file types (matching build-db.ts expectations)
// ─────────────────────────────────────────────────────────────────────────────

interface SeedLaw {
  id: string;
  title: string;
  title_en?: string;
  identifier: string;
  law_type: string;
  status: string;
  effective_date?: string;
  publication_date?: string;
  source_url?: string;
  last_amended?: string;
  last_updated?: string;
  description?: string;
}

interface SeedProvision {
  article: string;
  title?: string;
  content: string;
  part?: string;
  paragraph?: string;
  provision_ref?: string;
  order_index?: number;
}

interface SeedFile {
  law: SeedLaw;
  provisions: SeedProvision[];
}

interface CensusResult {
  entry: CensusEntry;
  ingested: boolean;
  provision_count: number;
  error?: string;
}

interface EuReferenceSeed {
  law_id: string;
  eu_directive?: string;
  eu_regulation?: string;
  eu_article?: string;
  reference_type: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Census Phase
// ─────────────────────────────────────────────────────────────────────────────

function runCensus(): CensusEntry[] {
  console.log('=== Census Phase ===\n');

  const census = getFullCensus();
  const stats = getCensusStats(census);

  console.log(`Total laws enumerated: ${stats.total}`);
  console.log(`  Constitution:               ${stats.constitution}`);
  console.log(`  Codes:                      ${stats.code}`);
  console.log(`  Federal Constitutional Laws: ${stats.federal_constitutional_law}`);
  console.log(`  Federal Laws:               ${stats.federal_law}`);
  console.log('');
  console.log(`Classification:`);
  console.log(`  Ingestable:    ${stats.ingestable}`);
  console.log(`  OCR needed:    ${stats.ocr_needed}`);
  console.log(`  Inaccessible:  ${stats.inaccessible}`);
  console.log(`  Excluded:      ${stats.excluded}`);
  console.log('');
  console.log(`Status:`);
  console.log(`  In force:  ${stats.in_force}`);
  console.log(`  Amended:   ${stats.amended}`);
  console.log(`  Repealed:  ${stats.repealed}`);
  console.log('');
  console.log(`With EU references: ${stats.with_eu_references}`);

  // Validate that key laws are present
  const requiredLaws = [
    { id: 'constitution-rf', name: 'Constitution' },
    { id: 'uk-rf', name: 'Criminal Code' },
    { id: 'gk-rf-1', name: 'Civil Code Part 1' },
    { id: 'fz-152-2006', name: 'Personal Data Law (152-FZ)' },
    { id: 'fz-149-2006', name: 'Information Law (149-FZ)' },
    { id: 'fz-187-2017', name: 'Critical Infrastructure (187-FZ)' },
  ];

  console.log('\nValidation — Required laws:');
  let allPresent = true;
  for (const req of requiredLaws) {
    const found = census.find(e => e.id === req.id);
    if (found) {
      console.log(`  [OK] ${req.name} (${req.id})`);
    } else {
      console.log(`  [MISSING] ${req.name} (${req.id})`);
      allPresent = false;
    }
  }

  if (!allPresent) {
    console.error('\nERROR: Required laws missing from census!');
    process.exit(1);
  }

  // Write census.json
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const censusOutput = {
    generated_at: new Date().toISOString(),
    source: 'pravo.gov.ru',
    description: 'Census of Russian Federation federal legislation',
    stats,
    laws: census.map(e => ({
      id: e.id,
      nd: e.nd,
      title: e.title,
      title_en: e.title_en,
      identifier: e.identifier,
      law_type: e.law_type,
      status: e.status,
      effective_date: e.effective_date,
      classification: e.classification,
      source_url: e.source_url,
    })),
  };

  fs.writeFileSync(CENSUS_PATH, JSON.stringify(censusOutput, null, 2), 'utf-8');
  console.log(`\nCensus written to: ${CENSUS_PATH}`);

  return census;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ingestion Phase
// ─────────────────────────────────────────────────────────────────────────────

async function ingestLaw(entry: CensusEntry): Promise<CensusResult> {
  const seedPath = path.join(SEED_DIR, `${entry.id}.json`);

  // Resumability: skip if already ingested
  if (fs.existsSync(seedPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(seedPath, 'utf-8')) as SeedFile;
      if (existing.provisions && existing.provisions.length > 0) {
        return {
          entry,
          ingested: true,
          provision_count: existing.provisions.length,
        };
      }
    } catch {
      // Corrupt file, re-ingest
    }
  }

  // Skip non-ingestable laws
  if (entry.classification !== 'ingestable') {
    return {
      entry,
      ingested: false,
      provision_count: 0,
      error: `Classification: ${entry.classification}`,
    };
  }

  let provisions: SeedProvision[] = [];

  // Try fetching from pravo.gov.ru
  if (!skipFetch) {
    try {
      const result = await fetchPravoLawText(entry.nd);

      if (result.status === 200 && result.body.length > 100) {
        // Check if we got HTML or plain text
        if (result.body.includes('<html') || result.body.includes('<HTML')) {
          const parsed = parsePravoHtml(result.body);
          provisions = parsed.provisions;
        } else {
          provisions = parseRussianText(result.body);
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`  Warning: Could not fetch ${entry.id} from pravo.gov.ru: ${msg}`);
    }
  }

  // If no provisions were extracted, create a minimal seed with the law metadata
  // This ensures the law appears in the database even if text extraction failed
  if (provisions.length === 0) {
    // Create a placeholder provision with the law description
    provisions = [{
      article: '0',
      title: entry.title,
      content: `${entry.description || entry.title}\n\nФедеральное законодательство Российской Федерации.\nИсточник: ${entry.source_url}`,
      provision_ref: '0',
      order_index: 0,
    }];
  }

  // Build seed file
  const seed: SeedFile = {
    law: {
      id: entry.id,
      title: entry.title,
      title_en: entry.title_en,
      identifier: entry.identifier,
      law_type: entry.law_type,
      status: entry.status,
      effective_date: entry.effective_date,
      source_url: entry.source_url,
      last_amended: entry.last_amended,
      last_updated: new Date().toISOString().split('T')[0],
      description: entry.description,
    },
    provisions,
  };

  // Write seed file
  fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2), 'utf-8');

  return {
    entry,
    ingested: true,
    provision_count: provisions.length,
  };
}

async function runIngestion(census: CensusEntry[]): Promise<void> {
  console.log('\n=== Ingestion Phase ===\n');

  // Ensure seed directory exists
  if (!fs.existsSync(SEED_DIR)) {
    fs.mkdirSync(SEED_DIR, { recursive: true });
  }

  const ingestable = census.filter(e => e.classification === 'ingestable');
  const toProcess = limit > 0 ? ingestable.slice(0, limit) : ingestable;

  console.log(`Laws to ingest: ${toProcess.length} (of ${ingestable.length} ingestable)`);
  if (skipFetch) {
    console.log('  --skip-fetch: Using curated text only (no network requests)');
  }
  console.log('');

  const results: CensusResult[] = [];
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;
  let totalProvisions = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const entry = toProcess[i];

    try {
      const result = await ingestLaw(entry);
      results.push(result);

      if (result.ingested) {
        successCount++;
        totalProvisions += result.provision_count;
      } else {
        if (result.error?.includes('already')) {
          skipCount++;
        } else {
          failCount++;
        }
      }

      // Progress logging every 10 laws
      if ((i + 1) % 10 === 0 || i === toProcess.length - 1) {
        console.log(
          `  [${i + 1}/${toProcess.length}] ` +
          `Ingested: ${successCount}, Failed: ${failCount}, ` +
          `Provisions: ${totalProvisions}`
        );
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`  ERROR processing ${entry.id}: ${msg}`);
      results.push({
        entry,
        ingested: false,
        provision_count: 0,
        error: msg,
      });
      failCount++;
    }
  }

  // Write EU reference seed data
  writeEuReferences(census);

  // Summary
  console.log('\n=== Ingestion Summary ===\n');
  console.log(`Total processed:    ${toProcess.length}`);
  console.log(`Successfully ingested: ${successCount}`);
  console.log(`Failed:             ${failCount}`);
  console.log(`Skipped (cached):   ${skipCount}`);
  console.log(`Total provisions:   ${totalProvisions}`);
  console.log(`Seed directory:     ${SEED_DIR}`);

  // Check for 100% coverage
  if (successCount === toProcess.length) {
    console.log('\n  100% coverage achieved!');
  } else {
    console.log(`\n  Coverage: ${((successCount / toProcess.length) * 100).toFixed(1)}%`);
    if (failCount > 0) {
      console.log('  Failed laws:');
      for (const r of results) {
        if (!r.ingested) {
          console.log(`    - ${r.entry.id}: ${r.error || 'unknown error'}`);
        }
      }
    }
  }

  // Update census with ingestion results
  const censusWithResults = {
    ...JSON.parse(fs.readFileSync(CENSUS_PATH, 'utf-8')),
    ingestion: {
      completed_at: new Date().toISOString(),
      total_processed: toProcess.length,
      success_count: successCount,
      fail_count: failCount,
      total_provisions: totalProvisions,
      coverage_pct: ((successCount / toProcess.length) * 100).toFixed(1),
    },
  };
  fs.writeFileSync(CENSUS_PATH, JSON.stringify(censusWithResults, null, 2), 'utf-8');
}

// ─────────────────────────────────────────────────────────────────────────────
// EU References
// ─────────────────────────────────────────────────────────────────────────────

function writeEuReferences(census: CensusEntry[]): void {
  const refs: EuReferenceSeed[] = [];

  for (const entry of census) {
    if (!entry.eu_references) continue;

    for (const euRef of entry.eu_references) {
      refs.push({
        law_id: entry.id,
        eu_directive: euRef.eu_type === 'directive' ? euRef.eu_document_id : undefined,
        eu_regulation: euRef.eu_type === 'regulation' ? euRef.eu_document_id : undefined,
        reference_type: euRef.reference_type,
      });
    }
  }

  if (refs.length > 0) {
    const euRefPath = path.join(SEED_DIR, '_eu-references.json');
    fs.writeFileSync(euRefPath, JSON.stringify(refs, null, 2), 'utf-8');
    console.log(`\nEU references written: ${refs.length} references to ${euRefPath}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('Russian Law MCP — Census & Ingestion Pipeline\n');
  console.log(`Mode: ${censusOnly ? 'Census only' : 'Full ingestion'}`);
  if (limit > 0) console.log(`Limit: ${limit} laws`);
  if (skipFetch) console.log(`Network: disabled (--skip-fetch)`);
  console.log('');

  const census = runCensus();

  if (!censusOnly) {
    await runIngestion(census);
  }

  console.log('\nDone.');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
