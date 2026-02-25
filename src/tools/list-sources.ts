/**
 * list_sources tool — returns data provenance metadata.
 * Required by Ansvar MCP audit standard (Phase 1.5).
 */

import type Database from '@ansvar/mcp-sqlite';

export interface ListSourcesResult {
  jurisdiction: string;
  sources: Array<{
    name: string;
    authority: string;
    url: string;
    retrieval_method: string;
    update_frequency: string;
    last_ingested: string;
    license: string;
    coverage: string;
    limitations: string;
  }>;
  data_freshness: {
    automated_checks: boolean;
    check_frequency: string;
    last_verified: string;
  };
}

/**
 * Read the database build date from db_metadata if available.
 * Falls back to a sensible default if the table doesn't exist.
 */
function readBuildDate(db?: InstanceType<typeof Database>): string {
  if (!db) return 'unknown';
  try {
    const hasTable = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='db_metadata'"
    ).get();
    if (!hasTable) return 'unknown';

    const row = db.prepare("SELECT value FROM db_metadata WHERE key = 'built_at'").get() as
      | { value: string }
      | undefined;
    if (row?.value && row.value !== 'unknown') {
      // Return date portion only (YYYY-MM-DD)
      return row.value.slice(0, 10);
    }
  } catch {
    // Non-fatal
  }
  return 'unknown';
}

export function listSources(db?: InstanceType<typeof Database>): ListSourcesResult {
  const buildDate = readBuildDate(db);
  const lastIngested = buildDate !== 'unknown' ? buildDate : 'see about tool';

  return {
    jurisdiction: 'Russia (RU)',
    sources: [
      {
        name: 'pravo.gov.ru',
        authority: 'Official Internet Portal for Legal Information (Официальный интернет-портал правовой информации)',
        url: 'https://pravo.gov.ru/',
        retrieval_method: 'API + web scraping',
        update_frequency: 'on_change',
        last_ingested: lastIngested,
        license: 'Russian federal laws are not subject to copyright per Article 1259 of the Civil Code of the Russian Federation',
        coverage: 'Russian federal statutes, codes, presidential decrees, and government resolutions',
        limitations: 'Regional (subject-level) legislation not included; historical versions limited; court decisions not yet covered',
      },
      {
        name: 'EUR-Lex',
        authority: 'Publications Office of the European Union',
        url: 'https://eur-lex.europa.eu/',
        retrieval_method: 'API + manual verification',
        update_frequency: 'on_change',
        last_ingested: lastIngested,
        license: 'EU public domain',
        coverage: 'EU documents cross-referenced from Russian statutes (limited — Russia is not an EU member state)',
        limitations: 'Metadata only; cross-references are limited to international treaty implementations and harmonization efforts',
      },
    ],
    data_freshness: {
      automated_checks: true,
      check_frequency: 'daily',
      last_verified: lastIngested,
    },
  };
}
