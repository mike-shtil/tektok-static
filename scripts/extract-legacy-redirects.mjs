/**
 * Reads the Redirection plugin rows out of the WordPress dump and writes
 * src/redirects/rules.json plus vercel.json.
 *
 * Run: node scripts/extract-legacy-redirects.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dumpPath = path.resolve(root, "../tektok-unified/data/tektokco_dtbs3.sql");
const sql = readFileSync(dumpPath, "utf8");

const insertAt = sql.indexOf("INSERT INTO `pdfr2rx_redirection_items`");
if (insertAt < 0) throw new Error("pdfr2rx_redirection_items insert not found");
const valuesAt = sql.indexOf("VALUES\n", insertAt);
if (valuesAt < 0) throw new Error("redirect values not found");

const rows = [];
let i = valuesAt + "VALUES\n".length;
while (i < sql.length && sql[i] !== ";") {
  while (sql[i] === " " || sql[i] === "\n" || sql[i] === "\r" || sql[i] === ",") i++;
  if (sql[i] === ";") break;
  if (sql[i] !== "(") throw new Error(`expected row at ${i}: ${sql.slice(i, i + 40)}`);
  i++;
  const fields = [];
  while (sql[i] !== ")") {
    while (sql[i] === " " || sql[i] === "\n" || sql[i] === "\r") i++;
    if (sql.startsWith("NULL", i)) {
      fields.push(null);
      i += 4;
    } else if (sql[i] === "'") {
      let value = "";
      i++;
      while (i < sql.length) {
        if (sql[i] === "\\") {
          const next = sql[i + 1];
          const map = { n: "\n", r: "\r", t: "\t", "0": "\0", "\\": "\\", "'": "'", '"': '"' };
          value += map[next] ?? next;
          i += 2;
          continue;
        }
        if (sql[i] === "'") {
          if (sql[i + 1] === "'") {
            value += "'";
            i += 2;
            continue;
          }
          i++;
          break;
        }
        value += sql[i++];
      }
      fields.push(value);
    } else {
      const start = i;
      while (sql[i] !== "," && sql[i] !== ")") i++;
      fields.push(sql.slice(start, i).trim());
    }
    if (sql[i] === ",") i++;
  }
  i++;
  rows.push({
    id: Number(fields[0]),
    url: fields[1],
    regex: Number(fields[4]),
    position: Number(fields[5]),
    status: fields[9],
    actionType: fields[10],
    actionCode: Number(fields[11]),
    actionData: fields[12],
  });
}

function decodePercents(value) {
  if (!/%[0-9a-fA-F]{2}/.test(value)) return value;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function stripSlashes(pathName) {
  if (pathName === "/") return "/";
  return pathName.replace(/\/+$/, "");
}

function exactFrom(url) {
  // PHP's urldecode turns "+" into a space. rawurldecode does not.
  let value = decodePercents(url.replace(/\+/g, " "));
  const query = value.indexOf("?");
  if (query >= 0) value = value.slice(0, query);
  if (!value.startsWith("/")) value = `/${value}`;
  return stripSlashes(value);
}

function targetOf(actionData) {
  let target = actionData ?? "/";
  if (!/^https?:\/\//i.test(target)) {
    if (!target.startsWith("/")) target = `/${target}`;
    return target;
  }
  try {
    const parsed = new URL(target);
    if (parsed.hostname === "tektok.co.il" || parsed.hostname === "www.tektok.co.il") {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // keep the absolute target
  }
  return target;
}

const META = /[.*^${}()|[\]\\]/;

const enabled = rows
  .filter((row) => row.status === "enabled" && row.actionType === "url" && row.actionData)
  .sort((a, b) => a.position - b.position || a.id - b.id);

const rules = [];
const seenExact = new Set();
const skipped = [];

for (const row of enabled) {
  const status = [301, 302, 303, 307, 308].includes(row.actionCode) ? row.actionCode : 301;
  const to = targetOf(row.actionData);
  const decoded = decodePercents(row.url).replace(/\\\//g, "/");

  if (row.regex === 1 && decoded.includes("prefix_id")) {
    rules.push({ id: row.id, kind: "query", key: "prefix_id", to: stripSlashes(to) || "/", status });
    continue;
  }

  if (row.regex === 1 && META.test(decoded.replace(/\+/g, ""))) {
    let pattern = decoded;
    if (pattern.startsWith("/") && !pattern.startsWith("^")) pattern = `^${pattern}`;
    if (!pattern.endsWith("$")) pattern = `${pattern}$`;
    rules.push({ id: row.id, kind: "regex", pattern, to, status });
    continue;
  }

  const from = exactFrom(row.url);
  if (seenExact.has(from)) {
    skipped.push({ id: row.id, reason: "duplicate", from });
    continue;
  }
  if (!/^https?:\/\//i.test(to) && exactFrom(to) === from) {
    skipped.push({ id: row.id, reason: "self", from });
    continue;
  }
  seenExact.add(from);
  rules.push({ id: row.id, kind: "exact", from, to, status });
}

function matchPath(pathName) {
  for (const rule of rules) {
    if (rule.kind === "exact") {
      if (pathName === rule.from) return rule.to;
      continue;
    }
    if (rule.kind !== "regex") continue;
    const pattern = new RegExp(rule.pattern);
    if (pattern.test(pathName)) return pathName.replace(pattern, rule.to);
  }
  return undefined;
}

function follow(start) {
  let current = start;
  const seen = new Set();
  for (let hop = 0; hop < 8; hop++) {
    if (/^https?:\/\//i.test(current)) return current;
    const key = stripSlashes(current.split("?")[0]);
    if (seen.has(key)) return current;
    seen.add(key);
    const next = matchPath(key);
    if (!next) return current;
    const nextKey = /^https?:\/\//i.test(next) ? next : stripSlashes(next.split("?")[0]);
    if (nextKey === key) return current;
    current = next;
  }
  return current;
}

function withSlash(target) {
  if (/^https?:\/\//i.test(target) || target.includes("?") || target.endsWith("/")) return target;
  if (/\.[a-z0-9]+$/i.test(target)) return target;
  return `${target}/`;
}

for (const rule of rules) {
  if (rule.kind === "query") continue;
  if (!rule.to.includes("$")) rule.to = follow(rule.to);
  rule.to = withSlash(rule.to);
}

const rulesPath = path.join(root, "src/redirects/rules.json");
writeFileSync(rulesPath, `${JSON.stringify(rules, null, 2)}\n`);

const CACHE_CONTROL = "public, max-age=31536000, s-maxage=31536000, immutable";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function encodedVariants(from) {
  const segments = from.split("/");
  const lower = segments.map((segment) => encodeURIComponent(segment).replace(/%[0-9A-F]{2}/g, (hex) => hex.toLowerCase())).join("/");
  const upper = segments.map((segment) => encodeURIComponent(segment)).join("/");
  return [...new Set([lower, upper])].filter((variant) => variant !== from);
}

const routes = [];
const seenSrc = new Set();

function pushRoute(route) {
  if (seenSrc.has(route.src + JSON.stringify(route.has ?? null))) return;
  seenSrc.add(route.src + JSON.stringify(route.has ?? null));
  routes.push(route);
}

for (const rule of rules) {
  const headers = { Location: rule.to, "Cache-Control": CACHE_CONTROL };
  if (rule.kind === "query") {
    pushRoute({
      src: "^/.*$",
      has: [{ type: "query", key: rule.key }],
      status: rule.status,
      headers,
    });
    continue;
  }
  if (rule.kind === "regex") {
    pushRoute({ src: rule.pattern, status: rule.status, headers });
    continue;
  }
  for (const variant of [rule.from, ...encodedVariants(rule.from)]) {
    pushRoute({
      src: `^${escapeRegExp(variant)}/?$`,
      status: rule.status,
      headers: { Location: rule.to, "Cache-Control": CACHE_CONTROL },
    });
  }
}

const vercelPath = path.join(root, "vercel.json");
writeFileSync(
  vercelPath,
  `${JSON.stringify({ $schema: "https://openapi.vercel.sh/vercel.json", routes }, null, 2)}\n`,
);

console.log(`rows ${rows.length}, rules ${rules.length}, vercel routes ${routes.length}`);
console.log("skipped", skipped);
console.log(
  rules
    .map((rule) => {
      if (rule.kind === "exact") return `${rule.id} ${rule.from} -> ${rule.to}`;
      if (rule.kind === "regex") return `${rule.id} /${rule.pattern}/ -> ${rule.to}`;
      return `${rule.id} ?${rule.key} -> ${rule.to}`;
    })
    .join("\n"),
);
