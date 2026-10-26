import { copyFileSync, existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compile } from "@mdx-js/mdx";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

const root = path.resolve(import.meta.dirname, "..");
const sqlPath = path.resolve(root, "../tektok-unified/data/tektokco_dtbs3.sql");
const uploadsRoot = path.resolve(root, "../wp-content/wp-content/uploads");
const postsDir = path.join(root, "src/content/posts");
const publicUploads = path.join(root, "public/media/uploads");

const wanted = new Set([
  "pdfr2rx_users",
  "pdfr2rx_usermeta",
  "pdfr2rx_posts",
  "pdfr2rx_postmeta",
  "pdfr2rx_terms",
  "pdfr2rx_term_taxonomy",
  "pdfr2rx_term_relationships",
]);

const metaKeys = new Set(["_thumbnail_id", "unbiased", "rating", "_wp_attached_file", "_wp_attachment_image_alt"]);

function readString(sql, i, quote) {
  let out = "";
  i += 1;
  while (i < sql.length) {
    const char = sql[i];
    if (char === "\\") {
      const next = sql[i + 1] ?? "";
      const map = { n: "\n", r: "\r", t: "\t", "0": "\0", Z: "\u001a", "'": "'", '"': '"', "\\": "\\" };
      out += map[next] ?? next;
      i += 2;
      continue;
    }
    if (char === quote) {
      if (sql[i + 1] === quote) {
        out += quote;
        i += 2;
        continue;
      }
      return [out, i + 1];
    }
    out += char;
    i += 1;
  }
  return [out, i];
}

function parseRows(sql, start, onRow) {
  let i = start;
  while (i < sql.length) {
    while (sql[i] === " " || sql[i] === "\n" || sql[i] === "\r" || sql[i] === "\t") i += 1;
    if (sql[i] === ";") return i + 1;
    if (sql[i] === ",") {
      i += 1;
      continue;
    }
    if (sql[i] !== "(") return i;
    i += 1;
    const row = [];
    while (i < sql.length) {
      while (sql[i] === " " || sql[i] === "\n" || sql[i] === "\r" || sql[i] === "\t") i += 1;
      if (sql[i] === ")") {
        i += 1;
        break;
      }
      if (sql[i] === ",") {
        i += 1;
        continue;
      }
      if (sql[i] === "'" || sql[i] === '"') {
        const [value, next] = readString(sql, i, sql[i]);
        row.push(value);
        i = next;
        continue;
      }
      let j = i;
      while (j < sql.length && sql[j] !== "," && sql[j] !== ")") j += 1;
      const raw = sql.slice(i, j).trim();
      row.push(raw === "NULL" ? null : raw);
      i = j;
    }
    onRow(row);
  }
  return i;
}

function skipStatement(sql, start) {
  let i = start;
  let quote = "";
  while (i < sql.length) {
    const char = sql[i];
    if (quote) {
      if (char === "\\") {
        i += 2;
        continue;
      }
      if (char === quote) {
        if (sql[i + 1] === quote) {
          i += 2;
          continue;
        }
        quote = "";
      }
      i += 1;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      i += 1;
      continue;
    }
    if (char === ";") return i + 1;
    i += 1;
  }
  return i;
}

