import { createMiddleware } from "@solidjs/start/middleware";
import { podcastResponse } from "./podcast/feed";
import { CACHE_CONTROL, legacyRedirect } from "./redirects/legacy";

export default createMiddleware({
  onRequest(event) {
    const url = new URL(event.request.url);
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
