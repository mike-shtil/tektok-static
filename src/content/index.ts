import type { Component } from "solid-js";
import type { Seo } from "../seo/schema";
import { authors, type Author } from "./authors";

export type { Author };

export type Category = {
  slug: string;
  title: string;
  id: number;
  /** Menu underline. Chip fill uses the same hue at 90% opacity. */
  color: string;
  /** Theme paints a chip only for categories that have a `.category-{id}` rule. */
  chip: boolean;
  menu: boolean;
};

// Slugs are the decoded WordPress term slugs. The live site prints them in
// links as lowercase percent-encoding (`/category/%d7%92.../`), and גאדג'טים
// is stored without the apostrophe.
export const categories: Category[] = [
  { slug: "מובייל", title: "מובייל", id: 3, color: "#0ebdff", chip: true, menu: true },
  { slug: "גיימינג", title: "גיימינג", id: 61, color: "#ffa620", chip: true, menu: true },
  { slug: "גאדגטים", title: "גאדג'טים", id: 58, color: "#a968ff", chip: true, menu: true },
  { slug: "ביקורות", title: "ביקורות", id: 19, color: "#83ff26", chip: true, menu: true },
  { slug: "מגזין", title: "מגזין", id: 8, color: "#f13952", chip: true, menu: true },
  { slug: "כללי", title: "כללי", id: 1, color: "#ffffff", chip: false, menu: false },
];

const slugAliases: Record<string, string> = {
  "גאדג'טים": "גאדגטים",
};

/** Route param or href segment, decoded the way the live permalinks resolve. */
export function routeSlug(value: string): string {
  if (!value) return "";
  let current = value.replace(/\/+$/, "");
  for (let i = 0; i < 2; i++) {
    if (!/%[0-9a-fA-F]{2}/.test(current)) break;
    try {
      const next = decodeURIComponent(current);
      if (next === current) break;
      current = next;
    } catch {
      break;
    }
  }
  return slugAliases[current] ?? current;
}

/** WordPress `utf8_uri_encode` form: UTF-8 percent-encoding with lowercase hex. */
export function wpSegment(slug: string): string {
  return encodeURIComponent(slug).replace(/%[0-9A-F]{2}/g, (hex) => hex.toLowerCase());
}

export function categoryHref(slug: string): string {
  return `/category/${wpSegment(routeSlug(slug))}/`;
}

export const POSTS_PER_PAGE = 12;

export function homePageHref(page: number): string {
  return page <= 1 ? "/" : `/page/${page}/`;
}

export function categoryPageHref(slug: string, page: number): string {
  const base = categoryHref(slug);
  return page <= 1 ? base : `${base}page/${page}/`;
}

/** Positive integer page param. Anything else is not a page. */
export function parsePage(value: string | undefined): number | undefined {
  if (!value || !/^[1-9]\d*$/.test(value)) return undefined;
  const page = Number(value);
  return Number.isSafeInteger(page) ? page : undefined;
}

export function postHref(slug: string): string {
  return `/${wpSegment(slug)}/`;
}

export function categoryFromParam(param: string): Category | undefined {
  const slug = routeSlug(param);
  return categories.find((category) => category.slug === slug || category.title === slug);
}

export type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  authors: Author[];
  categories: Category[];
  comments: number;
  /** ACF `unbiased` — גילוי נאות. Empty on the live site means the block is hidden. */
  disclosure?: string;
  /** ACF `rating`, 1–5. Empty means the scale is hidden. */
  rating?: number;
  /** Yoast head copied from the live post. Required for the MDX file to parse. */
  seo?: Seo;
  Content: Component;
};

const modules = import.meta.glob<{
  default: Component;
  frontmatter: {
    title: string;
    date: string;
    excerpt: string;
    image: string;
    authors: string[];
    categories: string[];
    comments?: number;
    disclosure?: string;
    rating?: number;
    seo?: Seo;
  };
}>("./posts/*.mdx", { eager: true });

function resolveAuthor(slug: string): Author {
  return authors[slug] ?? { slug, name: slug };
}

function categoryBySlug(value: string): Category {
  return (
    categoryFromParam(value) ?? {
      slug: routeSlug(value),
      title: value,
      id: 0,
      color: "#ffffff",
      chip: false,
      menu: false,
    }
  );
}

export function listPosts(): Post[] {
  return Object.entries(modules)
    .map(([path, mod]) => {
      const slug = path.split("/").pop()!.replace(/\.mdx$/, "");
      return {
        slug,
        title: mod.frontmatter.title,
        date: mod.frontmatter.date,
        excerpt: mod.frontmatter.excerpt,
        image: mod.frontmatter.image,
        authors: (mod.frontmatter.authors ?? []).map(resolveAuthor),
        categories: (mod.frontmatter.categories ?? []).map(categoryBySlug),
        comments: mod.frontmatter.comments ?? 0,
        disclosure: mod.frontmatter.disclosure,
        rating: mod.frontmatter.rating,
        seo: mod.frontmatter.seo,
        Content: mod.default,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | undefined {
  return listPosts().find((post) => post.slug === slug);
}

export function postsInCategory(slug: string): Post[] {
  const canonical = routeSlug(slug);
  return listPosts().filter((post) => post.categories.some((category) => category.slug === canonical));
}

const months = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

export function formatPostDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate()} ב${months[date.getMonth()]} ${date.getFullYear()}`;
}