export function loadSql(sql, types = new Set(["post"])) {
  const users = [];
  const userMeta = new Map();
  const posts = [];
  const attachments = new Map();
  const postMeta = new Map();
  const files = new Map();
  const terms = new Map();
  const taxonomies = [];
  const relationships = [];

  const needle = "INSERT INTO `";
  let i = 0;
  while (i < sql.length) {
    const at = sql.indexOf(needle, i);
    if (at < 0) break;
    const nameStart = at + needle.length;
    const nameEnd = sql.indexOf("`", nameStart);
    const table = sql.slice(nameStart, nameEnd);
    const valuesAt = sql.indexOf("VALUES", nameEnd);
    if (!wanted.has(table)) {
      i = skipStatement(sql, valuesAt + 6);
      continue;
    }
    i = parseRows(sql, valuesAt + 6, (row) => {
      if (table === "pdfr2rx_users" && row.length >= 10) {
        users.push({
          id: Number(row[0]),
          login: row[1],
          nicename: row[3],
          name: row[9],
        });
      } else if (table === "pdfr2rx_usermeta" && row.length >= 4) {
        const key = row[2];
        if (key === "description" || key === "first_name" || key.endsWith("user_avatar")) {
          const userId = Number(row[1]);
          const bag = userMeta.get(userId) ?? {};
          if (key === "description") bag.description = row[3] ?? "";
          else if (key === "first_name") bag.firstName = row[3] ?? "";
          else if (row[3]) bag.avatarId = Number(row[3]);
          userMeta.set(userId, bag);
        }
      } else if (table === "pdfr2rx_posts" && row.length >= 23) {
        const type = row[20];
        const status = row[7];
        if (type === "attachment") {
          const existing = attachments.get(Number(row[0])) ?? {};
          attachments.set(Number(row[0]), {
            ...existing,
            title: row[5] ?? "",
            caption: row[6] ?? "",
          });
        } else if (types.has(type) && status === "publish") {
          posts.push({
            id: Number(row[0]),
            authorId: Number(row[1]),
            date: row[2],
            content: row[4] ?? "",
            title: row[5] ?? "",
            excerpt: row[6] ?? "",
            slug: row[11] ?? "",
            comments: Number(row[22] ?? 0),
            type,
          });
        }
      } else if (table === "pdfr2rx_postmeta" && row.length >= 4 && metaKeys.has(row[2])) {
        const postId = Number(row[1]);
        const key = row[2];
        const value = row[3] ?? "";
        if (key === "_wp_attached_file") files.set(postId, value);
        else if (key === "_wp_attachment_image_alt") {
          const item = attachments.get(postId) ?? { title: "", caption: "" };
          item.alt = value;
          attachments.set(postId, item);
        } else {
          const bag = postMeta.get(postId) ?? {};
          if (key === "_thumbnail_id") bag.thumbnailId = Number(value);
          else if (key === "unbiased") bag.disclosure = value;
          else if (key === "rating") bag.rating = value;
          postMeta.set(postId, bag);
        }
      } else if (table === "pdfr2rx_terms" && row.length >= 3) {
        terms.set(Number(row[0]), { name: row[1], slug: row[2] });
      } else if (table === "pdfr2rx_term_taxonomy" && row.length >= 3) {
        const taxonomy = row[2];
        if (taxonomy === "category" || taxonomy === "author") {
          taxonomies.push({
            id: Number(row[0]),
            termId: Number(row[1]),
            taxonomy,
          });
        }
      } else if (table === "pdfr2rx_term_relationships" && row.length >= 2) {
        relationships.push({
          objectId: Number(row[0]),
          taxonomyId: Number(row[1]),
          order: Number(row[2] ?? 0),
        });
      }
    });
  }

  return { users, userMeta, posts, postMeta, files, terms, taxonomies, relationships, attachments };
}

export function decodeWp(value) {
  if (!value) return "";
  let current = value;
  for (let i = 0; i < 2; i += 1) {
    if (!/%[0-9a-fA-F]{2}/.test(current)) break;
    try {
      const next = decodeURIComponent(current);
      if (next === current) break;
      current = next;
    } catch {
      break;
    }
  }
  return current;
}

export function decodeEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export function plainText(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function stripShortcodes(value) {
  return value
    .replace(/\[youtube\][\s\S]*?\[\/youtube\]/gi, " ")
    .replace(/\[embed\][\s\S]*?\[\/embed\]/gi, " ")
    .replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/gi, " $1 ")
    .replace(/\[\/?[a-z0-9_:-]+[^\]]*\]/gi, " ");
}

function excerptFrom(post) {
  const manual = plainText(stripShortcodes(post.excerpt));
  if (manual) return manual;
  const text = plainText(stripShortcodes(post.content));
  const words = text.split(" ").filter(Boolean);
  if (words.length <= 55) return text;
  return `${words.slice(0, 55).join(" ")}…`;
}

