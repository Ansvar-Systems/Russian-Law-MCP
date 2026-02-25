import { describe, it, expect } from 'vitest';
import { parseCitation, formatCitation } from '../../src/citations.js';

describe('parseCitation', () => {
  it('parses full federal law citation', () => {
    const result = parseCitation('Федеральный закон от 27.07.2006 № 149-ФЗ');
    expect(result.valid).toBe(true);
    expect(result.type).toBe('federal_law');
    expect(result.number).toBe('149-ФЗ');
    expect(result.date).toBe('2006-07-27');
  });

  it('parses short form citation', () => {
    const result = parseCitation('№ 149-ФЗ');
    expect(result.valid).toBe(true);
    expect(result.type).toBe('federal_law');
    expect(result.number).toBe('149-ФЗ');
  });

  it('parses article reference', () => {
    const result = parseCitation('Статья 5');
    expect(result.valid).toBe(true);
    expect(result.type).toBe('article');
    expect(result.article).toBe('5');
  });

  it('parses article with part', () => {
    const result = parseCitation('Статья 5, часть 2');
    expect(result.valid).toBe(true);
    expect(result.type).toBe('article');
    expect(result.article).toBe('5');
    expect(result.part).toBe('2');
  });

  it('parses article with paragraph', () => {
    const result = parseCitation('Статья 10, пункт 3');
    expect(result.valid).toBe(true);
    expect(result.type).toBe('article');
    expect(result.article).toBe('10');
    expect(result.paragraph).toBe('3');
  });

  it('parses code name', () => {
    const result = parseCitation('Гражданский кодекс Российской Федерации');
    expect(result.valid).toBe(true);
    expect(result.type).toBe('code');
  });

  it('parses code name with РФ abbreviation', () => {
    const result = parseCitation('Уголовный кодекс РФ');
    expect(result.valid).toBe(true);
    expect(result.type).toBe('code');
  });

  it('parses presidential decree', () => {
    const result = parseCitation('Указ Президента от 09.05.2017 № 203');
    expect(result.valid).toBe(true);
    expect(result.type).toBe('presidential_decree');
    expect(result.number).toBe('203');
    expect(result.date).toBe('2017-05-09');
  });

  it('parses government resolution', () => {
    const result = parseCitation('Постановление Правительства от 15.04.2014 № 313');
    expect(result.valid).toBe(true);
    expect(result.type).toBe('government_resolution');
    expect(result.number).toBe('313');
  });

  it('parses federal constitutional law', () => {
    const result = parseCitation('Федеральный конституционный закон от 21.07.1994 № 1-ФКЗ');
    expect(result.valid).toBe(true);
    expect(result.type).toBe('federal_constitutional_law');
    expect(result.number).toBe('1-ФКЗ');
  });

  it('rejects empty string', () => {
    const result = parseCitation('');
    expect(result.valid).toBe(false);
  });

  it('returns unknown for unrecognized text', () => {
    const result = parseCitation('some random text');
    expect(result.type).toBe('unknown');
    expect(result.valid).toBe(false);
  });
});

describe('formatCitation', () => {
  it('formats full federal law citation', () => {
    const result = formatCitation({
      type: 'federal_law',
      number: '149-ФЗ',
      date: '2006-07-27',
    }, 'full');
    expect(result).toContain('149-ФЗ');
    expect(result).toContain('27.07.2006');
  });

  it('formats short citation', () => {
    const result = formatCitation({
      type: 'federal_law',
      number: '149-ФЗ',
    }, 'short');
    expect(result).toBe('№ 149-ФЗ');
  });

  it('formats pinpoint with article', () => {
    const result = formatCitation({
      type: 'article',
      article: '5',
      part: '2',
    }, 'pinpoint');
    expect(result).toContain('Статья 5');
    expect(result).toContain('часть 2');
  });
});
