import postcss, { type Root } from "postcss";
import selectorParser from "postcss-selector-parser";
import tailwind from "tailwindcss-legacy";
import type { PluginAPI } from "tailwindcss-legacy/types/config";

function classes(root: Root): Set<string> {
  const result = new Set<string>();
  root.walkRules((rule) => {
    selectorParser((selectors) => {
      selectors.walkClasses((node) => {
        if (node.value !== "group" && node.value !== "peer") result.add(node.value);
      });
    }).processSync(rule.selector);
  });
  return result;
}

function legacyCandidate(candidate: string): string {
  return candidate
    .replace(/min-\[(\d+)px\]:/g, (_, px) => `min-[${Number(px) / 16}rem]:`)
    .replace(/outline-solid$/, "[outline-style:solid]")
    .replace(/outline-none$/, "[outline-style:none]")
    .replace(
      /(border|bg|text|ring|shadow)-\[var\((--[\w-]+)\)\]\/(\d+)$/,
      "$1-[color:color-mix(in_srgb,var($2)_$3%,transparent)]",
    )
    .replace(
      /(bg|ring)-current\/(\d+)$/,
      "$1-[color:color-mix(in_srgb,currentColor_$2%,transparent)]",
    );
}

function fallbackColor(first: string, second: string, property: string): string {
  // shortcut: semantic colors approximate alpha; add theme RGB channels when exact mixing is required.
  if (second === "transparent") {
    if (first === "var(--lumen-color-primary)" && property === "--tw-ring-color") {
      return "var(--lumen-color-focus-ring)";
    }
    if (property === "--tw-shadow-color") return "var(--lumen-color-shadow)";
    if (property.startsWith("--lumen-scrollbar-thumb")) return "var(--lumen-color-text-placeholder)";
    if (first === "currentColor" && property === "background-color") return "var(--lumen-color-surface-hover)";
    return first;
  }
  if (second === "var(--lumen-color-surface)") {
    if (first === "var(--lumen-color-primary)") return "var(--lumen-color-primary-soft)";
    if (first === "var(--lumen-color-text)") return "var(--lumen-color-surface-hover)";
    if (first === "var(--lumen-color-text-placeholder)") return "var(--lumen-color-border)";
  }
  if (first === "var(--lumen-color-text)" && second === "var(--lumen-color-text-strong)") {
    return first;
  }
  throw new Error(`No legacy color fallback for ${first}, ${second}`);
}

function lowerLegacySyntax(root: Root): void {
  root.walkAtRules("media", (rule) => {
    rule.params = rule.params
      .replace(/\(width >= ([\d.]+)rem\)/g, "(min-width: $1rem)")
      .replace(/\(width < ([\d.]+)rem\)/g, (_, width) => `(max-width: ${Number(width) - 0.001}rem)`);
  });
  root.walkRules((rule) => {
    rule.selector = selectorParser((selectors) => {
      selectors.walkPseudos((node) => {
        if (node.value === ":has") node.replaceWith(selectorParser.pseudo({ value: ":focus-within" }));
      });
    }).processSync(rule.selector);
  });
  root.walkDecls((decl) => {
    decl.value = decl.value
      .replace(/(\d)dvh\b/g, "$1vh")
      .replace(
        /color-mix\(\s*in srgb,\s*(var\(--[\w-]+\)|currentColor)\s+[\d.]+%,\s*(var\(--[\w-]+\)|transparent)\s*\)/g,
        (_, first, second) => fallbackColor(first, second, decl.prop),
      );
    if (decl.value.includes("color-mix(")) {
      throw new Error(`Unhandled legacy color in ${decl.toString()}`);
    }
  });
}

export async function buildLegacyCss(modernCss: string, baseCss: string): Promise<string> {
  const utilities = postcss.root();
  postcss.parse(modernCss).walkAtRules("layer", (layer) => {
    if (layer.params === "utilities") utilities.append(layer.nodes?.map((node) => node.clone()) ?? []);
  });
  const candidates = classes(utilities);
  if (candidates.size === 0) throw new Error("Modern CSS has no utilities; build it before legacy CSS");
  const renamed = new Map([...candidates].map((candidate) => [legacyCandidate(candidate), candidate]));

  const shared = postcss.parse(baseCss);
  const screens: Record<string, string> = {
    sm: "40rem", md: "48rem", lg: "64rem", xl: "80rem", "2xl": "96rem",
  };
  const fontWeight: Record<string, string> = {};
  shared.walkAtRules("theme", (rule) => {
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith("--breakpoint-")) screens[decl.prop.slice(13)] = decl.value;
      if (decl.prop.startsWith("--font-weight-")) fontWeight[decl.prop.slice(14)] = decl.value;
    });
    rule.remove();
  });
  shared.walkAtRules(/^(import|source|custom-variant)$/, (rule) => { rule.remove(); });
  const componentBase = postcss.root();
  shared.walkAtRules("layer", (rule) => {
    if (rule.params !== "base") throw new Error(`Unhandled shared CSS layer: ${rule.params}`);
    componentBase.append(rule.nodes?.map((node) => node.clone()) ?? []);
    rule.remove();
  });

  const result = await postcss([tailwind({
    content: [{ raw: "", extension: "html" }],
    safelist: [...renamed.keys()],
    theme: {
      screens,
      extend: {
        spacing: { 13: "3.25rem" },
        lineHeight: { 4.5: "1.125rem" },
        opacity: Object.fromEntries(Array.from({ length: 101 }, (_, i) => [i, String(i / 100)])),
        fontWeight,
        boxShadow: { sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)" },
      },
    },
    plugins: [({ addVariant }: PluginAPI) => {
      addVariant("mobile", "@media (max-width: 39.999rem)");
      addVariant("pad", "@media (min-width: 40rem) and (max-width: 63.999rem)");
    }],
  })]).process(
    `@tailwind base;\n${componentBase.toString()}\n@tailwind components;\n@tailwind utilities;\n${shared.toString()}`,
    { from: undefined },
  );
  result.root.walkRules((rule) => {
    rule.selector = selectorParser((selectors) => {
      selectors.walkClasses((node) => {
        const original = renamed.get(node.value);
        if (original) node.value = original;
      });
    }).processSync(rule.selector);
  });
  const emitted = classes(result.root);
  const missing = [...candidates].filter((candidate) => !emitted.has(candidate));
  if (missing.length) throw new Error(`Missing legacy utilities: ${missing.join(", ")}`);
  lowerLegacySyntax(result.root);
  return `/* Lumen legacy CSS: Tailwind 3.4; use instead of styles.css. */\n${result.root.toString()}`;
}
