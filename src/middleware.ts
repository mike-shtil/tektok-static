import { createMiddleware } from "@solidjs/start/middleware";
import { CACHE_CONTROL, legacyRedirect } from "./redirects/legacy";

export default createMiddleware({
  onRequest(event) {
    const hit = legacyRedirect(new URL(event.request.url));
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
