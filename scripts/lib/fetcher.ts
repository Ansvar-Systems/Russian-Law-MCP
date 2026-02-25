/**
 * Rate-limited HTTP client for pravo.gov.ru and publication.pravo.gov.ru.
 *
 * - 1000ms minimum delay between requests (respect government servers)
 * - User-Agent header identifying the MCP
 * - Retry with exponential backoff
 * - Connection timeout handling
 * - Windows-1251 encoding support (pravo.gov.ru uses this encoding)
 */

const USER_AGENT = 'RussianLawMCP/1.0 (https://github.com/Ansvar-Systems/Russian-Law-MCP; hello@ansvar.eu)';
const MIN_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 60_000; // 60s — Russian gov sites are slow

let lastRequestTime = 0;

async function rateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_DELAY_MS) {
    await new Promise(resolve => setTimeout(resolve, MIN_DELAY_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

export interface FetchResult {
  status: number;
  body: string;
  contentType: string;
}

/**
 * Fetch a URL with rate limiting, timeout, and proper headers.
 * Retries up to maxRetries times on 429/5xx errors with exponential backoff.
 */
export async function fetchWithRateLimit(url: string, maxRetries = 3): Promise<FetchResult> {
  await rateLimit();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8',
          'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
          'Accept-Charset': 'windows-1251,utf-8;q=0.7,*;q=0.3',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timer);

      if (response.status === 429 || response.status >= 500) {
        if (attempt < maxRetries) {
          const backoff = Math.pow(2, attempt + 1) * 1000;
          console.log(`  HTTP ${response.status} for ${url}, retrying in ${backoff}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoff));
          continue;
        }
      }

      // Handle the response body - pravo.gov.ru uses Windows-1251 encoding
      // The content-type may be 'application/x-download' or 'text/html' without
      // specifying charset, so we always try Windows-1251 for pravo.gov.ru URLs
      const contentType = response.headers.get('content-type') ?? '';
      let body: string;

      const isPravo = url.includes('pravo.gov.ru');
      const needsWin1251 = isPravo ||
        contentType.includes('windows-1251') ||
        contentType.includes('cp1251');

      if (needsWin1251) {
        const buffer = await response.arrayBuffer();
        const decoder = new TextDecoder('windows-1251');
        body = decoder.decode(buffer);
      } else {
        body = await response.text();
      }

      return {
        status: response.status,
        body,
        contentType,
      };
    } catch (error) {
      clearTimeout(timer);

      if (attempt < maxRetries) {
        const backoff = Math.pow(2, attempt + 1) * 2000; // longer backoff for gov.ru
        const msg = error instanceof Error ? error.message : String(error);
        console.log(`  Error fetching ${url}: ${msg}, retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        continue;
      }

      throw error;
    }
  }

  throw new Error(`Failed to fetch ${url} after ${maxRetries} retries`);
}

/**
 * Fetch a pravo.gov.ru IPS law page.
 * URL pattern: http://pravo.gov.ru/proxy/ips/?docbody=&nd={ID}
 */
export async function fetchPravoLaw(nd: string): Promise<FetchResult> {
  const url = `http://pravo.gov.ru/proxy/ips/?docbody=&nd=${nd}&rdk=0&intelsearch=&firstDoc=1&lastDoc=1`;
  return fetchWithRateLimit(url);
}

/**
 * Fetch the full text of a law (all pages) from pravo.gov.ru.
 * Uses page=all to get the complete text.
 */
export async function fetchPravoLawFull(nd: string): Promise<FetchResult> {
  const url = `http://pravo.gov.ru/proxy/ips/?docbody=&nd=${nd}&rdk=0&page=all`;
  return fetchWithRateLimit(url);
}

/**
 * Fetch the saved/plain text version of a law from pravo.gov.ru.
 */
export async function fetchPravoLawText(nd: string): Promise<FetchResult> {
  const url = `http://pravo.gov.ru/proxy/ips/?savetext=&nd=${nd}&page=all`;
  return fetchWithRateLimit(url);
}

/**
 * Fetch JSON data from an API endpoint with rate limiting.
 */
export async function fetchJson(url: string, maxRetries = 3): Promise<unknown> {
  await rateLimit();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.status === 429 || response.status >= 500) {
        if (attempt < maxRetries) {
          const backoff = Math.pow(2, attempt + 1) * 1000;
          console.log(`  HTTP ${response.status} for ${url}, retrying in ${backoff}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoff));
          continue;
        }
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timer);

      if (attempt < maxRetries) {
        const backoff = Math.pow(2, attempt + 1) * 2000;
        const msg = error instanceof Error ? error.message : String(error);
        console.log(`  Error fetching ${url}: ${msg}, retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        continue;
      }

      throw error;
    }
  }

  throw new Error(`Failed to fetch JSON from ${url} after ${maxRetries} retries`);
}
