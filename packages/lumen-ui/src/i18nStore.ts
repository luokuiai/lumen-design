import type { LumenLocale } from './i18n';

let activeLocale: LumenLocale | undefined;

export const getActiveLocale = (fallback: LumenLocale) => activeLocale ?? fallback;

export const setActiveLocale = (locale: LumenLocale | undefined) => {
  activeLocale = locale;
};
