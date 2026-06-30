import { parseHTML as rawParseHTML } from 'linkedom';

import type { WebSearchProvider, WebSearchResult } from '../builtin';

interface DomElementLike {
  textContent: string | null;
  getAttribute(name: string): string | null;
  querySelector(selector: string): DomElementLike | null;
  querySelectorAll(selector: string): DomElementLike[];
}

interface DomParseResult {
  document: DomElementLike;
}

const parseHTML = rawParseHTML as unknown as (html: string) => DomParseResult;

const DEFAULT_SEARCH_URL = 'https://duckduckgo.com/html/';
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;

export interface LocalWebSearchProviderOptions {
  searchUrl?: string;
  userAgent?: string;
  fetchImpl?: typeof fetch;
  maxBytes?: number;
}

export class LocalWebSearchProvider implements WebSearchProvider {
  private readonly searchUrl: string;
  private readonly userAgent: string;
  private readonly fetchImpl: typeof fetch;
  private readonly maxBytes: number;

  constructor(options: LocalWebSearchProviderOptions = {}) {
    this.searchUrl = options.searchUrl ?? DEFAULT_SEARCH_URL;
    this.userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
    this.maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  }

  async search(
    query: string,
    options?: { limit?: number; includeContent?: boolean; toolCallId?: string },
  ): Promise<WebSearchResult[]> {
    const trimmed = query.trim();
    if (trimmed.length === 0) return [];

    const url = new URL(this.searchUrl);
    url.searchParams.set('q', trimmed);

    const response = await this.fetchImpl(url, {
      method: 'GET',
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': this.userAgent,
      },
    });
    if (response.status >= 400) {
      await response.body?.cancel().catch(() => undefined);
      throw new Error(`Local search request failed: HTTP ${String(response.status)} ${response.statusText}`);
    }

    const contentLengthRaw = response.headers.get('content-length');
    if (contentLengthRaw !== null) {
      const contentLength = Number(contentLengthRaw);
      if (Number.isFinite(contentLength) && contentLength > this.maxBytes) {
        throw new Error(
          `Search response too large: ${String(contentLength)} bytes exceeds maxBytes (${String(this.maxBytes)}).`,
        );
      }
    }

    const html = await response.text();
    const actualBytes = Buffer.byteLength(html, 'utf8');
    if (actualBytes > this.maxBytes) {
      throw new Error(
        `Search response too large: ${String(actualBytes)} bytes exceeds maxBytes (${String(this.maxBytes)}).`,
      );
    }

    return this.parseResults(html, options?.limit ?? 5);
  }

  private parseResults(html: string, limit: number): WebSearchResult[] {
    const { document } = parseHTML(html);
    const nodes = [...document.querySelectorAll('.result')];
    const results: WebSearchResult[] = [];
    for (const node of nodes) {
      const link = node.querySelector('a.result__a') ?? node.querySelector('a[href]');
      const rawUrl = link?.getAttribute('href') ?? '';
      const url = normalizeResultUrl(rawUrl);
      if (url === undefined) continue;
      const title = textOf(link);
      if (title.length === 0) continue;
      const snippet =
        textOf(node.querySelector('.result__snippet')) ||
        textOf(node.querySelector('.result__body')) ||
        textOf(node);
      results.push({ title, url, snippet });
      if (results.length >= limit) break;
    }
    return results;
  }
}

function textOf(element: DomElementLike | null | undefined): string {
  return (element?.textContent ?? '').replaceAll(/\s+/g, ' ').trim();
}

function normalizeResultUrl(rawUrl: string): string | undefined {
  if (rawUrl.length === 0) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(rawUrl, DEFAULT_SEARCH_URL);
  } catch {
    return undefined;
  }
  const unwrapped = parsed.searchParams.get('uddg');
  if (unwrapped !== null && unwrapped.length > 0) {
    try {
      parsed = new URL(unwrapped);
    } catch {
      return undefined;
    }
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;
  return parsed.toString();
}
