import { readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ORIGIN = "https://tektok.co.il";

// Same permalink encoding as `wpSegment` in src/content/index.ts.
function wpSegment(slug) {
  return encodeURIComponent(slug).replace(/%[0-9A-F]{2}/g, (hex) => hex.toLowerCase());
}

function postLoc(slug) {
  return `${ORIGIN}/${wpSegment(slug)}/`;
}

/** `YYYY-MM-DDTHH:mm:ss` in Asia/Jerusalem → sitemap `lastmod` in UTC. */
function jerusalemToUtc(local) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})$/.exec(local.trim());
  if (!match) throw new Error(`Post date is not a local timestamp: ${local}`);
  const [, year, month, day, hour, minute, second] = match.map(Number);
  const wall = Date.UTC(year, month - 1, day, hour, minute, second);
  let utc = wall;
  for (let i = 0; i < 3; i++) utc = wall - zoneOffset(utc, "Asia/Jerusalem");
  return formatUtc(new Date(utc));
}

function zoneOffset(utcMs, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const value = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  let hour = Number(value.hour);
  let day = Number(value.day);
  if (hour === 24) {
    hour = 0;
    day += 1;
  }
  const asUtc = Date.UTC(Number(value.year), Number(value.month) - 1, day, hour, Number(value.minute), Number(value.second));
  return asUtc - utcMs;
}

