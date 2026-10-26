import { parse } from "yaml";
import { seoProblems } from "../seo/schema";

type YamlNode = { type: string; value?: string };
type SeoFile = { path?: string; fail: (reason: string) => void };

function fileName(file: SeoFile): string {
  return String(file.path ?? "").replaceAll("\\", "/").split("/").pop() ?? "post";
}

/** Every post MDX file must include a complete Yoast `seo` block. */
export function requireSeo() {
  return (tree: { children: YamlNode[] }, file: SeoFile) => {
    const name = fileName(file);
    const yaml = tree.children.find((node) => node.type === "yaml");
    if (!yaml?.value) {
      file.fail(`${name}: seo frontmatter is required for this document to parse`);
      return;
    }
    const data = parse(yaml.value) as Record<string, unknown> | null;
    const missing = seoProblems(data?.seo);
    if (missing.length) file.fail(`${name}: ${missing.join(", ")} required for this document to parse`);
  };
}