function yaml(value) {
  return JSON.stringify(value);
}

const copied = new Map();

export function copyUpload(relative) {
  const clean = decodeURIComponent(relative.split("?")[0].split("#")[0]).replace(/^\/+/, "");
  if (!clean || !/\.(jpe?g|png|gif|webp|svg|avif)$/i.test(clean)) return null;
  if (copied.has(clean)) return copied.get(clean);
  const source = path.join(uploadsRoot, ...clean.split("/"));
  if (!existsSync(source)) {
    copied.set(clean, null);
    return null;
  }
  const dest = path.join(publicUploads, ...clean.split("/"));
  mkdirSync(path.dirname(dest), { recursive: true });
  if (!existsSync(dest)) copyFileSync(source, dest);
  const url = `/media/uploads/${clean}`;
  copied.set(clean, url);
  return url;
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

function rewriteLinks(html) {
  return html.replace(/https?:\/\/(?:www\.)?tektok\.co\.il\/(?!wp-content\/)([^"'\\\s]*)/gi, (_, rawPath) => {
    const target = rawPath.trim();
    if (!target || target.startsWith("wp-json") || target.startsWith("feed") || target.startsWith("xmlrpc")) {
      return `https://tektok.co.il/${target}`;
    }
    return `/${target}`;
  });
}

export function prepareHtml(html, attachments = new Map(), files = new Map()) {
  let next = html.replace(/\r\n/g, "\n").replace(/<!--[\s\S]*?-->/g, "");
  next = next.replace(/\[gallery([^\]]*)\]/gi, (_, attrs) => {
    const ids = attrs.match(/ids=["']([^"']+)["']/i)?.[1];
    if (!ids) return "";
    return ids
      .split(",")
      .map((raw) => {
        const id = Number(raw.trim());
        const file = files.get(id);
        const src = file ? copyUpload(file) : "";
        if (!src) return "";
        const item = attachments.get(id) ?? {};
        const alt = decodeEntities(item.alt || item.title || "").replace(/"/g, "&quot;");
        const caption = decodeEntities(item.caption || "").trim();
        return `<figure><img src="${src}" alt="${alt}" />${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
      })
      .filter(Boolean)
      .join("\n");
  });
  next = next.replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/gi, (_, inner) => {
    const image = inner.match(/<img\b[^>]*>/i)?.[0] ?? "";
    const caption = inner.replace(/<img\b[^>]*>/i, "").trim();
    return `<figure>${image}${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
  });
  next = next.replace(/\[embed\]([\s\S]*?)\[\/embed\]/gi, (_, url) => {
    const trimmed = url.trim();
    const youtube = trimmed.match(/(?:youtu\.be\/|v=)([\w-]{6,})/);
    if (youtube) {
      return `<iframe src="https://www.youtube.com/embed/${youtube[1]}" title="YouTube" allowfullscreen></iframe>`;
    }
    return `<p><a href="${trimmed}">${trimmed}</a></p>`;
  });
  next = next.replace(
    /\[youtube\]([\w-]{6,})\[\/youtube\]/gi,
    (_, id) => `<iframe src="https://www.youtube.com/embed/${id}" title="YouTube" allowfullscreen></iframe>`,
  );
  next = next.replace(/\[\/?[a-z0-9_:-]+[^\]]*\]/gi, "");
  next = next.replace(
    /(?<!["'=])https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?[^\s<]*v=|youtu\.be\/)([\w-]{6,})[^\s<]*/g,
    (_, id) => `<iframe src="https://www.youtube.com/embed/${id}" title="YouTube" allowfullscreen></iframe>`,
  );
  next = rewriteUploads(next);
  next = rewriteLinks(next);
  next = next.replace(/<(?![A-Za-z/!?])/g, "&lt;");
  next = next.replace(/[{]/g, "&#123;").replace(/[}]/g, "&#125;");
  next = next.replace(/([^<]+)(?=<|$)/g, (text) =>
    text
      .replace(/\.{3}/g, "…")
      .replace(/:-o\b/gi, "😮")
      .replace(/:-P\b/g, "😛")
      .replace(/:-D\b/g, "😃")
      .replace(/:-\)/g, "🙂")
      .replace(/;\-\)/g, "😉"),
  );
  return next.trim();
}

export function jsTemplate(html) {
  const escaped = html.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${").replace(/</g, "\\u003c");
  return "`" + escaped + "`";
}

export function mdxDocument(post, body) {
  const lines = [
    "---",
    `title: ${yaml(post.title)}`,
    `date: ${yaml(post.date)}`,
    `excerpt: ${yaml(post.excerpt)}`,
    `image: ${yaml(post.image)}`,
    ...(post.authors.length ? ["authors:", ...post.authors.map((slug) => `  - ${slug}`)] : ["authors: []"]),
    ...(post.categories.length
      ? ["categories:", ...post.categories.map((name) => `  - ${yaml(name)}`)]
      : ["categories: []"]),
  ];
  if (post.comments > 0) lines.push(`comments: ${post.comments}`);
  if (post.disclosure) lines.push(`disclosure: ${yaml(post.disclosure)}`);
  if (post.rating) lines.push(`rating: ${post.rating}`);
  lines.push("---", "", body, "");
  return lines.join("\n");
}

export async function compiles(source) {
  try {
    await compile(source, {
      jsx: true,
      jsxImportSource: "solid-js",
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
    });
    return true;
  } catch {
    return false;
  }
}

function authorKey(user) {
  const slug = decodeWp(user.nicename || user.login).toLowerCase();
  return slug.replace(/[^a-z0-9\-_\u0590-\u05ff]/g, "") || `user-${user.id}`;
}

const fallbackAvatars = [
  { test: /אור קורץ/, url: "/media/or-avatar.jpg" },
  { test: /אריאל/, url: "/media/ariel.jpg" },
];

function writeAuthors(records) {
  const lines = [
    "export type Author = {",
    "  slug: string;",
    "  name: string;",
    "  avatar?: string;",
    "  bio?: string;",
    "};",
    "",
    "/** Shared writer profiles. Post MDX files list these keys and do not copy the bio. */",
    "export const authors: Record<string, Author> = {",
  ];
  for (const author of records) {
    const fields = [`slug: ${JSON.stringify(author.slug)}`, `name: ${JSON.stringify(author.name)}`];
    if (author.avatar) fields.push(`avatar: ${JSON.stringify(author.avatar)}`);
    if (author.bio) fields.push(`bio: ${JSON.stringify(author.bio)}`);
    lines.push(`  ${JSON.stringify(author.slug)}: { ${fields.join(", ")} },`);
  }
  lines.push("};", "");
  writeFileSync(path.join(root, "src/content/authors.ts"), lines.join("\n"), "utf8");
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
const sql = await (await import("node:fs/promises")).readFile(sqlPath, "utf8");
console.log("parsing", sql.length);
const data = loadSql(sql);
console.log("published posts", data.posts.length, "users", data.users.length);

const usersById = new Map(data.users.map((user) => [user.id, user]));
const usersByLogin = new Map(data.users.map((user) => [user.login, user]));
const usersByNice = new Map(data.users.map((user) => [decodeWp(user.nicename), user]));

const taxonomyById = new Map(data.taxonomies.map((item) => [item.id, item]));
const categoriesByPost = new Map();
const authorsByPost = new Map();
for (const link of data.relationships) {
  const taxonomy = taxonomyById.get(link.taxonomyId);
  if (!taxonomy) continue;
  const term = data.terms.get(taxonomy.termId);
  if (!term) continue;
  if (taxonomy.taxonomy === "category") {
    const list = categoriesByPost.get(link.objectId) ?? [];
    list.push(decodeEntities(term.name));
    categoriesByPost.set(link.objectId, list);
  } else if (taxonomy.taxonomy === "author") {
    const list = authorsByPost.get(link.objectId) ?? [];
    list.push({ ...term, order: link.order });
    authorsByPost.set(link.objectId, list);
  }
}

function userFromCoauthor(term) {
  const slug = decodeWp(term.slug);
  const login = slug.startsWith("cap-") ? slug.slice(4) : slug;
  return usersByLogin.get(login) ?? usersByNice.get(login) ?? usersByLogin.get(slug) ?? null;
}

const usedAuthorIds = new Set();
const postsOut = [];

for (const post of data.posts) {
  const coauthors = (authorsByPost.get(post.id) ?? []).sort((a, b) => a.order - b.order);
  const resolved = [];
  for (const term of coauthors) {
    const user = userFromCoauthor(term);
    if (user) resolved.push(user);
  }
  if (!resolved.length && usersById.get(post.authorId)) resolved.push(usersById.get(post.authorId));
  for (const user of resolved) usedAuthorIds.add(user.id);

  const meta = data.postMeta.get(post.id) ?? {};
  const file = meta.thumbnailId ? data.files.get(meta.thumbnailId) : "";
  const image = file ? copyUpload(file) ?? `https://tektok.co.il/wp-content/uploads/${file}` : "/tektok-logo-light-lg.png";
  const rating = Number(meta.rating);
  const disclosure = plainText(meta.disclosure ?? "");
  const date = String(post.date).replace(" ", "T");
  const slug = decodeWp(post.slug) || `post-${post.id}`;
  postsOut.push({
    id: post.id,
    slug,
    title: decodeEntities(post.title),
    date,
    excerpt: excerptFrom(post),
    image,
    authors: resolved.map(authorKey),
    categories: categoriesByPost.get(post.id) ?? ["כללי"],
    comments: post.comments,
    disclosure,
    rating: rating >= 1 && rating <= 5 ? rating : 0,
    html: prepareHtml(post.content, data.attachments, data.files),
  });
}

const seen = new Map();
for (const post of postsOut) {
  const count = seen.get(post.slug) ?? 0;
  seen.set(post.slug, count + 1);
  if (count > 0) post.slug = `${post.slug}-${count + 1}`;
}

const authorRecords = [];
for (const user of data.users) {
  if (!usedAuthorIds.has(user.id)) continue;
  const meta = data.userMeta.get(user.id) ?? {};
  const file = meta.avatarId ? data.files.get(meta.avatarId) : "";
  let avatar = file ? copyUpload(file) ?? `https://tektok.co.il/wp-content/uploads/${file}` : "";
  if (!avatar) {
    const fallback = fallbackAvatars.find((item) => item.test.test(user.name));
    if (fallback) avatar = fallback.url;
  }
  const bio = plainText(meta.description ?? "");
  authorRecords.push({
    slug: authorKey(user),
    name: decodeEntities(user.name || meta.firstName || user.login),
    avatar,
    bio,
  });
}
authorRecords.sort((a, b) => a.slug.localeCompare(b.slug));
writeAuthors(authorRecords);

mkdirSync(postsDir, { recursive: true });
for (const file of readdirSync(postsDir)) {
  if (file.endsWith(".mdx")) unlinkSync(path.join(postsDir, file));
}

let raw = 0;
let fallback = 0;
const failures = [];
for (const post of postsOut) {
  const rawDoc = mdxDocument(post, post.html || "<p></p>");
  if (await compiles(rawDoc)) {
    writeFileSync(path.join(postsDir, `${post.slug}.mdx`), rawDoc, "utf8");
    raw += 1;
    continue;
  }
  const fallbackDoc = mdxDocument(post, `<div innerHTML={${jsTemplate(post.html)}} />`);
  if (await compiles(fallbackDoc)) {
    writeFileSync(path.join(postsDir, `${post.slug}.mdx`), fallbackDoc, "utf8");
    fallback += 1;
    continue;
  }
  failures.push(post.slug);
}

console.log({
  posts: postsOut.length,
  authors: authorRecords.length,
  images: [...copied.values()].filter(Boolean).length,
  raw,
  fallback,
  failures,
});
console.log(authorRecords.map((author) => `${author.slug} | ${author.name} | ${author.bio ? "bio" : "no-bio"} | ${author.avatar || "no-avatar"}`).join("\n"));
}
