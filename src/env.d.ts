import type { Seo } from "./seo/schema";

declare module "*.xml?raw" {
  const content: string;
  export default content;
}

declare module "*.mdx" {
  import type { Component } from "solid-js";
  export const frontmatter: {
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
  const Content: Component;
  export default Content;
}
