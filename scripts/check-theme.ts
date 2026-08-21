import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { lumenThemeVariables } from '../packages/lumen-ui/src/theme-contract';

const projectRoot = resolve(import.meta.dirname, '..');
const clarityPath = resolve(projectRoot, 'packages/lumen-theme-clarity/clarity.css');
const clarityCss = await readFile(clarityPath, 'utf8');
const declaredVariables = new Set(
  [...clarityCss.matchAll(/(--lumen-[a-z0-9-]+)\s*:/g)].map(
    (match) => match[1],
  ),
);
const contractVariables = new Set<string>(lumenThemeVariables);

const missing = [...contractVariables].filter(
  (variable) => !declaredVariables.has(variable),
);
const unknown = [...declaredVariables].filter(
  (variable) => !contractVariables.has(variable),
);

const componentGlob = new Bun.Glob('packages/lumen-ui/src/components/**/*.{ts,tsx}');
const hardCodedVisuals: string[] = [];
for await (const relativePath of componentGlob.scan({ cwd: projectRoot })) {
  const source = await readFile(resolve(projectRoot, relativePath), 'utf8');
  if (/#[0-9a-f]{3,8}\b|rgba?\s*\(/i.test(source)) {
    hardCodedVisuals.push(relativePath);
  }
}

if (missing.length || unknown.length || hardCodedVisuals.length) {
  if (missing.length) console.error('Missing theme variables:', missing.join(', '));
  if (unknown.length) console.error('Unknown theme variables:', unknown.join(', '));
  if (hardCodedVisuals.length) {
    console.error('Hard-coded component visuals:', hardCodedVisuals.join(', '));
  }
  process.exit(1);
}

console.log(`Theme contract valid: ${contractVariables.size} variables`);
