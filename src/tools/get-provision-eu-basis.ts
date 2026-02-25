/**
 * get_provision_eu_basis — Get EU legal basis for a specific provision.
 */

import type { Database } from '@ansvar/mcp-sqlite';
import { generateResponseMetadata, type ToolResponse } from '../utils/metadata.js';

export interface GetProvisionEUBasisInput {
  document_id: string;
  provision_ref: string;
}

interface ProvisionEUReference {
  id: string;
  type: 'directive' | 'regulation';
  title?: string;
  short_name?: string;
  article?: string;
  reference_type: string;
  full_citation: string;
  context?: string;
}

export interface GetProvisionEUBasisResult {
  document_id: string;
  provision_ref: string;
  provision_content?: string;
  eu_references: ProvisionEUReference[];
}

/**
 * Get EU legal basis for a specific provision within a Russian statute.
 *
 * Returns EU directives/regulations that this specific provision implements or references,
 * including article-level references.
 */
export async function getProvisionEUBasis(
  db: Database,
  input: GetProvisionEUBasisInput
): Promise<ToolResponse<GetProvisionEUBasisResult>> {
  if (!input.document_id) {
    throw new Error('document_id is required');
  }

  if (!input.provision_ref || !input.provision_ref.trim()) {
    throw new Error('provision_ref is required');
  }

  // Check if provision exists
  const provision = db.prepare(`
    SELECT id, content
    FROM provisions
    WHERE document_id = ? AND provision_ref = ?
  `).get(input.document_id, input.provision_ref) as
    | { id: number; content: string }
    | undefined;

  if (!provision) {
    throw new Error(
      `Provision ${input.document_id} ${input.provision_ref} not found in database`
    );
  }

  // Get EU references for this provision
  const sql = `
    SELECT
      ed.id,
      ed.type,
      ed.title,
      ed.short_name,
      er.eu_article,
      er.reference_type,
      er.full_citation,
      er.reference_context
    FROM eu_documents ed
    JOIN eu_references er ON ed.id = er.eu_document_id
    WHERE er.provision_id = ?
    ORDER BY
      CASE er.reference_type
        WHEN 'implements' THEN 1
        WHEN 'supplements' THEN 2
        WHEN 'cites_article' THEN 3
        ELSE 4
      END,
      ed.year DESC
  `;

  interface QueryRow {
    id: string;
    type: 'directive' | 'regulation';
    title: string | null;
    short_name: string | null;
    eu_article: string | null;
    reference_type: string;
    full_citation: string | null;
    reference_context: string | null;
  }

  const rows = db.prepare(sql).all(provision.id) as QueryRow[];

  const euReferences: ProvisionEUReference[] = rows.map(row => {
    const ref: ProvisionEUReference = {
      id: row.id,
      type: row.type,
      reference_type: row.reference_type,
      full_citation: row.full_citation || row.id,
    };

    if (row.title) ref.title = row.title;
    if (row.short_name) ref.short_name = row.short_name;
    if (row.eu_article) ref.article = row.eu_article;
    if (row.reference_context) ref.context = row.reference_context;

    return ref;
  });

  const result: GetProvisionEUBasisResult = {
    document_id: input.document_id,
    provision_ref: input.provision_ref,
    provision_content: provision.content,
    eu_references: euReferences,
  };

  return {
    results: result,
    _metadata: generateResponseMetadata(db),
  };
}
