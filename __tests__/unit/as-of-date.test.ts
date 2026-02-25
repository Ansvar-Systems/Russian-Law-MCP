import { describe, it, expect } from 'vitest';
import { normalizeAsOfDate, extractRepealDateFromDescription } from '../../src/utils/as-of-date.js';

describe('normalizeAsOfDate', () => {
  it('accepts valid ISO date', () => {
    expect(normalizeAsOfDate('2024-01-15')).toBe('2024-01-15');
  });

  it('returns undefined for undefined', () => {
    expect(normalizeAsOfDate(undefined)).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(normalizeAsOfDate('')).toBeUndefined();
  });

  it('returns undefined for whitespace-only string', () => {
    expect(normalizeAsOfDate('   ')).toBeUndefined();
  });

  it('throws for non-ISO format (DD.MM.YYYY)', () => {
    expect(() => normalizeAsOfDate('15.01.2024')).toThrow();
  });

  it('throws for invalid date (month 13)', () => {
    expect(() => normalizeAsOfDate('2024-13-45')).toThrow();
  });

  it('throws for February 30', () => {
    expect(() => normalizeAsOfDate('2024-02-30')).toThrow();
  });

  it('accepts leap day in leap year', () => {
    expect(normalizeAsOfDate('2024-02-29')).toBe('2024-02-29');
  });

  it('throws for leap day in non-leap year', () => {
    expect(() => normalizeAsOfDate('2023-02-29')).toThrow();
  });

  it('trims whitespace around valid date', () => {
    expect(normalizeAsOfDate('  2024-06-15  ')).toBe('2024-06-15');
  });

  it('throws for partial date', () => {
    expect(() => normalizeAsOfDate('2024-01')).toThrow();
  });

  it('throws for random text', () => {
    expect(() => normalizeAsOfDate('not-a-date')).toThrow();
  });
});

describe('extractRepealDateFromDescription', () => {
  it('extracts ISO format repeal date', () => {
    expect(extractRepealDateFromDescription('Утратил силу 2024-01-15')).toBe('2024-01-15');
  });

  it('extracts Russian format repeal date', () => {
    expect(extractRepealDateFromDescription('Утратил силу с 15.01.2024')).toBe('2024-01-15');
  });

  it('returns undefined for null', () => {
    expect(extractRepealDateFromDescription(null)).toBeUndefined();
  });

  it('returns undefined when no repeal date present', () => {
    expect(extractRepealDateFromDescription('Действующий закон')).toBeUndefined();
  });

  it('handles lowercase "утратил"', () => {
    expect(extractRepealDateFromDescription('утратил силу 2023-06-01')).toBe('2023-06-01');
  });

  it('handles "Утратил силу с" prefix with ISO date', () => {
    expect(extractRepealDateFromDescription('Утратил силу с 2023-12-31')).toBe('2023-12-31');
  });

  it('returns undefined for empty string', () => {
    expect(extractRepealDateFromDescription('')).toBeUndefined();
  });

  it('extracts Russian format without "с"', () => {
    expect(extractRepealDateFromDescription('Утратил силу 01.03.2022')).toBe('2022-03-01');
  });
});
