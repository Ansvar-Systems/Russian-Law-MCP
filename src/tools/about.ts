import type Database from '@ansvar/mcp-sqlite';
import { detectCapabilities, readDbMetadata, type Capability, type Tier } from '../capabilities.js';

export interface AboutContext {
  version: string;
  fingerprint: string;
  dbBuilt: string;
}

export interface AboutResult {
  server: {
    name: string;
    package: string;
    version: string;
    suite: string;
    repository: string;
  };
  dataset: {
    tier: Tier;
    capabilities: Capability[];
    fingerprint: string;
    built: string;
    jurisdiction: string;
    content_basis: string;
    counts: Record<string, number>;
    freshness: {
      last_checked: string | null;
      check_method: string;
    };
  };
  provenance: {
    sources: string[];
    license: string;
    authenticity_note: string;
  };
  security: {
    access_model: string;
    network_access: boolean;
    filesystem_access: boolean;
    arbitrary_execution: boolean;
  };
}

function safeCount(db: InstanceType<typeof Database>, sql: string): number {
  try {
    const row = db.prepare(sql).get() as { count: number } | undefined;
    return row ? Number(row.count) : 0;
  } catch {
    return 0;
  }
}

export function getAbout(
  db: InstanceType<typeof Database>,
  context: AboutContext
): AboutResult {
  const counts: Record<string, number> = {
    laws: safeCount(db, 'SELECT COUNT(*) as count FROM laws'),
    provisions: safeCount(db, 'SELECT COUNT(*) as count FROM provisions'),
    eu_documents: safeCount(db, 'SELECT COUNT(*) as count FROM eu_documents'),
    eu_references: safeCount(db, 'SELECT COUNT(*) as count FROM eu_references'),
    cross_references: safeCount(db, 'SELECT COUNT(*) as count FROM cross_references'),
  };

  const capabilities = detectCapabilities(db);
  const metadata = readDbMetadata(db);

  return {
    server: {
      name: 'Russian Law MCP',
      package: '@ansvar/russian-law-mcp',
      version: context.version,
      suite: 'Ansvar Compliance Suite',
      repository: 'https://github.com/Ansvar-Systems/Russian-Law-MCP',
    },
    dataset: {
      tier: metadata.tier,
      capabilities: [...capabilities].sort(),
      fingerprint: context.fingerprint,
      built: context.dbBuilt,
      jurisdiction: 'Russia (RU)',
      content_basis:
        'Russian federal statute text from pravo.gov.ru. ' +
        'Not an official legal publication.',
      counts,
      freshness: {
        last_checked: null,
        check_method: 'Manual review',
      },
    },
    provenance: {
      sources: [
        'pravo.gov.ru (statutes)',
        'EUR-Lex (EU cross-references)',
      ],
      license:
        'Apache-2.0 (server code). Russian federal laws are not subject to copyright ' +
        'per Article 1259 of the Civil Code of the Russian Federation.',
      authenticity_note:
        'Statute text is derived from pravo.gov.ru. ' +
        'Verify against official publications (Официальный интернет-портал правовой информации).',
    },
    security: {
      access_model: 'read-only',
      network_access: false,
      filesystem_access: false,
      arbitrary_execution: false,
    },
  };
}
