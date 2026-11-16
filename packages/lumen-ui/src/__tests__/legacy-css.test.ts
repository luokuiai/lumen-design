import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postcss, { type Root } from "postcss";
import selectorParser from "postcss-selector-parser";
import { describe, expect, it } from "vitest";
import { buildLegacyCss } from "../../../../scripts/legacy-css";

const baseCss = readFileSync(resolve(__dirname, "../styles/base.css"), "utf8");

function modernCss(candidates: readonly string[]): string {
  const rules = candidates.map((candidate) => {
    const selector = selectorParser.className({ value: "" });
    selector.value = candidate;
    return `${selector.toString()} { display: block; }`;
  });
  return `@layer utilities { ${rules.join("\n")} }`;
}

function declarations(root: Root, candidate: string): Record<string, string> {
  const values: Record<string, string> = {};
  root.walkRules((rule) => {
    selectorParser((selectors) => {
      selectors.walkClasses((node) => {
        if (node.value === candidate) {
          rule.walkDecls((decl) => { values[decl.prop] = decl.value; });
        }
      });
    }).processSync(rule.selector);
  });
  return values;
}

describe("legacy CSS output", () => {
  it("keeps control dimensions, theme colors, fonts and interactive states", async () => {
    const candidates = [
      "h-[var(--lumen-control-height-md)]", "h-13", "w-13", "leading-4.5",
      "border", "border-[var(--lumen-color-border)]", "font-medium", "shadow-sm",
      "disabled:opacity-35", "focus:ring-2", "focus:ring-[var(--lumen-color-primary)]/10",
      "bg-[var(--lumen-color-surface)]/92", "hover:bg-current/10",
      "focus-visible:outline-solid", "focus:outline-none",
      "text-[color-mix(in_srgb,var(--lumen-color-text)_65%,var(--lumen-color-text-strong))]",
    ] as const;
    const output = await buildLegacyCss(modernCss(candidates), baseCss);
    const root = postcss.parse(output);
    expect(declarations(root, candidates[0]).height).toBe("var(--lumen-control-height-md)");
    expect(declarations(root, "h-13").height).toBe("3.25rem");
    expect(declarations(root, "w-13").width).toBe("3.25rem");
    expect(declarations(root, "leading-4.5")["line-height"]).toBe("1.125rem");
    expect(declarations(root, "border")["border-width"]).toBe("1px");
    expect(declarations(root, candidates[5])["border-color"]).toBe("var(--lumen-color-border)");
    expect(declarations(root, "font-medium")["font-weight"]).toBe("var(--lumen-font-weight-medium)");
    expect(declarations(root, "disabled:opacity-35").opacity).toBe("0.35");
    expect(declarations(root, candidates[10])["--tw-ring-color"]).toBe("var(--lumen-color-focus-ring)");
    expect(declarations(root, candidates[11])["background-color"]).toBe("var(--lumen-color-surface)");
    expect(declarations(root, candidates[12])["background-color"]).toBe("var(--lumen-color-surface-hover)");
    expect(declarations(root, candidates[13])["outline-style"]).toBe("solid");
    expect(declarations(root, candidates[14])["outline-style"]).toBe("none");
    expect(output).toContain("--tw-ring-offset-width: 0px");
    expect(output).not.toMatch(/@(layer|property|theme|source|tailwind|custom-variant)\b/);
    root.walkDecls((decl) => { expect(decl.value).not.toContain("color-mix("); });
  });

  it("retains shared animations and bases while lowering media, viewport and focus syntax", async () => {
    const output = await buildLegacyCss(modernCss([
      "mobile:hidden", "pad:flex", "l:block", "xl:py-4", "min-[1920px]:text-[15px]",
      "max-h-[calc(100dvh-1.5rem)]", "group-hover:text-[var(--lumen-color-primary)]",
    ]), baseCss);
    expect(output).toContain("@media (max-width: 39.999rem)");
    expect(output).toContain("@media (min-width: 40rem) and (max-width: 63.999rem)");
    expect(output).toContain("@media (min-width: 64rem)");
    expect(output).toContain("@media (min-width: 80rem)");
    expect(output).toContain("@media (min-width: 120rem)");
    expect(output).toContain("max-height: calc(100vh - 1.5rem)");
    expect(output).toContain("@keyframes lumen-button-ripple");
    expect(output).toContain("@keyframes lumen-drawer-left-in");
    expect(output).toContain("prefers-reduced-motion: reduce");
    expect(output).toContain(".lumen-scrollbar-outer:focus-within");
    expect(output).toContain("[data-ui='tree-select-row']:focus-within");
    expect(output).toContain(":where([data-ui='dialog'])");
    expect(output).toContain("--lumen-control-height-md: 36px");
    const root = postcss.parse(output);
    root.walkRules((rule) => { expect(rule.selector).not.toContain(":has("); });
    root.walkAtRules("media", (rule) => { expect(rule.params).not.toMatch(/[<>]=?/); });
    root.walkDecls((decl) => { expect(decl.value).not.toContain("dvh"); });
  });

  it("fails the build for missing utilities or an unmapped shared color", async () => {
    await expect(buildLegacyCss("", baseCss)).rejects.toThrow("no utilities");
    await expect(buildLegacyCss(modernCss(["block", "some-future-v4-utility"]), baseCss))
      .rejects.toThrow("Missing legacy utilities");
    await expect(buildLegacyCss(modernCss(["block"]),
      ".example { color: color-mix(in srgb, var(--new-color) 50%, var(--other-color)); }"))
      .rejects.toThrow("No legacy color fallback");
  });
});
