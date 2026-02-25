/**
 * HTML/text parser for Russian legislation from pravo.gov.ru.
 *
 * Extracts structured article data from:
 * - HTML pages from pravo.gov.ru/proxy/ips/
 * - Plain text from pravo.gov.ru savetext endpoint
 * - Raw text (for curated census entries)
 *
 * Handles Russian article numbering (Статья 1., Статья 2., etc.)
 * and structural elements (Глава, Раздел, Часть).
 */

import * as cheerio from 'cheerio';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ParsedProvision {
  article: string;
  title: string;
  content: string;
  provision_ref: string;
  order_index: number;
}

export interface ParsedLaw {
  title: string;
  provisions: ParsedProvision[];
}

export interface LawMetadata {
  title: string;
  identifier: string;
  lawType: string;
  effectiveDate: string;
  publicationDate: string;
  status: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Russian article/section patterns
// ─────────────────────────────────────────────────────────────────────────────

// Match "Статья N." or "Статья N.N." (main article marker)
// Allows multiple spaces between "Статья" and the number (pravo.gov.ru formatting)
const ARTICLE_PATTERN = /^\s*Статья\s+(\d+(?:\.\d+)?)\.\s*(.*)/;

// Match "Статья N" followed by a period or title text on the same line
const ARTICLE_PATTERN_ALT = /^\s*Статья\s+(\d+(?:\.\d+)?)\b[\.\s]*(.*)/;

// Match chapter/section/part headings (for context, not provisions)
const CHAPTER_PATTERN = /^\s*(Глава|Раздел|Часть|Подраздел)\s+[\dIVXLCDM]+/i;

// Match "Приложение" (Appendix) — skip these
const APPENDIX_PATTERN = /^\s*Приложение\b/i;

// ─────────────────────────────────────────────────────────────────────────────
// HTML Parser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse HTML from pravo.gov.ru to extract law articles.
 */
export function parsePravoHtml(html: string): ParsedLaw {
  const $ = cheerio.load(html);

  // Extract title from the page
  let title = '';

  // pravo.gov.ru uses various title selectors
  const titleSelectors = [
    'h1',
    '.docTitle',
    '.doc_title',
    'title',
    '.rasdel_name',
  ];

  for (const selector of titleSelectors) {
    const el = $(selector).first();
    const text = el.text().trim();
    if (text && text.length > 5 && text.length < 500) {
      title = text;
      break;
    }
  }

  // Extract all text content - pravo.gov.ru puts law text in various containers
  const contentSelectors = [
    '#text',
    '.docBody',
    '.doc_body',
    '.dcontent',
    '#docBody',
    'table.doc',
    '.mainbody',
    'body',
  ];

  let rawText = '';
  for (const selector of contentSelectors) {
    const el = $(selector);
    if (el.length > 0) {
      const text = el.text();
      if (text.trim().length > 200) {
        rawText = text;
        break;
      }
    }
  }

  if (!rawText) {
    rawText = $('body').text();
  }

  const provisions = parseRussianText(rawText);

  return { title, provisions };
}

// ─────────────────────────────────────────────────────────────────────────────
// Plain text parser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse raw/plain text of a Russian law into articles.
 * Works with text from pravo.gov.ru savetext endpoint or curated sources.
 */
export function parseRussianText(text: string): ParsedProvision[] {
  const provisions: ParsedProvision[] = [];
  const lines = text.split(/\r?\n/);

  let currentArticleNum = '';
  let currentArticleTitle = '';
  let currentContent: string[] = [];
  let orderIndex = 0;
  let inAppendix = false;

  function flushArticle(): void {
    if (currentArticleNum && currentContent.length > 0) {
      const content = currentContent
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (content.length > 0) {
        provisions.push({
          article: currentArticleNum,
          title: currentArticleTitle,
          content,
          provision_ref: currentArticleNum,
          order_index: orderIndex++,
        });
      }
    }
    currentArticleNum = '';
    currentArticleTitle = '';
    currentContent = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Skip empty lines (but preserve paragraph breaks in content)
    if (line.length === 0) {
      if (currentArticleNum && currentContent.length > 0) {
        currentContent.push('');
      }
      continue;
    }

    // Skip appendices
    if (APPENDIX_PATTERN.test(line)) {
      inAppendix = true;
      flushArticle();
      continue;
    }

    // Skip if we're in appendix section
    if (inAppendix) {
      // Check if we hit a new article (could be in a different part after appendix)
      const newArticle = line.match(ARTICLE_PATTERN) || line.match(ARTICLE_PATTERN_ALT);
      if (newArticle) {
        inAppendix = false;
      } else {
        continue;
      }
    }

    // Check for article start
    const articleMatch = line.match(ARTICLE_PATTERN) || line.match(ARTICLE_PATTERN_ALT);

    if (articleMatch) {
      // Flush previous article
      flushArticle();

      currentArticleNum = articleMatch[1];

      // The rest of the line after "Статья N." may be the title
      const restOfLine = articleMatch[2].trim();
      if (restOfLine) {
        // If the rest is short and doesn't look like body text, it's likely a title
        if (restOfLine.length < 200 && !restOfLine.match(/^\d+\.\s/)) {
          currentArticleTitle = restOfLine;
        } else {
          // It's body text
          currentContent.push(restOfLine);
        }
      }
      continue;
    }

    // Skip chapter/section headings (they're structural, not article content)
    if (CHAPTER_PATTERN.test(line)) {
      // Don't flush - the heading is just a structural marker
      continue;
    }

    // If we have a current article, add this line as content
    if (currentArticleNum) {
      // If we had a title line and this is the first content line
      if (currentArticleTitle && currentContent.length === 0 && line.length < 200) {
        // Could be a continuation of the title - check if it looks like article title text
        const looksLikeBody = /^\d+[\.\)]/.test(line) || line.startsWith('(') || line.length > 150;
        if (!looksLikeBody && !currentArticleTitle.endsWith('.') && !currentArticleTitle.endsWith(':')) {
          // Likely title continuation - but for simplicity, treat as content
          currentContent.push(line);
        } else {
          currentContent.push(line);
        }
      } else {
        currentContent.push(line);
      }
    }
  }

