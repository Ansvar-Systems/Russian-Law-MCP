import { describe, it, expect } from 'vitest';
import { buildFtsQueryVariants } from '../../src/utils/fts-query.js';

describe('buildFtsQueryVariants', () => {
  it('builds prefix query for single Cyrillic token', () => {
    const result = buildFtsQueryVariants('информация');
    expect(result.primary).toBe('информация*');
    expect(result.fallback).toBeUndefined();
  });

  it('builds AND query for multiple Cyrillic tokens', () => {
    const result = buildFtsQueryVariants('защита данных');
    expect(result.primary).toBe('защита* данных*');
    expect(result.fallback).toBe('защита* OR данных*');
  });

  it('preserves explicit FTS syntax', () => {
    const result = buildFtsQueryVariants('"персональные данные"');
    expect(result.primary).toContain('персональные данные');
  });

  it('handles empty string', () => {
    const result = buildFtsQueryVariants('');
    expect(result.primary).toBe('');
  });

  it('handles mixed Latin and Cyrillic', () => {
    const result = buildFtsQueryVariants('GDPR персональные');
    expect(result.primary).toContain('GDPR*');
    expect(result.primary).toContain('персональные*');
  });

  it('strips single-character tokens', () => {
    const result = buildFtsQueryVariants('о защите');
    // 'о' is 1 char, should be stripped
    expect(result.primary).toBe('защите*');
  });

  it('returns fallback undefined for single token after stripping', () => {
    const result = buildFtsQueryVariants('о защите');
    expect(result.fallback).toBeUndefined();
  });

  it('handles whitespace-only input', () => {
    const result = buildFtsQueryVariants('   ');
    expect(result.primary).toBe('');
  });

  it('handles AND boolean operator (explicit FTS)', () => {
    const result = buildFtsQueryVariants('защита AND данных');
    // AND is explicit FTS syntax, so preserved
    expect(result.primary).toContain('защита');
    expect(result.primary).toContain('AND');
    expect(result.primary).toContain('данных');
  });

  it('handles OR boolean operator (explicit FTS)', () => {
    const result = buildFtsQueryVariants('защита OR данных');
    expect(result.primary).toContain('OR');
  });

  it('handles wildcard (explicit FTS)', () => {
    const result = buildFtsQueryVariants('информаци*');
    expect(result.primary).toContain('информаци');
  });

  it('builds correct fallback for three tokens', () => {
    const result = buildFtsQueryVariants('защита персональных данных');
    expect(result.primary).toBe('защита* персональных* данных*');
    expect(result.fallback).toBe('защита* OR персональных* OR данных*');
  });
});
