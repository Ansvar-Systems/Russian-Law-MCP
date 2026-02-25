/**
 * check_currency — Check if a statute or provision is current (in force).
 */

import type { Database } from '@ansvar/mcp-sqlite';
import { extractRepealDateFromDescription } from '../utils/as-of-date.js';
import { generateResponseMetadata, type ToolResponse } from '../utils/metadata.js';

export interface CheckCurrencyInput {
  document_id: string;
  provision_ref?: string;
}

export interface CurrencyResult {
  document_id: string;
  title: string;
  status: string;
  type: string;
  issued_date: string | null;
  in_force_date: string | null;
  last_updated: string | null;
  is_current: boolean;
  provision_exists?: boolean;
  warnings: string[];
}

interface DocumentRow {
  id: string;
  title: string;
  status: string;
  type: string;
  issued_date: string | null;
  in_force_date: string | null;
  description: string | null;
  last_updated: string | null;
}

export async function checkCurrency(
  db: Database,
  input: CheckCurrencyInput
): Promise<ToolResponse<CurrencyResult | null>> {
  if (!input.document_id) {
    throw new Error('document_id is required');
  }

  const doc = db.prepare(`
    SELECT id, title, status, law_type as type, publication_date as issued_date, effective_date as in_force_date, description, last_updated
    FROM laws
    WHERE id = ?
  `).get(input.document_id) as DocumentRow | undefined;

  if (!doc) {
    return {
      results: null,
      _metadata: generateResponseMetadata(db)
    };
  }

  const warnings: string[] = [];
  const isCurrent = doc.status === 'in_force';
  const repealDate = extractRepealDateFromDescription(doc.description ?? null);

  if (doc.status === 'repealed') {
    const repealInfo = repealDate ? ` as of ${repealDate}` : '';
    warnings.push(`This statute has been repealed (утратил силу)${repealInfo}`);
  } else if (doc.status === 'amended') {
    warnings.push('This statute has been amended since last ingestion');
  } else if (doc.status === 'not_yet_in_force') {
    warnings.push('This statute has not yet entered into force');
  }

  let provisionExists: boolean | undefined;
  if (input.provision_ref) {
    const prov = db.prepare(
      'SELECT 1 FROM provisions WHERE law_id = ? AND provision_ref = ?'
    ).get(input.document_id, input.provision_ref);
    provisionExists = !!prov;

    if (!provisionExists) {
      warnings.push(`Provision "${input.provision_ref}" not found in this document`);
    }
  }

  return {
    results: {
      document_id: doc.id,
      title: doc.title,
      status: doc.status,
      type: doc.type,
      issued_date: doc.issued_date,
      in_force_date: doc.in_force_date,
      last_updated: doc.last_updated,
      is_current: isCurrent,
      provision_exists: provisionExists,
      warnings,
    },
    _metadata: generateResponseMetadata(db)
  };
}
