/**
 * build_legal_stance — Aggregate citations from multiple sources for a legal question.
 *
 * Simplified version for Russian law: searches provisions only
 * (no case law or preparatory works support yet).
 */

import type { Database } from '@ansvar/mcp-sqlite';
import { buildFtsQueryVariants } from '../utils/fts-query.js';
import { generateResponseMetadata, type ToolResponse } from '../utils/metadata.js';

export interface BuildLegalStanceInput {
  query: string;
  document_id?: string;
  limit?: number;
}

interface ProvisionHit {
  document_id: string;
  document_title: string;
  provision_ref: string;
  title: string | null;
  snippet: string;
  relevance: number;
}

export interface LegalStanceResult {
  query: string;
  provisions: ProvisionHit[];
  total_citations: number;
}

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;

export async function buildLegalStance(
  db: Database,
  input: BuildLegalStanceInput
): Promise<ToolResponse<LegalStanceResult>> {
  if (!input.query || input.query.trim().length === 0) {
    return {
      results: { query: '', provisions: [], total_citations: 0 },
      _metadata: generateResponseMetadata(db)
    };
  }

  const limit = Math.min(Math.max(input.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const queryVariants = buildFtsQueryVariants(input.query);

  // Search provisions
  let provSql = `
    SELECT
      p.law_id as document_id,
      l.title as document_title,
      p.provision_ref,
      p.title,
      snippet(provisions_fts, 0, '>>>', '<<<', '...', 32) as snippet,
      bm25(provisions_fts) as relevance
    FROM provisions_fts
    JOIN provisions p ON p.id = provisions_fts.rowid
    JOIN laws l ON l.id = p.law_id
    WHERE provisions_fts MATCH ?
  `;

  const provParams: (string | number)[] = [];

  if (input.document_id) {
    provSql += ` AND p.law_id = ?`;
    provParams.push(input.document_id);
  }

  provSql += ` ORDER BY relevance LIMIT ?`;
  provParams.push(limit);

  const runProvisionQuery = (ftsQuery: string): ProvisionHit[] => {
    const bound = [ftsQuery, ...provParams];
    return db.prepare(provSql).all(...bound) as ProvisionHit[];
  };

  let provisions = runProvisionQuery(queryVariants.primary);
  if (provisions.length === 0 && queryVariants.fallback) {
    provisions = runProvisionQuery(queryVariants.fallback);
  }

  return {
    results: {
      query: input.query,
      provisions,
      total_citations: provisions.length,
    },
    _metadata: generateResponseMetadata(db)
  };
}
