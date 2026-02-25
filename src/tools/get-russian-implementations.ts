/**
 * get_russian_implementations — Find Russian statutes implementing an EU directive/regulation.
 */

import type { Database } from '@ansvar/mcp-sqlite';
import { generateResponseMetadata, type ToolResponse } from '../utils/metadata.js';

export interface GetRussianImplementationsInput {
  eu_document_id: string;
  primary_only?: boolean;
  in_force_only?: boolean;
}

interface RussianImplementation {
  document_id: string;
  document_title: string;
  short_name?: string;
  status: string;
  reference_type: string;
  is_primary_implementation: boolean;
  implementation_status?: string;
  articles_referenced?: string[];
}

interface EUDocRow {
  id: string;
  type: 'directive' | 'regulation';
  year: number;
  number: number;
  title: string | null;
  short_name: string | null;
  celex_number: string | null;
}

export interface GetRussianImplementationsResult {
  eu_document: {
    id: string;
    type: 'directive' | 'regulation';
    year: number;
    number: number;
    title?: string;
    short_name?: string;
    celex_number?: string;
  };
  implementations: RussianImplementation[];
  statistics: {
    total_statutes: number;
    primary_implementations: number;
    in_force: number;
    repealed: number;
  };
}

/**
 * Find Russian statutes that implement or reference a specific EU directive or regulation.
 */
export async function getRussianImplementations(
  db: Database,
  input: GetRussianImplementationsInput
): Promise<ToolResponse<GetRussianImplementationsResult>> {
  // Validate EU document ID format
  if (!input.eu_document_id || !/^(directive|regulation):\d+\/\d+$/.test(input.eu_document_id)) {
    throw new Error(
      `Invalid EU document ID format: "${input.eu_document_id}". Expected format: "directive:YYYY/NNN" or "regulation:YYYY/NNN" (e.g., "regulation:2016/679")`
    );
  }

  // Check if EU document exists
  const euDoc = db.prepare(`
    SELECT id, type, year, number, title, short_name, celex_number
    FROM eu_documents
    WHERE id = ?
  `).get(input.eu_document_id) as EUDocRow | undefined;

  if (!euDoc) {
    throw new Error(`EU document ${input.eu_document_id} not found in database`);
  }

  // Build query for Russian implementations
  let sql = `
    SELECT
      l.id AS document_id,
      l.title AS document_title,
      l.short_name AS short_name,
      l.status,
      CASE
        WHEN SUM(CASE WHEN er.reference_type = 'implements' THEN 1 ELSE 0 END) > 0 THEN 'implements'
        WHEN SUM(CASE WHEN er.reference_type = 'supplements' THEN 1 ELSE 0 END) > 0 THEN 'supplements'
        WHEN SUM(CASE WHEN er.reference_type = 'applies' THEN 1 ELSE 0 END) > 0 THEN 'applies'
        WHEN SUM(CASE WHEN er.reference_type = 'cites_article' THEN 1 ELSE 0 END) > 0 THEN 'cites_article'
        ELSE 'references'
      END AS reference_type,
      MAX(
        CASE
          WHEN er.is_primary_implementation = 1 THEN 1
          WHEN er.source_type = 'document' AND er.reference_type IN ('implements', 'supplements') THEN 1
          ELSE 0
        END
      ) AS is_primary_implementation,
      COALESCE(
        MAX(CASE WHEN er.is_primary_implementation = 1 THEN er.implementation_status END),
        MAX(er.implementation_status)
      ) AS implementation_status,
      GROUP_CONCAT(DISTINCT er.eu_article) AS articles_referenced
    FROM laws l
    JOIN eu_references er ON l.id = er.law_id
    WHERE er.eu_document_id = ?
  `;

  const params: (string | number)[] = [input.eu_document_id];

  // Filter by primary implementations only
  if (input.primary_only) {
    sql += ` AND er.is_primary_implementation = 1`;
  }

  // Filter by in-force statutes only
  if (input.in_force_only) {
    sql += ` AND l.status = 'in_force'`;
  }

  sql += `
    GROUP BY l.id, l.title, l.short_name, l.status
    ORDER BY
      MAX(
        CASE
          WHEN er.is_primary_implementation = 1 THEN 1
          WHEN er.source_type = 'document' AND er.reference_type IN ('implements', 'supplements') THEN 1
          ELSE 0
        END
      ) DESC,
      l.id
  `;

  interface QueryRow {
    document_id: string;
    document_title: string;
    short_name: string | null;
    status: string;
    reference_type: string;
    is_primary_implementation: number;
    implementation_status: string | null;
    articles_referenced: string | null;
  }

  const rows = db.prepare(sql).all(...params) as QueryRow[];

  // Transform rows into result format
  const implementations: RussianImplementation[] = rows.map(row => {
    const impl: RussianImplementation = {
      document_id: row.document_id,
      document_title: row.document_title,
      status: row.status,
      reference_type: row.reference_type,
      is_primary_implementation: row.is_primary_implementation === 1,
    };

    if (row.short_name) impl.short_name = row.short_name;
    if (row.implementation_status) impl.implementation_status = row.implementation_status;
    if (row.articles_referenced) {
      impl.articles_referenced = row.articles_referenced.split(',').filter(a => a && a.trim());
    }

    return impl;
  });

  // Calculate statistics
  const primaryCount = implementations.filter(i => i.is_primary_implementation).length;
  const inForceCount = implementations.filter(i => i.status === 'in_force').length;
  const repealedCount = implementations.filter(i => i.status === 'repealed').length;

  const result: GetRussianImplementationsResult = {
    eu_document: {
      id: euDoc.id,
      type: euDoc.type,
      year: euDoc.year,
      number: euDoc.number,
      title: euDoc.title ?? undefined,
      short_name: euDoc.short_name ?? undefined,
      celex_number: euDoc.celex_number ?? undefined,
    },
    implementations,
    statistics: {
      total_statutes: implementations.length,
      primary_implementations: primaryCount,
      in_force: inForceCount,
      repealed: repealedCount,
    },
  };

  return {
    results: result,
    _metadata: generateResponseMetadata(db),
  };
}
