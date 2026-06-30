import { ChoicePickerComponent, type ChoiceOption } from './choice-picker';

import {
  listAvailableThemeEntriesSync,
  type ThemeListEntry,
} from '#/tui/theme/custom-theme-loader';
import type { ThemeName } from '#/tui/theme/index';

const THEME_OPTIONS: readonly ChoiceOption[] = [
  { value: 'auto', label: 'Auto (match terminal)' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
];

export interface ThemeSelectorOptions {
  readonly currentValue: ThemeName;
  readonly onSelect: (theme: ThemeName) => void;
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
  return {
    value: entry.name,
    label: entry.overridesBundled === true
      ? `Custom: ${entry.name} (overrides bundled)`
      : `Custom: ${entry.name}`,
    description: 'Loaded from ~/.kimi-code/themes.',
  };
}
