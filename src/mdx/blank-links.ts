function withBlank(attrs: string): string {
  let next = attrs;
  if (!/\btarget\s*=/i.test(next)) next += ' target="_blank"';
  const rel = /\brel\s*=\s*(["'])([\s\S]*?)\1/i.exec(next);
  if (rel) {
    const parts = new Set(rel[2].split(/\s+/).filter(Boolean));
    parts.add("noopener");
    parts.add("noreferrer");
    next = next.replace(rel[0], `rel=${rel[1]}${[...parts].join(" ")}${rel[1]}`);
  } else {
    next += ' rel="noopener noreferrer"';
  }
  return next;
}

/** Post body links open in a new tab. Frontmatter stays untouched. */
export function blankPostLinks(source: string): string {
  const fence = source.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  const head = fence?.[0] ?? "";
  const body = source.slice(head.length);
  const rewritten = body
    .replace(/<a\b([^>]*)>/gi, (_, attrs: string) => `<a${withBlank(attrs)}>`)
    .replace(/\\u003ca\b([^>]*)>/gi, (_, attrs: string) => `\\u003ca${withBlank(attrs)}>`);
  return head + rewritten;
}
