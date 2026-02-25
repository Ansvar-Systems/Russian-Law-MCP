/**
 * Tool registry for Russian Legal Citation MCP Server.
 * Shared between stdio (index.ts) and HTTP (api/mcp.ts) entry points.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import Database from '@ansvar/mcp-sqlite';

import { searchLegislation, SearchLegislationInput } from './search-legislation.js';
import { getProvision, GetProvisionInput } from './get-provision.js';
import { validateCitationTool, ValidateCitationInput } from './validate-citation.js';
import { buildLegalStance, BuildLegalStanceInput } from './build-legal-stance.js';
import { formatCitationTool, FormatCitationInput } from './format-citation.js';
import { checkCurrency, CheckCurrencyInput } from './check-currency.js';
import { getEUBasis, GetEUBasisInput } from './get-eu-basis.js';
import { getRussianImplementations, GetRussianImplementationsInput } from './get-russian-implementations.js';
import { searchEUImplementations, SearchEUImplementationsInput } from './search-eu-implementations.js';
import { getProvisionEUBasis, GetProvisionEUBasisInput } from './get-provision-eu-basis.js';
import { validateEUCompliance, ValidateEUComplianceInput } from './validate-eu-compliance.js';
import { getAbout, type AboutContext } from './about.js';
import { listSources } from './list-sources.js';
export type { AboutContext } from './about.js';

const LIST_SOURCES_TOOL: Tool = {
  name: 'list_sources',
  description: `List all data sources used by this MCP server with provenance metadata.

Returns jurisdiction, source authorities, URLs, retrieval methods, update frequencies, licenses, coverage scope, and known limitations. Use this to understand where the data comes from and how current it is. For server statistics, use about instead.`,
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

const ABOUT_TOOL: Tool = {
  name: 'about',
  description:
    'Server metadata, dataset statistics, freshness, and provenance. ' +
    'Call this to verify data coverage, currency, and content basis before relying on results.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export const TOOLS: Tool[] = [
  {
    name: 'search_legislation',
    description: `Search Russian statutes and regulations by keyword. FTS5 with BM25 ranking. Returns provision-level results with snippets highlighting matches.`,
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', minLength: 1, description: 'Search query in Russian or English. Supports FTS5 syntax: quoted phrases ("exact match"), AND/OR/NOT operators, prefix*.' },
        document_id: { type: 'string', description: 'Filter by document identifier' },
        status: { type: 'string', enum: ['in_force', 'amended', 'repealed'], description: 'Filter by document status' },
        limit: { type: 'number', default: 10, minimum: 1, maximum: 50, description: 'Maximum results to return' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_provision',
    description: `Retrieve a specific provision from a Russian statute. Do NOT use for keyword search — use search_legislation instead.`,
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'Document identifier' },
        chapter: { type: 'string', description: 'Chapter number (e.g., "3").' },
        section: { type: 'string', description: 'Section/article number (e.g., "5")' },
        provision_ref: { type: 'string', description: 'Direct provision reference. Alternative to chapter+section.' },
      },
      required: ['document_id'],
    },
  },
  {
    name: 'validate_citation',
    description: `Validate a Russian legal citation against the database. Zero-hallucination enforcer. Supports: Федеральный закон, codes, presidential decrees, government resolutions. Do NOT use for formatting — use format_citation instead.`,
    inputSchema: {
      type: 'object',
      properties: {
        citation: { type: 'string', minLength: 1, description: 'Citation string to validate (e.g., "Федеральный закон от 27.07.2006 № 152-ФЗ")' },
      },
      required: ['citation'],
    },
  },
  {
    name: 'build_legal_stance',
    description: `Build comprehensive citations for a legal question. Searches statutes to aggregate relevant provisions. Do NOT use for a single known statute — use get_provision instead.`,
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', minLength: 1, description: 'Legal question or topic to research' },
        document_id: { type: 'string', description: 'Limit search to one document' },
        limit: { type: 'number', default: 5, minimum: 1, maximum: 20, description: 'Max results per category' },
      },
      required: ['query'],
    },
  },
  {
    name: 'format_citation',
    description: `Format a Russian legal citation (full, short, or pinpoint). Do NOT use to verify existence — use validate_citation instead.`,
    inputSchema: {
      type: 'object',
      properties: {
        citation: { type: 'string', minLength: 1, description: 'Citation string to format (e.g., "Федеральный закон от 27.07.2006 № 152-ФЗ")' },
        format: { type: 'string', enum: ['full', 'short', 'pinpoint'], default: 'full', description: 'Output format' },
      },
      required: ['citation'],
    },
  },
  {
    name: 'check_currency',
    description: `Check if a Russian statute or provision is in force. Use before citing to verify statute hasn't been repealed (утратил силу).`,
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'Document identifier' },
        provision_ref: { type: 'string', description: 'Provision reference to check' },
      },
      required: ['document_id'],
    },
  },
  {
    name: 'get_eu_basis',
    description: `Get EU legal basis for a Russian statute. For provision-level, use get_provision_eu_basis. For reverse lookup (EU → Russian), use get_russian_implementations. Note: Russia is not an EU member state; cross-references are limited to international harmonization.`,
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'Document identifier' },
        include_articles: { type: 'boolean', default: false, description: 'Include specific EU article references' },
        reference_types: { type: 'array', items: { type: 'string', enum: ['implements', 'supplements', 'applies', 'references', 'cites_article'] }, description: 'Filter by reference type' },
      },
      required: ['document_id'],
    },
  },
  {
    name: 'get_russian_implementations',
    description: `Find Russian statutes implementing a specific EU directive or regulation. For reverse (Russian → EU), use get_eu_basis.`,
    inputSchema: {
      type: 'object',
      properties: {
        eu_document_id: { type: 'string', description: 'EU document ID (e.g., "regulation:2016/679", "directive:95/46")' },
        primary_only: { type: 'boolean', default: false, description: 'Return only primary implementing statutes' },
        in_force_only: { type: 'boolean', default: false, description: 'Return only in-force statutes' },
      },
      required: ['eu_document_id'],
    },
  },
  {
    name: 'search_eu_implementations',
    description: `Search EU directives/regulations with Russian implementation info. Use get_russian_implementations for specific EU document details.`,
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', minLength: 1, description: 'Keyword search (title, short name, CELEX)' },
        type: { type: 'string', enum: ['directive', 'regulation'], description: 'Filter by document type' },
        year_from: { type: 'number', minimum: 1950, description: 'Filter by year (from)' },
        year_to: { type: 'number', maximum: 2030, description: 'Filter by year (to)' },
        has_russian_implementation: { type: 'boolean', description: 'Only return EU documents with Russian implementations' },
        limit: { type: 'number', default: 20, minimum: 1, maximum: 100, description: 'Maximum results to return' },
      },
    },
  },
  {
    name: 'get_provision_eu_basis',
    description: `Get EU legal basis for a specific provision. For statute-level EU references, use get_eu_basis instead.`,
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'Document identifier' },
        provision_ref: { type: 'string', minLength: 1, description: 'Provision reference' },
      },
      required: ['document_id', 'provision_ref'],
    },
  },
  {
    name: 'validate_eu_compliance',
    description: `Validate EU compliance status for a Russian statute or provision. Phase 1: checks reference validity, not substantive compliance. Note: Russia is not an EU member state.`,
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'Document identifier' },
        provision_ref: { type: 'string', description: 'Provision reference' },
        eu_document_id: { type: 'string', description: 'Check compliance with specific EU document (e.g., "regulation:2016/679")' },
      },
      required: ['document_id'],
    },
  },
];

export function buildTools(context?: AboutContext): Tool[] {
  return context ? [...TOOLS, LIST_SOURCES_TOOL, ABOUT_TOOL] : [...TOOLS, LIST_SOURCES_TOOL];
}

export function registerTools(
  server: Server,
  db: InstanceType<typeof Database>,
  context?: AboutContext,
): void {
  const allTools = buildTools(context);

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: allTools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result: unknown;

      switch (name) {
        case 'search_legislation':
          result = await searchLegislation(db, args as unknown as SearchLegislationInput);
          break;
        case 'get_provision':
          result = await getProvision(db, args as unknown as GetProvisionInput);
          break;
        case 'validate_citation':
          result = await validateCitationTool(db, args as unknown as ValidateCitationInput);
          break;
        case 'build_legal_stance':
          result = await buildLegalStance(db, args as unknown as BuildLegalStanceInput);
          break;
        case 'format_citation':
          result = await formatCitationTool(args as unknown as FormatCitationInput);
          break;
        case 'check_currency':
          result = await checkCurrency(db, args as unknown as CheckCurrencyInput);
          break;
        case 'get_eu_basis':
          result = await getEUBasis(db, args as unknown as GetEUBasisInput);
          break;
        case 'get_russian_implementations':
          result = await getRussianImplementations(db, args as unknown as GetRussianImplementationsInput);
          break;
        case 'search_eu_implementations':
          result = await searchEUImplementations(db, args as unknown as SearchEUImplementationsInput);
          break;
        case 'get_provision_eu_basis':
          result = await getProvisionEUBasis(db, args as unknown as GetProvisionEUBasisInput);
          break;
        case 'validate_eu_compliance':
          result = await validateEUCompliance(db, args as unknown as ValidateEUComplianceInput);
          break;
        case 'list_sources':
          result = listSources(db);
          break;
        case 'about':
          if (context) {
            result = getAbout(db, context);
          } else {
            return {
              content: [{ type: 'text', text: 'About tool not configured.' }],
              isError: true,
            };
          }
          break;
        default:
          return {
            content: [{ type: 'text', text: `Error: Unknown tool "${name}".` }],
            isError: true,
          };
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text', text: `Error executing ${name}: ${message}` }],
        isError: true,
      };
    }
  });
}
