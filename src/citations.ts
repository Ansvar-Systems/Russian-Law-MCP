/**
 * Russian legal citation parser and formatter.
 *
 * Handles standard Russian legal citation formats including:
 * - Federal laws (Федеральный закон)
 * - Federal constitutional laws (Федеральный конституционный закон)
 * - Codes (кодекс Российской Федерации / РФ)
 * - Presidential decrees (Указ Президента)
 * - Government resolutions (Постановление Правительства)
 * - Article references (Статья N, часть M, пункт P)
 */

export interface ParsedCitation {
  raw: string;
  type: 'federal_law' | 'federal_constitutional_law' | 'code' | 'presidential_decree' | 'government_resolution' | 'article' | 'unknown';
  number?: string;
  date?: string; // ISO YYYY-MM-DD
  article?: string;
  part?: string;
  paragraph?: string;
  title?: string;
  valid: boolean;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Date conversion
// ─────────────────────────────────────────────────────────────────────────────

function convertRussianDate(dd: string, mm: string, yyyy: string): string {
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Citation patterns
// ─────────────────────────────────────────────────────────────────────────────

// Федеральный конституционный закон от DD.MM.YYYY № N-ФКЗ
const FEDERAL_CONSTITUTIONAL_LAW_PATTERN = /[Фф]едеральный\s+конституционный\s+закон\s+от\s+(\d{2})\.(\d{2})\.(\d{4})\s+№\s*(\S+)/i;

// Федеральный закон от DD.MM.YYYY № NNN-ФЗ
const FEDERAL_LAW_PATTERN = /[Фф]едеральный\s+закон\s+от\s+(\d{2})\.(\d{2})\.(\d{4})\s+№\s*(\S+)/i;

// Short form: № NNN-ФЗ
const SHORT_FZ_PATTERN = /^№\s*(\S*-ФЗ)\s*$/i;

// {Name} кодекс Российской Федерации or {Name} кодекс РФ
const CODE_PATTERN = /(.+?)\s+кодекс\s+(?:Российской\s+Федерации|РФ)/i;

// Указ Президента от DD.MM.YYYY № NNN
const PRESIDENTIAL_DECREE_PATTERN = /[Уу]каз\s+[Пп]резидента\s+от\s+(\d{2})\.(\d{2})\.(\d{4})\s+№\s*(\S+)/i;

// Постановление Правительства от DD.MM.YYYY № NNN
const GOVERNMENT_RESOLUTION_PATTERN = /[Пп]остановление\s+[Пп]равительства\s+от\s+(\d{2})\.(\d{2})\.(\d{4})\s+№\s*(\S+)/i;

// Статья N, часть M
const ARTICLE_WITH_PART_PATTERN = /[Сс]татья\s+(\d+(?:\.\d+)?)\s*,\s*часть\s+(\d+)/i;

// Статья N, пункт M
const ARTICLE_WITH_PARAGRAPH_PATTERN = /[Сс]татья\s+(\d+(?:\.\d+)?)\s*,\s*пункт\s+(\d+)/i;

// Статья N (plain)
const ARTICLE_PATTERN = /[Сс]татья\s+(\d+(?:\.\d+)?)/i;

// ─────────────────────────────────────────────────────────────────────────────
// Parser
// ─────────────────────────────────────────────────────────────────────────────

export function parseCitation(citation: string): ParsedCitation {
  const raw = citation.trim();

  if (!raw) {
    return { raw, type: 'unknown', valid: false, error: 'Empty citation' };
  }

  // Federal constitutional law (must be tested before federal law)
  let match = raw.match(FEDERAL_CONSTITUTIONAL_LAW_PATTERN);
  if (match) {
    return {
      raw,
      type: 'federal_constitutional_law',
      date: convertRussianDate(match[1], match[2], match[3]),
      number: match[4],
      valid: true,
    };
  }

  // Federal law (full form)
  match = raw.match(FEDERAL_LAW_PATTERN);
  if (match) {
    return {
      raw,
      type: 'federal_law',
      date: convertRussianDate(match[1], match[2], match[3]),
      number: match[4],
      valid: true,
    };
  }

  // Short form: № NNN-ФЗ
  match = raw.match(SHORT_FZ_PATTERN);
  if (match) {
    return {
      raw,
      type: 'federal_law',
      number: match[1],
      valid: true,
    };
  }

  // Code
  match = raw.match(CODE_PATTERN);
  if (match) {
    return {
      raw,
      type: 'code',
      title: match[1].trim() + ' кодекс',
      valid: true,
    };
  }

  // Presidential decree
  match = raw.match(PRESIDENTIAL_DECREE_PATTERN);
  if (match) {
    return {
      raw,
      type: 'presidential_decree',
      date: convertRussianDate(match[1], match[2], match[3]),
      number: match[4],
      valid: true,
    };
  }

  // Government resolution
  match = raw.match(GOVERNMENT_RESOLUTION_PATTERN);
  if (match) {
    return {
      raw,
      type: 'government_resolution',
      date: convertRussianDate(match[1], match[2], match[3]),
      number: match[4],
      valid: true,
    };
  }

  // Article with part
  match = raw.match(ARTICLE_WITH_PART_PATTERN);
  if (match) {
    return {
      raw,
      type: 'article',
      article: match[1],
      part: match[2],
      valid: true,
    };
  }

  // Article with paragraph
  match = raw.match(ARTICLE_WITH_PARAGRAPH_PATTERN);
  if (match) {
    return {
      raw,
      type: 'article',
      article: match[1],
      paragraph: match[2],
      valid: true,
    };
  }

  // Plain article reference
  match = raw.match(ARTICLE_PATTERN);
  if (match) {
    return {
      raw,
      type: 'article',
      article: match[1],
      valid: true,
    };
  }

  return {
    raw,
    type: 'unknown',
    valid: false,
    error: 'Unrecognized citation format',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatter
// ─────────────────────────────────────────────────────────────────────────────

function formatIsoDateToRussian(isoDate: string): string {
  const [yyyy, mm, dd] = isoDate.split('-');
  return `${dd}.${mm}.${yyyy}`;
}

export function formatCitation(parsed: Partial<ParsedCitation>, format: 'full' | 'short' | 'pinpoint'): string {
  const type = parsed.type ?? 'unknown';

  switch (format) {
    case 'full':
      return formatFull(type, parsed);
    case 'short':
      return formatShort(type, parsed);
    case 'pinpoint':
      return formatPinpoint(type, parsed);
    default:
      return parsed.number ? `№ ${parsed.number}` : '(unknown citation)';
  }
}

function formatFull(type: string, parsed: Partial<ParsedCitation>): string {
  switch (type) {
    case 'federal_law': {
      const datePart = parsed.date ? ` от ${formatIsoDateToRussian(parsed.date)}` : '';
      const numberPart = parsed.number ? ` № ${parsed.number}` : '';
      return `Федеральный закон${datePart}${numberPart}`;
    }
    case 'federal_constitutional_law': {
      const datePart = parsed.date ? ` от ${formatIsoDateToRussian(parsed.date)}` : '';
      const numberPart = parsed.number ? ` № ${parsed.number}` : '';
      return `Федеральный конституционный закон${datePart}${numberPart}`;
    }
    case 'code':
      return parsed.title ?? '(unknown code)';
    case 'presidential_decree': {
      const datePart = parsed.date ? ` от ${formatIsoDateToRussian(parsed.date)}` : '';
      const numberPart = parsed.number ? ` № ${parsed.number}` : '';
      return `Указ Президента${datePart}${numberPart}`;
    }
    case 'government_resolution': {
      const datePart = parsed.date ? ` от ${formatIsoDateToRussian(parsed.date)}` : '';
      const numberPart = parsed.number ? ` № ${parsed.number}` : '';
      return `Постановление Правительства${datePart}${numberPart}`;
    }
    case 'article':
      return formatArticle(parsed);
    default:
      return parsed.number ? `№ ${parsed.number}` : '(unknown citation)';
  }
}

function formatShort(type: string, parsed: Partial<ParsedCitation>): string {
  switch (type) {
    case 'federal_law':
      return parsed.number ? `№ ${parsed.number}` : '(unknown)';
    case 'federal_constitutional_law':
      return parsed.number ? `№ ${parsed.number}` : '(unknown)';
    case 'code':
      return parsed.title ?? '(unknown code)';
    case 'presidential_decree':
      return parsed.number ? `Указ № ${parsed.number}` : '(unknown)';
    case 'government_resolution':
      return parsed.number ? `Постановление № ${parsed.number}` : '(unknown)';
    case 'article':
      return formatArticle(parsed);
    default:
      return parsed.number ? `№ ${parsed.number}` : '(unknown)';
  }
}

function formatPinpoint(type: string, parsed: Partial<ParsedCitation>): string {
  if (type === 'article' || parsed.article) {
    return formatArticle(parsed);
  }
  return parsed.number ? `№ ${parsed.number}` : '(unknown)';
}

function formatArticle(parsed: Partial<ParsedCitation>): string {
  let result = `Статья ${parsed.article ?? '?'}`;
  if (parsed.part) {
    result += `, часть ${parsed.part}`;
  }
  if (parsed.paragraph) {
    result += `, пункт ${parsed.paragraph}`;
  }
  return result;
}