function formatUtc(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}+00:00`;
}

function assertTimezone() {
  if (jerusalemToUtc("2024-11-22T02:15:03") !== "2024-11-22T00:15:03+00:00") {
    throw new Error("Asia/Jerusalem winter offset changed");
  }
  if (jerusalemToUtc("2019-08-05T03:00:00") !== "2019-08-05T00:00:00+00:00") {
    throw new Error("Asia/Jerusalem summer offset changed");
  }
}

function readPosts(root) {
  const dir = path.join(root, "src", "content", "posts");
  const posts = readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => {
      const source = readFileSync(path.join(dir, name), "utf8");
      const frontmatter = source.slice(source.indexOf("---") + 3, source.indexOf("\n---", 3));
      const date = frontmatter.match(/^date:\s*"([^"]+)"/m)?.[1];
      if (!date) throw new Error(`Missing date in ${name}`);
      return {
        loc: postLoc(name.slice(0, -4)),
        lastmod: jerusalemToUtc(date),
        changefreq: "weekly",
        priority: "0.2",
      };
    });
  if (!posts.length) throw new Error("No posts found for the sitemap");
  posts.sort((a, b) => a.lastmod.localeCompare(b.lastmod) || a.loc.localeCompare(b.loc));
  return posts;
}

// WordPress `post_modified_gmt` for the static pages, from the live page-sitemap.
const pages = [
  { loc: `${ORIGIN}/terms/`, lastmod: "2019-01-12T23:23:12+00:00", changefreq: "weekly", priority: "0.6" },
  { loc: `${ORIGIN}/about-us/`, lastmod: "2021-01-01T22:47:36+00:00", changefreq: "weekly", priority: "0.6" },
  { loc: `${ORIGIN}/contact-us/`, lastmod: "2019-01-13T00:49:05+00:00", changefreq: "weekly", priority: "0.6" },
  { loc: `${ORIGIN}/podcasts/`, lastmod: "2019-06-03T07:55:44+00:00", changefreq: "weekly", priority: "0.6" },
];

function latest(entries) {
  return entries.reduce((max, entry) => (entry.lastmod > max ? entry.lastmod : max), entries[0].lastmod);
}

function xmlEscape(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function urlset(entries) {
  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${xmlEscape(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function sitemapIndex(entries) {
  const items = entries
    .map(
      (entry) => `  <sitemap>
    <loc>${xmlEscape(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </sitemap>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/siteindex.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>
`;
}

function htmlPage(title, intro, headers, rows) {
  const head = headers.map((header) => `<th>${xmlEscape(header)}</th>`).join("");
  const body = rows
    .map((row, index) => {
      const cells = row.map((cell) => `<td>${cell}</td>`).join("");
      return `<tr${index % 2 ? ' class="alt"' : ""}>${cells}</tr>`;
    })
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${xmlEscape(title)}</title>
  <style>
    body { font-family: "Lucida Grande", "Lucida Sans Unicode", Tahoma, Verdana, sans-serif; font-size: 13px; }
    #intro { background: #cfebf7; border: 1px solid #2580b2; padding: 5px 13px; margin: 10px; }
    #intro p { line-height: 1.3; }
    td, th { font-size: 11px; text-align: left; padding-right: 30px; }
    tr.alt { background: whitesmoke; }
    a { color: black; }
  </style>
</head>
<body>
  <h1>${xmlEscape(title)}</h1>
  <div id="intro">${intro}</div>
  <table>
    <tr>${head}</tr>
    ${body}
  </table>
</body>
</html>
`;
}

function link(href) {
  const safe = xmlEscape(href);
  return `<a href="${safe}">${safe}</a>`;
}

function urlRows(entries) {
  return entries.map((entry) => [link(entry.loc), entry.priority, entry.changefreq, entry.lastmod]);
}

export function generateSitemap(root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")) {
  assertTimezone();
  const posts = readPosts(root);
  const newest = latest(posts);
  const misc = [
    { loc: `${ORIGIN}/`, lastmod: newest, changefreq: "daily", priority: "1.0" },
    { loc: `${ORIGIN}/sitemap.html`, lastmod: newest, changefreq: "monthly", priority: "0.5" },
  ];
  const index = [
    { loc: `${ORIGIN}/sitemap-misc.xml`, lastmod: latest(misc) },
    { loc: `${ORIGIN}/post-sitemap.xml`, lastmod: newest },
    { loc: `${ORIGIN}/page-sitemap.xml`, lastmod: latest(pages) },
  ];
  const htmlIndex = index.map((entry) => ({
    ...entry,
    loc: entry.loc.replace(/\.xml$/, ".html"),
  }));

  const standard = `<p>This XML sitemap is used by search engines which follow the <a href="https://www.sitemaps.org/protocol.html">XML sitemap standard</a>.</p>`;
  const files = {
    "sitemap.xml": sitemapIndex(index),
    "sitemap-misc.xml": urlset(misc),
    "post-sitemap.xml": urlset(posts),
    "page-sitemap.xml": urlset(pages),
    "sitemap.html": htmlPage(
      "XML Sitemap Index",
      `${standard}<p>This file contains links to sub-sitemaps.</p>`,
      ["URL of sub-sitemap", "Last modified (GMT)"],
      htmlIndex.map((entry) => [link(entry.loc), entry.lastmod]),
    ),
    "sitemap-misc.html": htmlPage("XML Sitemap", standard, ["URL", "Priority", "Change frequency", "Last modified (GMT)"], urlRows(misc)),
    "post-sitemap.html": htmlPage("XML Sitemap", standard, ["URL", "Priority", "Change frequency", "Last modified (GMT)"], urlRows(posts)),
    "page-sitemap.html": htmlPage("XML Sitemap", standard, ["URL", "Priority", "Change frequency", "Last modified (GMT)"], urlRows(pages)),
  };

  const out = path.join(root, "public");
  for (const [name, body] of Object.entries(files)) writeFileSync(path.join(out, name), body);
  // /sitemap.xml.gz is the same index, served as XML. A file with that name would be
  // labeled application/gzip, so dev middleware and the Vercel route serve sitemap.xml instead.
  try {
    unlinkSync(path.join(out, "sitemap.xml.gz"));
  } catch {
    // already absent
  }
  return { posts: posts.length };
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  const result = generateSitemap();
  console.log(`sitemap: ${result.posts} posts`);
}
