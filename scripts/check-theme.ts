import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { lumenThemeVariables } from '../packages/lumen-ui/src/theme-contract';

const projectRoot = resolve(import.meta.dirname, '..');
const themeSources = [
  { name: 'clarity', file: 'packages/lumen-theme-clarity/clarity.css' },
  { name: 'paper', file: 'packages/lumen-theme-paper/paper.css' },
  { name: 'prism', file: 'packages/lumen-theme-prism/prism.css' },
] as const;
const themes = await Promise.all(themeSources.map(async (theme) => ({
  ...theme,
  css: await readFile(resolve(projectRoot, theme.file), 'utf8'),
})));
const clarityCss = themes.find((theme) => theme.name === 'clarity')?.css ?? '';
const purpleThemeMatch = clarityCss.match(
  /\[data-lumen-theme='clarity'\]\[data-accent='purple'\]\s*\{([\s\S]*?)\n\}/,
);
const purpleDarkThemeMatch = clarityCss.match(
  /\[data-lumen-theme='clarity'\]\[data-color-scheme='dark'\]\[data-accent='purple'\]\s*\{([\s\S]*?)\n\}/,
);
const purpleThemeCss = purpleThemeMatch?.[1] ?? '';
const purpleDarkThemeCss = purpleDarkThemeMatch?.[1] ?? '';
const contractVariables = new Set<string>(lumenThemeVariables);
const colorSchemeVariables = [...contractVariables].filter(
  (variable) => variable.startsWith('--lumen-color-') || variable.startsWith('--lumen-shadow-'),
);
const accentVariables = [
  '--lumen-color-primary',
  '--lumen-color-primary-hover',
  '--lumen-color-primary-active',
  '--lumen-color-primary-soft',
  '--lumen-color-primary-soft-hover',
  '--lumen-color-on-primary',
  '--lumen-color-focus-ring',
];

const themeErrors: string[] = [];
for (const theme of themes) {
  const baseThemeMatch = theme.css.match(
    new RegExp(`\\[data-lumen-theme='${theme.name}'\\]\\s*\\{([\\s\\S]*?)\\n\\}`),
  );
  const darkThemeMatch = theme.css.match(
    new RegExp(`\\[data-lumen-theme='${theme.name}'\\]\\[data-color-scheme='dark'\\]\\s*\\{([\\s\\S]*?)\\n\\}`),
  );
  const baseThemeCss = baseThemeMatch?.[1] ?? '';
  const darkThemeCss = darkThemeMatch?.[1] ?? '';
  const declaredVariables = new Set(
    [...theme.css.matchAll(/(--lumen-[a-z0-9-]+)\s*:/g)].map((match) => match[1]),
  );
  const missing = [...contractVariables].filter(
    (variable) => !baseThemeCss.includes(`${variable}:`),
  );
  const unknown = [...declaredVariables].filter(
    (variable) => !contractVariables.has(variable),
  );
  const missingDarkVariables = colorSchemeVariables.filter(
    (variable) => !darkThemeCss.includes(`${variable}:`),
  );

  if (!baseThemeMatch) themeErrors.push(`${theme.name}: missing base selector`);
  if (!darkThemeMatch) themeErrors.push(`${theme.name}: missing dark selector`);
  if (!baseThemeCss.includes('color-scheme: light')) {
    themeErrors.push(`${theme.name}: base theme must declare color-scheme: light`);
  }
  if (!darkThemeCss.includes('color-scheme: dark')) {
    themeErrors.push(`${theme.name}: dark theme must declare color-scheme: dark`);
  }
  if (missing.length) themeErrors.push(`${theme.name}: missing variables: ${missing.join(', ')}`);
  if (unknown.length) themeErrors.push(`${theme.name}: unknown variables: ${unknown.join(', ')}`);
  if (missingDarkVariables.length) {
    themeErrors.push(`${theme.name}: missing dark variables: ${missingDarkVariables.join(', ')}`);
  }
}
const missingPurpleVariables = accentVariables.filter(
  (variable) => !purpleThemeCss.includes(`${variable}:`),
);
const missingPurpleDarkVariables = accentVariables.filter(
  (variable) => !purpleDarkThemeCss.includes(`${variable}:`),
);

const componentGlob = new Bun.Glob('packages/lumen-ui/src/components/**/*.{ts,tsx}');
const hardCodedVisuals: string[] = [];
for await (const relativePath of componentGlob.scan({ cwd: projectRoot })) {
  const source = await readFile(resolve(projectRoot, relativePath), 'utf8');
  if (/#[0-9a-f]{3,8}\b|rgba?\s*\(/i.test(source)) {
    hardCodedVisuals.push(relativePath);
  }
}

if (
  themeErrors.length
  || missingPurpleVariables.length
  || missingPurpleDarkVariables.length
  || hardCodedVisuals.length
) {
  for (const error of themeErrors) console.error('Invalid theme:', error);
  if (missingPurpleVariables.length) {
    console.error('Missing purple accent variables:', missingPurpleVariables.join(', '));
  }
  if (missingPurpleDarkVariables.length) {
    console.error('Missing dark purple accent variables:', missingPurpleDarkVariables.join(', '));
  }
  if (hardCodedVisuals.length) {
    console.error('Hard-coded component visuals:', hardCodedVisuals.join(', '));
  }
  process.exit(1);
}

console.log(
  `Theme contract valid: ${themes.length} themes; ${contractVariables.size} variables; ${colorSchemeVariables.length} dark scheme overrides`,
);
