import { visibleWidth } from '@earendil-works/pi-tui';

import { highlightLines } from '#/tui/components/media/code-highlight';
import { currentTheme } from '#/tui/theme';
import {
  listAvailableThemeEntriesSync,
  type ThemeListEntry,
} from '#/tui/theme/custom-theme-loader';
import type { ThemeName } from '#/tui/theme/index';
import { ChoicePickerComponent, type ChoiceOption } from './choice-picker';

const THEME_OPTIONS: readonly ChoiceOption[] = [
  { value: 'auto', label: 'Auto (match terminal)' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
];

export interface ThemeSelectorOptions {
  readonly currentValue: ThemeName;
  readonly onSelect: (theme: ThemeName) => void;
  readonly onHighlight?: (theme: ThemeName) => void;
  readonly onCancel: () => void;
}

export class ThemeSelectorComponent extends ChoicePickerComponent {
  constructor(opts: ThemeSelectorOptions) {
    const options: ChoiceOption[] = [
      ...THEME_OPTIONS,
      ...listAvailableThemeEntriesSync().map(themeEntryToOption),
    ];
    super({
      title: 'Select theme',
      options,
      currentValue: opts.currentValue,
      searchable: true,
      pageSize: 10,
      onHighlight: (value) => {
        opts.onHighlight?.(value);
      },
      renderPreview: renderThemePreview,
      onSelect: (value) => {
        opts.onSelect(value);
      },
      onCancel: opts.onCancel,
    });
  }
}

function themeEntryToOption(entry: ThemeListEntry): ChoiceOption {
  if (entry.source === 'bundled') {
    return {
      value: entry.name,
      label: entry.displayName ?? `Super Kimi: ${entry.name}`,
      description: 'Bundled Super Kimi preset.',
    };
  }
  if (entry.source === 'bundled-external') {
    return {
      value: entry.name,
      label: entry.displayName ?? entry.name,
      description: 'Bundled external terminal theme.',
    };
  }
  return {
    value: entry.name,
    label: entry.overridesBundled === true
      ? `Custom: ${entry.name} (overrides bundled)`
      : `Custom: ${entry.name}`,
    description: 'Loaded from ~/.kimi-code/themes.',
  };
}

function renderThemePreview(option: ChoiceOption, width: number): readonly string[] {
  const innerWidth = Math.max(1, width - 4);
  const rows = [
    currentTheme.boldFg('primary', ` Preview · ${option.label}`),
    swatches(innerWidth),
    currentTheme.fg('text', ' ● Assistant reply ') +
      currentTheme.fg('textDim', 'with ') +
      currentTheme.fg('primary', 'inline code') +
      currentTheme.fg('textDim', ' and ') +
      currentTheme.fg('success', 'success') +
      currentTheme.fg('textDim', ' / ') +
      currentTheme.fg('warning', 'warning') +
      currentTheme.fg('textDim', ' / ') +
      currentTheme.fg('error', 'error'),
    currentTheme.fg('roleUser', ' ✨ User prompt') +
      currentTheme.fg('textDim', '   ') +
      currentTheme.fg('shellMode', '$ pnpm test'),
    ...highlightLines(
      'const skin = createTheme("premium", { particles: true });\nreturn skin.syntax.keyword;',
      'typescript',
    ).map((line) => `   ${line}`),
  ];
  return rows.map((row) => paintPreviewRow(row, innerWidth));
}

function swatches(width: number): string {
  const labels = [
    ['primary', currentTheme.color('primary')],
    ['accent', currentTheme.color('accent')],
    ['surface', currentTheme.color('surface')],
    ['syntax', currentTheme.color('syntaxKeyword')],
  ] as const;
  const row = labels
    .map(
      ([label, color]) =>
        currentTheme.bg('surfaceRaised', ` ${label} `) +
        ' ' +
        currentTheme.fg('textMuted', color),
    )
    .join(currentTheme.fg('textMuted', '  '));
  return visibleWidth(row) > width ? row : row + ' '.repeat(width - visibleWidth(row));
}

function paintPreviewRow(row: string, width: number): string {
  const padded = row + ' '.repeat(Math.max(0, width - visibleWidth(row)));
  return '  ' + currentTheme.bg('background', padded);
}
