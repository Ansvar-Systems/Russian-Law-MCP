/**
 * search_legislation — Full-text search across Russian statute provisions.
 */

import type { Database } from '@ansvar/mcp-sqlite';
import { buildFtsQueryVariants } from '../utils/fts-query.js';
import { generateResponseMetadata, type ToolResponse } from '../utils/metadata.js';

export interface SearchLegislationInput {
  query: string;
  document_id?: string;
  status?: string;
  limit?: number;
}

export interface SearchLegislationResult {
  document_id: string;
  document_title: string;
  provision_ref: string;
  chapter: string | null;
  section: string;
  title: string | null;
  snippet: string;
  relevance: number;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export async function searchLegislation(
  db: Database,
  input: SearchLegislationInput
): Promise<ToolResponse<SearchLegislationResult[]>> {
  if (!input.query || input.query.trim().length === 0) {
    return {
      results: [],
      _metadata: generateResponseMetadata(db)
    };
  }

  const limit = Math.min(Math.max(input.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const queryVariants = buildFtsQueryVariants(input.query);

  const params: (string | number)[] = [];

  let sql = `
    SELECT
      p.document_id,
      l.title as document_title,
      p.provision_ref,
      p.chapter,
      p.section,
      p.title,
      snippet(provisions_fts, 0, '>>>', '<<<', '...', 32) as snippet,
      bm25(provisions_fts) as relevance
    FROM provisions_fts
    JOIN provisions p ON p.id = provisions_fts.rowid
    JOIN laws l ON l.id = p.document_id
    WHERE provisions_fts MATCH ?
  `;

  if (input.document_id) {
    sql += ` AND p.document_id = ?`;
    params.push(input.document_id);
  }

  if (input.status) {
    sql += ` AND l.status = ?`;
    params.push(input.status);
  }

  sql += ` ORDER BY relevance LIMIT ?`;
  params.push(limit);

  const runQuery = (ftsQuery: string): SearchLegislationResult[] => {
    const bound = [ftsQuery, ...params];
    return db.prepare(sql).all(...bound) as SearchLegislationResult[];
  };

  const primaryResults = runQuery(queryVariants.primary);
  const results = (primaryResults.length > 0 || !queryVariants.fallback)
    ? primaryResults
    : runQuery(queryVariants.fallback);

  return {
    results,
    _metadata: generateResponseMetadata(db)
  };
}
