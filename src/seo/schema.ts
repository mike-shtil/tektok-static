export type SeoImage = {
  url: string;
  width?: number;
  height?: number;
  type?: string;
};

export type Seo = {
  title: string;
  /** Empty string when Yoast omits the description tag. The key itself is required. */
  description: string;
  canonical: string;
  robots: string;
  prev?: string;
  next?: string;
  og: {
    locale: string;
    type: string;
    title: string;
    description: string;
    url: string;
    site_name: string;
    image?: SeoImage;
  };
  article?: {
    publisher?: string;
    published_time?: string;
    modified_time?: string;
    author?: string;
  };
  author?: string;
  twitter: {
    card: string;
    creator?: string;
    labels?: { label: string; data: string }[];
  };
  schema: {
    "@context": string;
    "@graph": unknown[];
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function needString(record: Record<string, unknown>, key: string, missing: string[], prefix: string, allowEmpty = false) {
  const value = record[key];
  if (typeof value !== "string" || (!allowEmpty && value.trim() === "")) missing.push(`${prefix}${key}`);
}

/** Names of `seo` fields that must be present for an MDX document to parse. */
export function seoProblems(seo: unknown): string[] {
  if (!isRecord(seo)) return ["seo"];
  const missing: string[] = [];
  needString(seo, "title", missing, "seo.");
  needString(seo, "description", missing, "seo.", true);
  needString(seo, "canonical", missing, "seo.", true);
  needString(seo, "robots", missing, "seo.");
  for (const key of ["prev", "next", "author"] as const) {
    if (key in seo && (typeof seo[key] !== "string" || seo[key].trim() === "")) missing.push(`seo.${key}`);
  }

  if (!isRecord(seo.og)) missing.push("seo.og");
  else {
    needString(seo.og, "locale", missing, "seo.og.");
    needString(seo.og, "type", missing, "seo.og.");
    needString(seo.og, "title", missing, "seo.og.");
    needString(seo.og, "description", missing, "seo.og.", true);
    needString(seo.og, "url", missing, "seo.og.");
    needString(seo.og, "site_name", missing, "seo.og.");
    if ("image" in seo.og) {
      if (!isRecord(seo.og.image)) missing.push("seo.og.image");
      else {
        needString(seo.og.image, "url", missing, "seo.og.image.");
        if ("width" in seo.og.image && typeof seo.og.image.width !== "number") missing.push("seo.og.image.width");
        if ("height" in seo.og.image && typeof seo.og.image.height !== "number") missing.push("seo.og.image.height");
        if ("type" in seo.og.image && typeof seo.og.image.type !== "string") missing.push("seo.og.image.type");
      }
    }
  }

  if ("article" in seo) {
    if (!isRecord(seo.article)) missing.push("seo.article");
    else {
      for (const key of ["publisher", "published_time", "modified_time", "author"] as const) {
        if (key in seo.article && (typeof seo.article[key] !== "string" || String(seo.article[key]).trim() === "")) {
          missing.push(`seo.article.${key}`);
        }
      }
    }
  }

  if (!isRecord(seo.twitter)) missing.push("seo.twitter");
  else {
    needString(seo.twitter, "card", missing, "seo.twitter.");
    if ("creator" in seo.twitter && (typeof seo.twitter.creator !== "string" || seo.twitter.creator.trim() === "")) {
      missing.push("seo.twitter.creator");
    }
    if ("labels" in seo.twitter) {
      if (!Array.isArray(seo.twitter.labels)) missing.push("seo.twitter.labels");
      else {
        seo.twitter.labels.forEach((item, index) => {
          if (!isRecord(item)) {
            missing.push(`seo.twitter.labels.${index}`);
            return;
          }
          needString(item, "label", missing, `seo.twitter.labels.${index}.`);
          needString(item, "data", missing, `seo.twitter.labels.${index}.`);
        });
      }
    }
  }

  if (!isRecord(seo.schema)) missing.push("seo.schema");
  else {
    needString(seo.schema, "@context", missing, "seo.schema.");
    if (!Array.isArray(seo.schema["@graph"]) || seo.schema["@graph"].length === 0) missing.push("seo.schema.@graph");
  }

  return missing;
}
