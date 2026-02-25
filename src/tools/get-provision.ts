/**
 * get_provision — Retrieve a specific provision from a Russian statute.
 */

import type { Database } from '@ansvar/mcp-sqlite';
import { generateResponseMetadata, type ToolResponse } from '../utils/metadata.js';

export interface GetProvisionInput {
  document_id: string;
  chapter?: string;
  section?: string;
  provision_ref?: string;
}

export interface ProvisionResult {
  document_id: string;
  document_title: string;
  document_status: string;
  provision_ref: string;
  chapter: string | null;
  section: string;
  title: string | null;
  content: string;
  metadata: Record<string, unknown> | null;
  cross_references: CrossRefResult[];
}

interface CrossRefResult {
  target_document_id: string;
  target_provision_ref: string | null;
  ref_type: string;
}

interface ProvisionRow {
  document_id: string;
  document_title: string;
  document_status: string;
  provision_ref: string;
  chapter: string | null;
  section: string;
  title: string | null;
  content: string;
  metadata: string | null;
}

export async function getProvision(
  db: Database,
  input: GetProvisionInput
): Promise<ToolResponse<ProvisionResult | ProvisionResult[] | null>> {
  if (!input.document_id) {
    throw new Error('document_id is required');
  }

  // If provision_ref is directly provided, use it
  let provisionRef = input.provision_ref;
  if (!provisionRef) {
    if (input.chapter && input.section) {
      provisionRef = `${input.chapter}:${input.section}`;
    } else if (input.section) {
      provisionRef = input.section;
    }
  }

  // If no specific provision, return all provisions for the document (capped)
  if (!provisionRef) {
    const MAX_ALL_PROVISIONS = 100;
    const all = getAllProvisions(db, input.document_id, MAX_ALL_PROVISIONS + 1);
    const truncated = all.length > MAX_ALL_PROVISIONS;
    return {
      results: truncated ? all.slice(0, MAX_ALL_PROVISIONS) : all,
      ...(truncated && { _truncated: true, _hint: `Only first ${MAX_ALL_PROVISIONS} provisions returned. Use chapter+section to retrieve specific provisions.` }),
      _metadata: generateResponseMetadata(db)
    };
  }

  const sql = `
    SELECT
      p.document_id,
      l.title as document_title,
      l.status as document_status,
      p.provision_ref,
      p.chapter,
      p.section,
      p.title,
      p.content,
      p.metadata
    FROM provisions p
    JOIN laws l ON l.id = p.document_id
    WHERE p.document_id = ? AND p.provision_ref = ?
  `;
  const row = db.prepare(sql).get(input.document_id, provisionRef) as ProvisionRow | undefined;

  if (!row) {
    return {
      results: null,
      _metadata: generateResponseMetadata(db)
    };
  }

  const crossRefs = db.prepare(`
    SELECT target_document_id, target_provision_ref, ref_type
    FROM cross_references
    WHERE source_document_id = ? AND (source_provision_ref = ? OR source_provision_ref IS NULL)
  `).all(input.document_id, provisionRef) as CrossRefResult[];

  return {
    results: {
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      cross_references: crossRefs,
    },
    _metadata: generateResponseMetadata(db)
  };
}

function getAllProvisions(db: Database, documentId: string, limit?: number): ProvisionResult[] {
  const sql = `
    SELECT
      p.document_id,
      l.title as document_title,
      l.status as document_status,
      p.provision_ref,
      p.chapter,
      p.section,
      p.title,
      p.content,
      p.metadata
    FROM provisions p
    JOIN laws l ON l.id = p.document_id
    WHERE p.document_id = ?
    ORDER BY p.id
    ${limit ? 'LIMIT ?' : ''}
  `;
  const rows = db.prepare(sql).all(...[documentId, ...(limit ? [limit] : [])]) as ProvisionRow[];

  return rows.map(row => ({
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    cross_references: [],
  }));
}
