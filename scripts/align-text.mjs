import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  compiles,
  copyUpload,
  decodeEntities,
  decodeWp,
  jsTemplate,
  loadSql,
  mdxDocument,
  plainText,
  prepareHtml,
} from "./import-posts.mjs";

const root = path.resolve(import.meta.dirname, "..");
const postsDir = path.join(root, "src/content/posts");
const sqlPath = path.resolve(root, "../tektok-unified/data/tektokco_dtbs3.sql");

function prose(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function signature(html) {
  const images = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi)].map((match) => match[1]).join("|");
  const frames = [...html.matchAll(/<iframe\b[^>]*\bsrc="([^"]+)"/gi)].map((match) => match[1]).join("|");
  return `${prose(html)}\n${images}\n${frames}`;
}

function localBody(source) {
  const body = source.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/)?.[1] ?? "";
  const inner = body.match(/innerHTML=\{`([\s\S]*)`\}\s*\/>\s*$/);
  if (!inner) return body.trim();
  return inner[1]
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\`/g, "`")
    .replace(/\\\$\{/g, "${")
    .replace(/\\\\/g, "\\");
}

function replaceBody(source, body) {
  return source.replace(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)[\s\S]*$/, `$1\n${body}\n`);
}

function authorKey(user) {
  const slug = decodeWp(user.nicename || user.login).toLowerCase();
  return slug.replace(/[^a-z0-9\-_\u0590-\u05ff]/g, "") || `user-${user.id}`;
}

function podcastArticle(html) {
  return html
    .replace(/<div class="pwp4-wrapper[\s\S]*?<\/div>/gi, "")
    .replace(/<div class="post--single__main">\s*<section class="post--single">\s*<section class="post__body">/gi, "")
    .replace(/<div class="post__content">/gi, "")
    .replace(/<\/div>\s*<\/section>\s*<\/section>\s*<\/div>/gi, "");
}

const data = loadSql(readFileSync(sqlPath, "utf8"), new Set(["post", "page", "podcast"]));
const freshHtml = (post) => prepareHtml(post.content, data.attachments, data.files);

const usersById = new Map(data.users.map((user) => [user.id, user]));
const usersByLogin = new Map(data.users.map((user) => [user.login, user]));
const usersByNice = new Map(data.users.map((user) => [decodeWp(user.nicename), user]));
const taxonomyById = new Map(data.taxonomies.map((item) => [item.id, item]));
const authorsByPost = new Map();
for (const link of data.relationships) {
  const taxonomy = taxonomyById.get(link.taxonomyId);
  if (!taxonomy || taxonomy.taxonomy !== "author") continue;
  const term = data.terms.get(taxonomy.termId);
  if (!term) continue;
  const list = authorsByPost.get(link.objectId) ?? [];
  list.push({ ...term, order: link.order });
  authorsByPost.set(link.objectId, list);
}

function authorsFor(post) {
  const terms = (authorsByPost.get(post.id) ?? []).sort((a, b) => a.order - b.order);
  const resolved = [];
  for (const term of terms) {
    const slug = decodeWp(term.slug);
    const login = slug.startsWith("cap-") ? slug.slice(4) : slug;
    const user = usersByLogin.get(login) ?? usersByNice.get(login) ?? usersByLogin.get(slug);
    if (user) resolved.push(authorKey(user));
  }
  if (!resolved.length && usersById.get(post.authorId)) resolved.push(authorKey(usersById.get(post.authorId)));
  return resolved;
}

let updated = 0;
let unchanged = 0;
const failures = [];
for (const post of data.posts.filter((item) => item.type === "post")) {
  const slug = decodeWp(post.slug);
  const full = path.join(postsDir, `${slug}.mdx`);
  const source = readFileSync(full, "utf8");
  const nextHtml = freshHtml(post);
  if (signature(localBody(source)) === signature(nextHtml)) {
    unchanged += 1;
    continue;
  }
  const rawDoc = replaceBody(source, nextHtml);
  const fallback = replaceBody(source, `<div innerHTML={${jsTemplate(nextHtml)}} />`);
  const next = (await compiles(rawDoc)) ? rawDoc : (await compiles(fallback)) ? fallback : "";
  if (!next) {
    failures.push(slug);
    continue;
  }
  writeFileSync(full, next, "utf8");
  updated += 1;
}

let added = 0;
for (const post of data.posts.filter((item) => item.type === "podcast")) {
  const slug = decodeWp(post.slug);
  const meta = data.postMeta.get(post.id) ?? {};
  const file = meta.thumbnailId ? data.files.get(meta.thumbnailId) : "";
  const image = (file && copyUpload(file)) || "/tektok-podcast-cover.jpg";
  const rating = Number(meta.rating);
  const record = {
    title: decodeEntities(post.title),
    date: String(post.date).replace(" ", "T"),
    excerpt: plainText(post.excerpt) || prose(podcastArticle(post.content)).slice(0, 240),
    image,
    authors: authorsFor(post),
    categories: [],
    comments: post.comments,
    disclosure: plainText(meta.disclosure ?? ""),
    rating: rating >= 1 && rating <= 5 ? rating : 0,
  };
  const html = freshHtml({ ...post, content: podcastArticle(post.content) });
  const rawDoc = mdxDocument(record, html || "<p></p>");
  const fallback = mdxDocument(record, `<div innerHTML={${jsTemplate(html)}} />`);
  const next = (await compiles(rawDoc)) ? rawDoc : (await compiles(fallback)) ? fallback : "";
  if (!next) {
    failures.push(slug);
    continue;
  }
  writeFileSync(path.join(postsDir, `${slug}.mdx`), next, "utf8");
  added += 1;
}

const pageFiles = {
  "about-us": { file: "src/routes/about-us.tsx", component: "About", title: "מי אנחנו" },
  "contact-us": { file: "src/routes/contact-us.tsx", component: "Contact", title: "Contact Us" },
  terms: { file: "src/routes/terms.tsx", component: "Terms", title: "תקנון" },
};
for (const [slug, page] of Object.entries(pageFiles)) {
  const stored = data.posts.find((item) => item.type === "page" && decodeWp(item.slug) === slug);
  const html = freshHtml(stored).replace(/mailto:([^"'\s>]+)/gi, (_, address) => {
    try {
      return `mailto:${decodeURIComponent(address)}`;
    } catch {
      return `mailto:${address}`;
    }
  });
  const source = `import { StaticPage } from "../components/StaticPage";

const html = ${JSON.stringify(html)};

export default function ${page.component}() {
  return (
    <StaticPage title=${JSON.stringify(page.title)}>
      <div class="prose" innerHTML={html} />
    </StaticPage>
  );
}
`;
  writeFileSync(path.join(root, page.file), source, "utf8");
}

console.log({ updated, unchanged, added, failures });
