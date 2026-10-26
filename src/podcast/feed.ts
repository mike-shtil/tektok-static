import feedSource from "../../public/podcast/feed.xml?raw";
import media from "./manifest.json" with { type: "json" };

const feedXml = media.reduce(
  (xml, item) =>
    xml.replace(
      new RegExp(`https://tektok\\.co\\.il/podlove/file/\\d+/s/feed/c/mp3/${item.file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
      item.enclosure,
    ),
  feedSource,
);

const FEED_TYPE = "application/rss+xml; charset=UTF-8";

export { feedXml };

export function podcastResponse(url: URL): Response | undefined {
  if (url.pathname === "/" && url.searchParams.get("feed") === "mp3") {
    return xml(feedXml);
  }
  if (url.pathname === "/feed/mp3/" || url.pathname === "/mp3/") {
    return xml(feedXml);
  }
  if (url.pathname === "/feed/mp3" || url.pathname === "/mp3") {
    return new Response(null, {
      status: 301,
      headers: {
        Location: "/feed/mp3/",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
  return undefined;
}

function xml(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": FEED_TYPE,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
