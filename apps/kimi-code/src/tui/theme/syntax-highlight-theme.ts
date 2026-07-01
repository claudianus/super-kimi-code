import chalk from 'chalk';
import type { Theme } from 'cli-highlight';

import { currentTheme } from './theme';

const syntax = (token: Parameters<typeof currentTheme.color>[0]) => (text: string): string =>
  chalk.hex(currentTheme.color(token))(text);

export function buildSyntaxHighlightTheme(): Theme {
  const text = syntax('syntaxText');
  const keyword = syntax('syntaxKeyword');
  const fn = syntax('syntaxFunction');
  const type = syntax('syntaxType');
  const string = syntax('syntaxString');
  const number = syntax('syntaxNumber');
  const comment = syntax('syntaxComment');
  const operator = syntax('syntaxOperator');
  const tag = syntax('syntaxTag');
  const meta = syntax('syntaxMeta');
  return {
    default: text,
    keyword,
    built_in: keyword,
    literal: number,
    number,
    regexp: string,
    string,
    subst: text,
    symbol: operator,
    class: type,
    type,
    function: fn,
    title: fn,
    params: text,
    comment,
    doctag: comment,
    meta,
    'meta-keyword': meta,
    'meta-string': string,
    section: type,
    tag,
    name: tag,
    'builtin-name': tag,
    attr: type,
    attribute: type,
    variable: text,
    bullet: operator,
    code: text,
    emphasis: (s) => chalk.italic(s),
    strong: (s) => chalk.bold(s),
    formula: text,
    link: syntax('primary'),
    quote: comment,
    'selector-tag': tag,
    'selector-id': type,
    'selector-class': type,
    'selector-attr': type,
    'selector-pseudo': operator,
    'template-tag': tag,
    'template-variable': text,
    addition: syntax('success'),
    deletion: syntax('error'),
  };
}
