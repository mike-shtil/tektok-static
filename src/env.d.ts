declare module "*.mdx" {
  import type { Component } from "solid-js";
  export const frontmatter: {
    title: string;
    date: string;
    excerpt: string;
    image: string;
    authors: { name: string; avatar?: string }[];
    categories: string[];
    comments?: number;
  };
  const Content: Component;
  export default Content;
}
