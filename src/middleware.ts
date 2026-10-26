import { readFileSync } from "node:fs";
import { createMiddleware } from "@solidjs/start/middleware";
import { podcastResponse } from "./podcast/feed";
import { CACHE_CONTROL, legacyRedirect } from "./redirects/legacy";

const sitemapIndex = new URL("../public/sitemap.xml", import.meta.url);

export default createMiddleware({
  onRequest(event) {
    const url = new URL(event.request.url);
    if (url.pathname === "/sitemap.xml.gz" || url.pathname === "/sitemap.xml.gz/") {
      try {
        return new Response(readFileSync(sitemapIndex), {
          headers: {
            "Content-Type": "text/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      } catch {
        return new Response(null, { status: 404 });
      }
    }
    const feed = podcastResponse(url);
    if (feed) return feed;
    const hit = legacyRedirect(url);
    if (!hit) return;
    return new Response(null, {
      status: hit.status,
      headers: {
        Location: hit.location,
        "Cache-Control": CACHE_CONTROL,
      },
    });
  },
});