  // Flush last article
  flushArticle();

  // Deduplicate: if the same article number appears multiple times,
  // merge them (keep the one with more content, or concatenate)
  const seen = new Map<string, number>();
  const deduped: ParsedProvision[] = [];

  for (const prov of provisions) {
    const existing = seen.get(prov.article);
    if (existing !== undefined) {
      // Merge: append content of duplicate to the first occurrence
      const existingProv = deduped[existing];
      existingProv.content += '\n\n' + prov.content;
    } else {
      seen.set(prov.article, deduped.length);
      deduped.push({ ...prov });
    }
  }

  // Re-index
  for (let i = 0; i < deduped.length; i++) {
    deduped[i].order_index = i;
  }

  return deduped;
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadata extractor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract metadata from a pravo.gov.ru HTML page.
 */
export function extractMetadata(html: string): Partial<LawMetadata> {
  const $ = cheerio.load(html);
  const meta: Partial<LawMetadata> = {};

  // Try to extract from meta tags or structured elements
  const title = $('h1').first().text().trim() || $('title').text().trim();
  if (title) meta.title = title;

  // Look for document number pattern in the text
  const fullText = $('body').text();

  // Federal law number pattern: N ФЗ or N-ФЗ
  const fzMatch = fullText.match(/(\d+)-?ФЗ/);
  if (fzMatch) {
    meta.identifier = `${fzMatch[1]}-ФЗ`;
    meta.lawType = 'federal_law';
  }

  // Federal constitutional law: N-ФКЗ
  const fkzMatch = fullText.match(/(\d+)-?ФКЗ/);
  if (fkzMatch) {
    meta.identifier = `${fkzMatch[1]}-ФКЗ`;
    meta.lawType = 'federal_constitutional_law';
  }

  // Date pattern: DD.MM.YYYY
  const dateMatch = fullText.match(/от\s+(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    meta.effectiveDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Status: look for "утратил силу" (repealed) or "действующий" (in force)
  if (/утратил[а]?\s+силу/i.test(fullText)) {
    meta.status = 'repealed';
  } else {
    meta.status = 'in_force';
  }

  return meta;
}

/**
 * Clean and normalize Russian legal text.
 */
export function normalizeRussianText(text: string): string {
  return text
    .replace(/\u00A0/g, ' ')    // Non-breaking space -> regular space
    .replace(/\u2003/g, ' ')    // Em space
    .replace(/\u2002/g, ' ')    // En space
    .replace(/\s+/g, ' ')       // Collapse whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Max 2 newlines
    .trim();
}
