import { readdirSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { z } from 'zod';

import { getDataDir } from '#/utils/paths';
import { BUNDLED_THEMES } from './bundled-themes';
import type { ColorPalette, ResolvedTheme } from './colors';
import { getBuiltInPalette } from './colors';

export const CustomThemeSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().optional(),
  /** Built-in palette that unspecified tokens fall back to. Defaults to `dark`. */
  base: z.enum(['dark', 'light']).optional(),
  colors: z.record(z.string(), z.string()).optional(),
});

export type CustomThemeDefinition = z.infer<typeof CustomThemeSchema>;
export type ThemeSource = 'bundled' | 'custom';

export interface ThemeListEntry {
  readonly name: string;
  readonly displayName?: string;
  readonly source: ThemeSource;
  readonly overridesBundled?: boolean;
}

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Names reserved for built-in themes. A `dark.json` / `light.json` /
 * `auto.json` file would collide with the built-in value, so it can never be
 * selected as a custom theme — hide it from listings.
 */
const RESERVED_THEME_NAMES: ReadonlySet<string> = new Set(['dark', 'light', 'auto']);

export function getCustomThemesDir(): string {
  return join(getDataDir(), 'themes');
}

interface ParsedCustomTheme {
  readonly base: ResolvedTheme;
  readonly colors: Partial<ColorPalette>;
  readonly displayName?: string;
}

function parseThemeDefinition(input: unknown): ParsedCustomTheme | null {
  try {
    const parsed = CustomThemeSchema.parse(input);

    const colors = Object.fromEntries(
      Object.entries(parsed.colors ?? {}).filter(([, v]) => HEX_COLOR_REGEX.test(v)),
    ) as Partial<ColorPalette>;

    return {
      base: parsed.base ?? 'dark',
      colors,
      displayName: parsed.displayName,
    };
  } catch {
    return null;
  }
}

async function readCustomTheme(name: string): Promise<ParsedCustomTheme | null> {
  try {
    const content = await readFile(join(getCustomThemesDir(), `${name}.json`), 'utf-8');
    return parseThemeDefinition(JSON.parse(content));
  } catch {
    return null;
  }
}

function readBundledTheme(name: string): ParsedCustomTheme | null {
  const theme = BUNDLED_THEMES.find((candidate) => candidate.name === name);
  if (theme === undefined) return null;
  return parseThemeDefinition(theme);
}

export async function loadCustomTheme(name: string): Promise<Partial<ColorPalette> | null> {
  return (await readCustomTheme(name))?.colors ?? null;
}

export async function loadCustomThemeMerged(name: string): Promise<ColorPalette | null> {
  const parsed = (await readCustomTheme(name)) ?? readBundledTheme(name);
  if (parsed === null) return null;
  return { ...getBuiltInPalette(parsed.base), ...parsed.colors };
}

function toThemeNames(files: readonly string[]): string[] {
  return files
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .filter((name) => !RESERVED_THEME_NAMES.has(name))
    .toSorted();
}

function bundledThemeEntries(): ThemeListEntry[] {
  return BUNDLED_THEMES
    .filter((theme) => !RESERVED_THEME_NAMES.has(theme.name))
    .map((theme) => ({
      name: theme.name,
      displayName: theme.displayName,
      source: 'bundled' as const,
    }));
}

function customThemeEntries(names: readonly string[]): ThemeListEntry[] {
  const bundledNames = new Set(BUNDLED_THEMES.map((theme) => theme.name));
  return names.map((name) => ({
    name,
    source: 'custom' as const,
    overridesBundled: bundledNames.has(name) ? true : undefined,
  }));
}

function mergeThemeEntries(customNames: readonly string[]): ThemeListEntry[] {
  const customNameSet = new Set(customNames);
  return [
    ...bundledThemeEntries().filter((theme) => !customNameSet.has(theme.name)),
    ...customThemeEntries(customNames),
  ];
}

export async function listCustomThemes(): Promise<string[]> {
  try {
    const entries = await readdir(getCustomThemesDir(), { withFileTypes: true });
    return toThemeNames(entries.filter((e) => e.isFile()).map((e) => e.name));
  } catch {
    return [];
  }
}

/** Synchronous variant for UI paths (e.g. the `/theme` picker) that cannot await. */
export function listCustomThemesSync(): string[] {
  try {
    const entries = readdirSync(getCustomThemesDir(), { withFileTypes: true });
    return toThemeNames(entries.filter((e) => e.isFile()).map((e) => e.name));
  } catch {
    return [];
  }
}

export async function listAvailableThemeEntries(): Promise<ThemeListEntry[]> {
  return mergeThemeEntries(await listCustomThemes());
}

export function listAvailableThemeEntriesSync(): ThemeListEntry[] {
  return mergeThemeEntries(listCustomThemesSync());
}
