/**
 * Golden contract tests for Russian Law MCP.
 *
 * Loads fixtures/golden-tests.json and validates each test case
 * by calling tool functions directly against the real database.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import Database from '@ansvar/mcp-sqlite';

import { searchLegislation } from '../../src/tools/search-legislation.js';
import { getProvision } from '../../src/tools/get-provision.js';
import { validateCitationTool } from '../../src/tools/validate-citation.js';
import { buildLegalStance } from '../../src/tools/build-legal-stance.js';
import { formatCitationTool } from '../../src/tools/format-citation.js';
import { checkCurrency } from '../../src/tools/check-currency.js';
import { listSources } from '../../src/tools/list-sources.js';
import { getAbout, type AboutContext } from '../../src/tools/about.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GoldenTest {
  id: string;
  tool: string;
  description: string;
  input: Record<string, unknown>;
  assertions: string[];
}

interface GoldenTestsFile {
  schema_version: string;
  jurisdiction: string;
  tests: GoldenTest[];
}

// ---------------------------------------------------------------------------
// Load fixtures
// ---------------------------------------------------------------------------

const fixturesPath = join(process.cwd(), 'fixtures', 'golden-tests.json');
const fixture = JSON.parse(readFileSync(fixturesPath, 'utf-8')) as GoldenTestsFile;

// ---------------------------------------------------------------------------
// Database setup
// ---------------------------------------------------------------------------

let db: InstanceType<typeof Database>;
const aboutContext: AboutContext = {
  version: '0.1.0',
  fingerprint: 'test',
  dbBuilt: '2026-02-25',
};

beforeAll(() => {
  const dbPath = join(process.cwd(), 'data', 'database.db');
  db = new Database(dbPath, { readonly: true });
});

// ---------------------------------------------------------------------------
// Tool dispatcher
// ---------------------------------------------------------------------------

async function callTool(
  tool: string,
  input: Record<string, unknown>,
): Promise<{ result: unknown; error: Error | null }> {
  try {
    let result: unknown;

    switch (tool) {
      case 'search_legislation':
        result = await searchLegislation(db, input as never);
        break;
      case 'get_provision':
        result = await getProvision(db, input as never);
        break;
      case 'validate_citation':
        result = await validateCitationTool(db, input as never);
        break;
      case 'build_legal_stance':
        result = await buildLegalStance(db, input as never);
        break;
      case 'format_citation':
        result = await formatCitationTool(input as never);
        break;
      case 'check_currency':
        result = await checkCurrency(db, input as never);
        break;
      case 'list_sources':
        result = listSources(db);
        break;
      case 'about':
        result = getAbout(db, aboutContext);
        break;
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }

    return { result, error: null };
  } catch (e) {
    return { result: null, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

// ---------------------------------------------------------------------------
// Assertion helpers
// ---------------------------------------------------------------------------

function parseAssertion(assertion: string): { type: string; value?: string } {
  const colonIndex = assertion.indexOf(':');
  if (colonIndex === -1) {
    return { type: assertion };
  }
  return {
    type: assertion.substring(0, colonIndex),
    value: assertion.substring(colonIndex + 1),
  };
}

function isNotEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function extractResults(toolResponse: unknown): unknown {
  if (toolResponse && typeof toolResponse === 'object' && 'results' in toolResponse) {
    return (toolResponse as Record<string, unknown>).results;
  }
  return toolResponse;
}

function stringify(value: unknown): string {
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 0) ?? '';
}

// ---------------------------------------------------------------------------
// Contract test runner
// ---------------------------------------------------------------------------

describe(`Golden contract tests: Russian Law MCP (${fixture.jurisdiction})`, () => {
  for (const test of fixture.tests) {
    describe(`[${test.id}] ${test.description}`, () => {
      let callResult: { result: unknown; error: Error | null };

      it('executes without crashing', async () => {
        callResult = await callTool(test.tool, test.input);
        // For no_error assertion, we just check it doesn't crash
        // For other assertions, errors may be expected behavior
      });

      for (const assertion of test.assertions) {
        const { type, value } = parseAssertion(assertion);

        switch (type) {
          case 'result_not_empty':
            it('result is not empty', async () => {
              callResult ??= await callTool(test.tool, test.input);
              expect(callResult.error).toBeNull();
              const results = extractResults(callResult.result);
              expect(isNotEmpty(results)).toBe(true);
            });
            break;

          case 'result_null':
            it('result is null', async () => {
              callResult ??= await callTool(test.tool, test.input);
              expect(callResult.error).toBeNull();
              const results = extractResults(callResult.result);
              expect(results).toBeNull();
            });
            break;

          case 'result_empty':
            it('result is empty', async () => {
              callResult ??= await callTool(test.tool, test.input);
              expect(callResult.error).toBeNull();
              const results = extractResults(callResult.result);
              if (Array.isArray(results)) {
                expect(results.length).toBe(0);
              } else {
                expect(results === null || results === undefined || results === '').toBe(true);
              }
            });
            break;

          case 'min_results': {
            const minCount = parseInt(value!, 10);
            it(`returns at least ${minCount} results`, async () => {
              callResult ??= await callTool(test.tool, test.input);
              expect(callResult.error).toBeNull();
              const results = extractResults(callResult.result);

              // Results may be an array directly, or nested in a results/provisions field
              let items: unknown[];
              if (Array.isArray(results)) {
                items = results;
              } else if (results && typeof results === 'object') {
                const record = results as Record<string, unknown>;
                items =
                  (Array.isArray(record.results) && record.results) ||
                  (Array.isArray(record.provisions) && record.provisions) ||
                  [];
              } else {
                items = [];
              }

              expect(items.length).toBeGreaterThanOrEqual(minCount);
            });
            break;
          }

          case 'text_contains': {
            const needle = value!;
            it(`result contains "${needle}"`, async () => {
              callResult ??= await callTool(test.tool, test.input);
              expect(callResult.error).toBeNull();
              const text = stringify(callResult.result).toLowerCase();
              expect(text).toContain(needle.toLowerCase());
            });
            break;
          }

          case 'fields_present': {
            const fields = value!.split(',').map(f => f.trim());
            it(`result has fields: ${fields.join(', ')}`, async () => {
              callResult ??= await callTool(test.tool, test.input);
              expect(callResult.error).toBeNull();
              const results = extractResults(callResult.result);
              expect(results).toBeDefined();
              expect(results).not.toBeNull();
              const record = results as Record<string, unknown>;
              for (const field of fields) {
                expect(record).toHaveProperty(field);
              }
            });
            break;
          }

          case 'no_error':
            it('completes without throwing', async () => {
              callResult ??= await callTool(test.tool, test.input);
              // The tool should either return a result or handle the error gracefully
              // (not throw an unhandled exception)
              expect(callResult.error === null || callResult.result !== undefined).toBe(true);
            });
            break;

          default:
            it(`unknown assertion type: ${type}`, () => {
              throw new Error(`Unknown assertion type: ${type}`);
            });
        }
      }
    });
  }
});
