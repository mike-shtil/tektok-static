function normalize(value: string): string {
  let path = value.split(/[?#]/, 1)[0] || "/";
  try {
    path = decodeURI(path);
  } catch {
    // Keep the raw path when a percent-sequence is malformed.
  }
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path || "/";
}

/** Whether `href` is the page being viewed, including home and category pagination. */
export function isCurrentPage(pathname: string, href: string): boolean {
  const path = normalize(pathname);
  const target = normalize(href);
  if (target === "/") return path === "/" || /^\/page\/\d+$/.test(path);
  return path === target || path.startsWith(`${target}/`);
}
