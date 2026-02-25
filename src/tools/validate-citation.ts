/**
 * validate_citation — Validate a Russian legal citation against the database.
 *
 * Zero-hallucination enforcer: checks that the cited document and provision
 * actually exist in the database.
 */

import type { Database } from '@ansvar/mcp-sqlite';
import { parseCitation } from '../citations.js';
import { generateResponseMetadata, type ToolResponse } from '../utils/metadata.js';

export interface ValidateCitationInput {
  citation: string;
}

export interface ValidateCitationResult {
  citation: string;
  parsed_type: string;
  formatted_citation: string;
  valid: boolean;
  document_exists: boolean;
  provision_exists: boolean;
  document_title?: string;
  status?: string;
  warnings: string[];
}

export async function validateCitationTool(
  db: Database,
  input: ValidateCitationInput
): Promise<ToolResponse<ValidateCitationResult>> {
  if (!input.citation || input.citation.trim().length === 0) {
    return {
      results: {
        citation: input.citation,
        parsed_type: 'unknown',
        formatted_citation: '',
        valid: false,
        document_exists: false,
        provision_exists: false,
        warnings: ['Empty citation'],
      },
      _metadata: generateResponseMetadata(db)
    };
  }

  const parsed = parseCitation(input.citation);

  if (!parsed.valid) {
    return {
      results: {
        citation: input.citation,
        parsed_type: parsed.type,
        formatted_citation: input.citation,
        valid: false,
        document_exists: false,
        provision_exists: false,
        warnings: [parsed.error ?? 'Could not parse citation'],
      },
      _metadata: generateResponseMetadata(db)
    };
  }

  const warnings: string[] = [];
  let documentExists = false;
  let provisionExists = false;
  let documentTitle: string | undefined;
  let status: string | undefined;

  // Try to find the document in the database
  // Search by number if available, or by title for codes
  if (parsed.number) {
    // Search by law number/identifier (e.g., "152-ФЗ")
    const doc = db.prepare(`
      SELECT id, title, status
      FROM laws
      WHERE identifier = ? OR id LIKE ?
      LIMIT 1
    `).get(parsed.number, `%${parsed.number}%`) as { id: string; title: string; status: string } | undefined;

    if (doc) {
      documentExists = true;
      documentTitle = doc.title;
      status = doc.status;

      if (doc.status === 'repealed') {
        warnings.push('This statute has been repealed (утратил силу)');
      }

      // Check provision if article is specified
      if (parsed.article) {
        const prov = db.prepare(`
          SELECT 1 FROM provisions
          WHERE law_id = ? AND (
            provision_ref = ? OR
            article = ? OR
            provision_ref LIKE ?
          )
          LIMIT 1
        `).get(doc.id, parsed.article, parsed.article, `%${parsed.article}%`);
        provisionExists = !!prov;

        if (!provisionExists) {
          warnings.push(`Article ${parsed.article} not found in this document`);
        }
      } else {
        // No provision specified — document-level validation only
        provisionExists = true;
      }
    } else {
      warnings.push('Document not found in database');
    }
  } else if (parsed.title) {
    // Search by title for codes
    const doc = db.prepare(`
      SELECT id, title, status
      FROM laws
      WHERE title LIKE ?
      LIMIT 1
    `).get(`%${parsed.title}%`) as { id: string; title: string; status: string } | undefined;

    if (doc) {
      documentExists = true;
      documentTitle = doc.title;
      status = doc.status;

      if (doc.status === 'repealed') {
        warnings.push('This statute has been repealed (утратил силу)');
      }
    } else {
      warnings.push('Document not found in database');
    }
  } else {
    warnings.push('Citation does not contain a document identifier');
  }

  const isValid = parsed.valid && documentExists;

  return {
    results: {
      citation: input.citation,
      parsed_type: parsed.type,
      formatted_citation: parsed.raw,
      valid: isValid,
      document_exists: documentExists,
      provision_exists: provisionExists,
      document_title: documentTitle,
      status,
      warnings,
    },
    _metadata: generateResponseMetadata(db)
  };
}
