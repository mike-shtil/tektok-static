import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { copyUpload, decodeEntities, decodeWp, loadSql } from "./import-posts.mjs";

const root = path.resolve(import.meta.dirname, "..");
const sqlPath = path.resolve(root, "../tektok-unified/data/tektokco_dtbs3.sql");
const postsDir = path.join(root, "src/content/posts");
const outPath = path.join(root, "src/content/comments.json");

const allowed = new Set(["br", "a", "img", "b", "strong", "i", "em", "ul", "ol", "li", "blockquote", "p"]);

function attr(raw, name) {
  const match = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'=<>]+))`, "i").exec(raw);
  return match ? decodeEntities(match[2] ?? match[3] ?? match[4] ?? "") : "";
}

function escapeText(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return escapeText(value).replace(/"/g, "&quot;");
}

function safeUrl(value) {
  if (!value) return "";
  const url = value.trim();
  if (url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\")) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.href;
  } catch {
    return "";
  }
  return "";
}

function emojify(value) {
  return value
    .replace(/:lol:/gi, "😂")
    .replace(/:cry:/gi, "😢")
    .replace(/:mad:/gi, "😠")
    .replace(/:-o\b/gi, "😮")
    .replace(/:-P\b/g, "😛")
    .replace(/:-D\b/g, "😃")
    .replace(/:-\)/g, "🙂")
    .replace(/;\-\)/g, "😉")
    .replace(/:-\(/g, "🙁")
    .replace(/(^|\s);\)/g, "$1😉")
    .replace(/(^|\s):D\b/g, "$1😃")
    .replace(/(^|\s):\)/g, "$1🙂")
    .replace(/(^|\s):\(/g, "$1🙁")
    .replace(/(^|\s):P\b/g, "$1😛");
}

