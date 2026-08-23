import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { lumenThemeVariables } from '../packages/lumen-ui/src/theme-contract';

const projectRoot = resolve(import.meta.dirname, '..');
const clarityPath = resolve(projectRoot, 'packages/lumen-theme-clarity/clarity.css');
const clarityCss = await readFile(clarityPath, 'utf8');
const darkThemeMatch = clarityCss.match(
  /\[data-lumen-theme='clarity'\]\[data-color-scheme='dark'\]\s*\{([\s\S]*?)\n\}/,
);
const darkThemeCss = darkThemeMatch?.[1] ?? '';
const purpleThemeMatch = clarityCss.match(
  /\[data-lumen-theme='clarity'\]\[data-accent='purple'\]\s*\{([\s\S]*?)\n\}/,
);
const purpleDarkThemeMatch = clarityCss.match(
  /\[data-lumen-theme='clarity'\]\[data-color-scheme='dark'\]\[data-accent='purple'\]\s*\{([\s\S]*?)\n\}/,
);
const purpleThemeCss = purpleThemeMatch?.[1] ?? '';
const purpleDarkThemeCss = purpleDarkThemeMatch?.[1] ?? '';
const declaredVariables = new Set(
  [...clarityCss.matchAll(/(--lumen-[a-z0-9-]+)\s*:/g)].map(
    (match) => match[1],
  ),
);
const darkThemeVariables = new Set(
  [...darkThemeCss.matchAll(/(--lumen-[a-z0-9-]+)\s*:/g)].map(
    (match) => match[1],
  ),
);
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

const missing = [...contractVariables].filter(
  (variable) => !declaredVariables.has(variable),
);
const unknown = [...declaredVariables].filter(
  (variable) => !contractVariables.has(variable),
);
const missingDarkVariables = colorSchemeVariables.filter(
  (variable) => !darkThemeVariables.has(variable),
);
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
  missing.length
  || unknown.length
  || missingDarkVariables.length
  || missingPurpleVariables.length
  || missingPurpleDarkVariables.length
  || !darkThemeCss.includes('color-scheme: dark')
  || hardCodedVisuals.length
) {
  if (missing.length) console.error('Missing theme variables:', missing.join(', '));
  if (unknown.length) console.error('Unknown theme variables:', unknown.join(', '));
  if (missingDarkVariables.length) {
    console.error('Missing dark theme variables:', missingDarkVariables.join(', '));
  }
  if (missingPurpleVariables.length) {
    console.error('Missing purple accent variables:', missingPurpleVariables.join(', '));
  }
  if (missingPurpleDarkVariables.length) {
    console.error('Missing dark purple accent variables:', missingPurpleDarkVariables.join(', '));
  }
  if (!darkThemeCss.includes('color-scheme: dark')) {
    console.error('Dark theme must declare color-scheme: dark');
  }
  if (hardCodedVisuals.length) {
    console.error('Hard-coded component visuals:', hardCodedVisuals.join(', '));
  }
  process.exit(1);
}

console.log(
  `Theme contract valid: ${contractVariables.size} variables; ${colorSchemeVariables.length} dark scheme overrides`,
);
