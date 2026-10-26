import type { Seo } from "./schema";

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://tektok.co.il/",
      url: "https://tektok.co.il/",
      name: "TekTok - טכנולוגיה גיימינג תרבות",
      isPartOf: { "@id": "https://tektok.co.il/#website" },
      description: "טכנולוגיה גיימינג תרבות",
      breadcrumb: { "@id": "https://tektok.co.il/#breadcrumb" },
      inLanguage: "he-IL",
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://tektok.co.il/#breadcrumb",
      itemListElement: [{ "@type": "ListItem", position: 1, name: "Home" }],
    },
    {
      "@type": "WebSite",
      "@id": "https://tektok.co.il/#website",
      url: "https://tektok.co.il/",
      name: "TekTok",
      description: "טכנולוגיה גיימינג תרבות",
      potentialAction: [
        {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://tektok.co.il/?s={search_term_string}",
          },
          "query-input": {
            "@type": "PropertyValueSpecification",
            valueRequired: true,
            valueName: "search_term_string",
          },
        },
      ],
      inLanguage: "he-IL",
    },
  ],
} satisfies Seo["schema"];

/** Live Yoast head for https://tektok.co.il/ */
export const homeSeo: Seo = {
  title: "TekTok - טכנולוגיה גיימינג תרבות",
  description: "טכנולוגיה גיימינג תרבות",
  canonical: "https://tektok.co.il/",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  next: "https://tektok.co.il/page/2/",
  og: {
    locale: "he_IL",
    type: "website",
    title: "TekTok",
    description: "טכנולוגיה גיימינג תרבות",
    url: "https://tektok.co.il/",
    site_name: "TekTok",
  },
  twitter: { card: "summary_large_image" },
  schema,
};