function rewriteUploads(html) {
  return html.replace(
    /(?:https?:)?\/\/(?:www\.)?tektok\.co\.il\/wp-content\/uploads\/([^"'\\\s>]+)|(?:https?:)?\/\/localhost\/tektok\/wp-content\/uploads\/([^"'\\\s>]+)|(?:^|["'(=\s])\/wp-content\/uploads\/([^"'\\\s>]+)/gi,
    (match, absolute, localhost, relative) => {
      const file = absolute || localhost || relative;
      const local = copyUpload(file);
      if (!local) return match;
      if (absolute || localhost) return local;
      return match.replace(/\/wp-content\/uploads\/[^"'\\\s>]+/, local);
    },
  );
}

function sanitize(html) {
  let source = decodeEntities(html).replace(/\r\n/g, "\n").replace(/<!--[\s\S]*?-->/g, "");
  source = source.replace(/\[USER=\d+\]([\s\S]*?)\[\/USER\]/gi, "$1");
  source = source.replace(/\[quote(?:=[^\]]*)?\]/gi, "<blockquote>");
  source = source.replace(/\[\/quote\]/gi, "</blockquote>");
  source = source.replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, '<a href="$1">$2</a>');
  source = source.replace(/\[url\]([\s\S]*?)\[\/url\]/gi, '<a href="$1">$1</a>');
  source = source.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, "<strong>$1</strong>");
  source = source.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, "<em>$1</em>");
  source = source.replace(/\[img\]([\s\S]*?)\[\/img\]/gi, '<img src="$1" alt="">');
  source = source.replace(/\[\/?[a-z0-9_:-]+[^\]]*\]/gi, "");
  source = source.replace(/[:;]?(<img\b[^>]*src=["']smileys\/[^"']+["'][^>]*>)/gi, (_, tag) => {
    const alt = attr(tag, "alt") || attr(tag, "title");
    return escapeText(emojify(alt));
  });
  source = rewriteUploads(source);
  source = source.replace(/(?:<br\s*\/?\s*>|\n|\s)*Posted from my mobile\s*$/i, "");

  const re = /<\/?([a-zA-Z][\w:-]*)\b([^>]*)>/g;
  let out = "";
  let last = 0;
  const stack = [];
  for (const match of source.matchAll(re)) {
    out += emojify(escapeText(source.slice(last, match.index)));
    last = match.index + match[0].length;
    const tag = match[1].toLowerCase();
    const closing = match[0].startsWith("</");
    if (!allowed.has(tag)) continue;
    if (closing) {
      const index = stack.lastIndexOf(tag);
      if (index >= 0) {
        while (stack.length > index) out += `</${stack.pop()}>`;
      }
      continue;
    }
    if (tag === "br") {
      out += "<br>";
      continue;
    }
    if (tag === "img") {
      const src = safeUrl(attr(match[2], "src"));
      if (!src || /smileys\//i.test(src)) continue;
      const alt = escapeAttr(emojify(attr(match[2], "alt")));
      out += `<img src="${escapeAttr(src)}" alt="${alt}">`;
      continue;
    }
    if (tag === "a") {
      const href = safeUrl(attr(match[2], "href"));
      if (!href) continue;
      out += `<a href="${escapeAttr(href)}" rel="nofollow noopener">`;
      stack.push("a");
      continue;
    }
    out += `<${tag}>`;
    stack.push(tag);
  }
  out += emojify(escapeText(source.slice(last)));
  while (stack.length) out += `</${stack.pop()}>`;
  return out
    .replace(/(?:<br>){3,}/g, "<br><br>")
    .replace(/^(?:<br>)+|(?:<br>)+$/g, "")
    .trim();
}

function plainAuthor(value) {
  const name = decodeEntities(value)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return name || "אורח";
}

const sql = readFileSync(sqlPath, "utf8");
console.log("parsing", sql.length);
const data = loadSql(sql, new Set(["post", "page", "podcast"]), { comments: true });

const files = new Set(
  readdirSync(postsDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.slice(0, -4)),
);

const seen = new Map();
const slugById = new Map();
for (const post of data.posts) {
  let slug = decodeWp(post.slug) || `post-${post.id}`;
  const count = seen.get(slug) ?? 0;
  seen.set(slug, count + 1);
  if (count > 0) slug = `${slug}-${count + 1}`;
  if (files.has(slug)) slugById.set(post.id, slug);
}

// A published comment is comment_approved = "1". Pending is "0"; spam and trash use those words.
const approved = data.comments.filter(
  (comment) => comment.approved === "1" && (comment.type === "comment" || comment.type === ""),
);

const bySlug = new Map();
let unmatched = 0;
const unmatchedPosts = new Map();
for (const comment of approved) {
  const slug = slugById.get(comment.postId);
  if (!slug) {
    unmatched += 1;
    unmatchedPosts.set(comment.postId, (unmatchedPosts.get(comment.postId) ?? 0) + 1);
    continue;
  }
  const html = sanitize(comment.html);
  if (!html) continue;
  const list = bySlug.get(slug) ?? [];
  list.push({
    id: comment.id,
    parent: comment.parent,
    author: plainAuthor(comment.author),
    date: String(comment.date).replace(" ", "T"),
    html,
  });
  bySlug.set(slug, list);
}

function nest(list) {
  const byId = new Map(list.map((comment) => [comment.id, { ...comment, replies: [] }]));
  const roots = [];
  for (const comment of byId.values()) {
    const parent = comment.parent ? byId.get(comment.parent) : undefined;
    if (parent && parent.id !== comment.id) parent.replies.push(comment);
    else roots.push(comment);
  }
  const sort = (items) => {
    items.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id - b.id));
    for (const item of items) sort(item.replies);
  };
  sort(roots);
  const strip = (items) =>
    items.map(({ id, author, date, html, replies }) => ({
      id,
      author,
      date,
      html,
      replies: strip(replies),
    }));
  return strip(roots);
}

const output = {};
for (const slug of [...bySlug.keys()].sort()) output[slug] = nest(bySlug.get(slug));

writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

const shown = Object.values(output).reduce((sum, list) => {
  const walk = (items) => items.reduce((n, item) => n + 1 + walk(item.replies), 0);
  return sum + walk(list);
}, 0);

console.log({
  comments: data.comments.length,
  approved: approved.length,
  shown,
  posts: Object.keys(output).length,
  unmatched,
  unmatchedPosts: [...unmatchedPosts.entries()].slice(0, 12),
});

const sample = output["amazon-fire-phone"];
if (sample) console.log(JSON.stringify(sample[0], null, 2).slice(0, 800));
const risky = JSON.stringify(output).match(/<script|javascript:|onerror=/i);
if (risky) {
  console.error("sanitizer leaked", risky[0]);
  process.exitCode = 1;
}
