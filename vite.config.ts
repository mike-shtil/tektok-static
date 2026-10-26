import { readFile } from "node:fs/promises";
import path from "node:path";
import { compile } from "@mdx-js/mdx";
import { solidStart } from "@solidjs/start/config";
import { nitro } from "nitro/vite";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig, type Plugin } from "vite";
import { generateSitemap } from "./scripts/sitemap.mjs";
import { requireSeo } from "./src/mdx/require-seo";
import { spotifyEmbed } from "./src/mdx/spotify-embed";

function mdxFile(source: string, importer?: string): string | null {
  const file = source.split("?")[0].replace(/^\/@fs\//, "");
  if (!file.endsWith(".mdx")) return null;
  if (/^[A-Za-z]:[\\/]/.test(file)) return file;
  if (!importer) return path.resolve(file);
  const from = importer.split("?")[0].replace(/^\/@fs\//, "");
  return path.resolve(path.dirname(from), file);
}

function solidMdx(): Plugin {
  return {
    name: "tektok-mdx",
    enforce: "pre",
    resolveId(id, importer) {
      const file = mdxFile(id, importer);
      if (!file) return null;
      const query = id.includes("?") ? id.slice(id.indexOf("?")) : "";
      return `${file}.tsx${query}`;
    },
    async load(id) {
      const file = id.split("?", 1)[0];
      if (!file.endsWith(".mdx.tsx")) return null;
      const sourcePath = file.slice(0, -4);
      this.addWatchFile(sourcePath);
      const source = await readFile(sourcePath, "utf8");
      const compiled = await compile(
        { path: sourcePath, value: source },
        {
          jsx: true,
          jsxImportSource: "solid-js",
          remarkPlugins: [remarkFrontmatter, requireSeo, remarkMdxFrontmatter],
          rehypePlugins: [spotifyEmbed],
        },
      );
      // MDX emits <_components.p>, which Solid SSR treats as a component call.
      // Intrinsic tags have to be literal elements for the Solid compiler.
      const code = String(compiled.value).replace(/<(\/?)_components\.([A-Za-z][\w-]*)/g, "<$1$2");
      return code;
    },
  };
}

function tektokSitemap(): Plugin {
  const run = () => {
    generateSitemap();
  };
  return {
    name: "tektok-sitemap",
    config() {
      run();
    },
    watchChange(id) {
      const file = id.replaceAll("\\", "/");
      if (file.includes("/content/posts/") && file.endsWith(".mdx")) run();
    },
  };
}

export default defineConfig({
  plugins: [tektokSitemap(), solidMdx(), solidStart({ middleware: path.resolve("src/middleware.ts") }), nitro()],
  nitro: {
    preset: "static",
    prerender: {
      crawlLinks: true,
      failOnError: true,
    },
  },
});
