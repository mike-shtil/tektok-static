import rules from "./rules.json" with { type: "json" };

export const CACHE_CONTROL = "public, max-age=31536000, s-maxage=31536000, immutable";

type ExactRule = { id: number; kind: "exact"; from: string; to: string; status: number };
type RegexRule = { id: number; kind: "regex"; pattern: string; to: string; status: number };
type QueryRule = { id: number; kind: "query"; key: string; to: string; status: number };
type Rule = ExactRule | RegexRule | QueryRule;

const list = rules as Rule[];
const compiled = new Map<string, RegExp>();

function requestPath(url: URL): string {
  let path = url.pathname;
  if (/%[0-9a-fA-F]{2}/.test(path)) {
    try {
      path = decodeURIComponent(path);
    } catch {
      // keep the raw pathname when a percent sequence is not valid encoding
    }
  }
  if (path !== "/") path = path.replace(/\/+$/, "");
  return path;
}

function regexFor(pattern: string): RegExp {
  let compiledPattern = compiled.get(pattern);
  if (!compiledPattern) {
    compiledPattern = new RegExp(pattern);
    compiled.set(pattern, compiledPattern);
  }
  return compiledPattern;
}

export function legacyRedirect(url: URL): { location: string; status: number } | undefined {
  const path = requestPath(url);
  for (const rule of list) {
    if (rule.kind === "exact") {
      if (path === rule.from) return { location: rule.to, status: rule.status };
      continue;
    }
    if (rule.kind === "query") {
      if (url.searchParams.has(rule.key)) return { location: rule.to, status: rule.status };
      continue;
    }
    const pattern = regexFor(rule.pattern);
    if (!pattern.test(path)) continue;
    return { location: path.replace(pattern, rule.to), status: rule.status };
  }
  return undefined;
}
