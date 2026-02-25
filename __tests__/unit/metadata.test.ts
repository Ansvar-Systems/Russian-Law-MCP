import { describe, it, expect } from 'vitest';
import { generateResponseMetadata } from '../../src/utils/metadata.js';

describe('generateResponseMetadata', () => {
  it('includes disclaimer', () => {
    const meta = generateResponseMetadata();
    expect(meta.disclaimer).toContain('NOT LEGAL ADVICE');
  });

  it('includes source authority', () => {
    const meta = generateResponseMetadata();
    expect(meta.source_authority.primary_source).toContain('pravo.gov.ru');
  });

  it('includes coverage gaps', () => {
    const meta = generateResponseMetadata();
    expect(meta.coverage_gaps).toBeInstanceOf(Array);
    expect(meta.coverage_gaps.length).toBeGreaterThan(0);
  });

  it('includes AI disclosure', () => {
    const meta = generateResponseMetadata();
    expect(meta.ai_disclosure).toContain('AI-assisted');
  });

  it('has official authority level', () => {
    const meta = generateResponseMetadata();
    expect(meta.source_authority.authority_level).toBe('official');
  });

  it('includes verification requirement', () => {
    const meta = generateResponseMetadata();
    expect(meta.source_authority.verification_required).toBeTruthy();
    expect(meta.source_authority.verification_required).toContain('pravo.gov.ru');
  });

  it('returns null data freshness when no db provided', () => {
    const meta = generateResponseMetadata();
    expect(meta.data_freshness.statute_last_updated).toBeNull();
    expect(meta.data_freshness.case_law_last_sync).toBeNull();
  });

  it('includes staleness warning when no db provided', () => {
    const meta = generateResponseMetadata();
    expect(meta.data_freshness.staleness_warning).toBeTruthy();
  });

  it('lists regional legislation as a coverage gap', () => {
    const meta = generateResponseMetadata();
    expect(meta.coverage_gaps).toContain('Regional (subject-level) legislation');
  });

  it('lists court decisions as a coverage gap', () => {
    const meta = generateResponseMetadata();
    expect(meta.coverage_gaps).toContain('Court decisions');
  });
});
