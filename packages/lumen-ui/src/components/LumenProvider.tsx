import React, { useEffect } from 'react';
import {
  LumenLocaleContext,
  type LumenLocale,
  zhCN,
} from '../i18n';
import { getActiveLocale, setActiveLocale } from '../i18nStore';

export interface LumenProviderProps {
  children: React.ReactNode;
  locale?: LumenLocale;
}

export const LumenProvider: React.FC<LumenProviderProps> = ({
  children,
  locale = zhCN,
}) => {
  useEffect(() => {
    const previousLocale = getActiveLocale(zhCN);
    setActiveLocale(locale);
    return () => setActiveLocale(previousLocale);
  }, [locale]);

  return (
    <LumenLocaleContext.Provider value={locale}>
      {children}
    </LumenLocaleContext.Provider>
  );
};
