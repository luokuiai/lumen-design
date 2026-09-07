import { createContext } from 'react';

export const FormContext = createContext<{
  errors: Record<string, string | undefined>;
  showErrors: boolean;
} | null>(null);
