import feedXml from "../../public/podcast/feed.xml?raw";
import media from "./manifest.json" with { type: "json" };

const months = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

export type Episode = {
  title: string;
  href: string;
  dateLabel: string;
  subtitle: string;
  duration: string;
  image: string;
  bytes: number;
  file: string;
  audio: string;
  guid: string;
};

function decode(value: string): string {
  let text = value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  for (let pass = 0; pass < 2; pass++) {
    text = text
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#8211;/g, "–")
      .replace(/&#8217;/g, "’")
      .replace(/&#039;|&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  }
  return text.trim();
}

function tag(block: string, name: string): string {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  return match ? decode(match[1]) : "";
}

function dateLabel(rfc822: string): string {
  const date = new Date(rfc822);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  const month = months[Number(get("month")) - 1] ?? "";
  return `${get("day")} ב${month} ${get("year")} ${get("hour")}:${get("minute")}`;
}

function durationLabel(value: string): string {
  const match = value.match(/^(\d+):(\d{2}):(\d{2})/);
  if (!match) return value;
  return `${Number(match[1])}:${match[2]}:${match[3]}`;
}

function localImage(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

const mediaByFile = new Map(media.map((item) => [item.file, item]));

export const episodes: Episode[] = [...feedXml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => {
  const block = match[1];
  const enclosure = block.match(/<enclosure url="([^"]+)" length="(\d+)"/);
  const image = block.match(/<itunes:image href="([^"]+)"/);
  const fileUrl = enclosure?.[1] ?? "";
  const file = fileUrl.split("/").pop() ?? "";
  const stored = mediaByFile.get(file);
  return {
    title: tag(block, "title"),
    href: new URL(tag(block, "link")).pathname.replace(/\/?$/, "/"),
    dateLabel: dateLabel(tag(block, "pubDate")),
    subtitle: tag(block, "itunes:subtitle"),
    duration: durationLabel(tag(block, "itunes:duration")),
    image: image ? localImage(image[1]) : "/tektok-podcast-cover.jpg",
    bytes: stored?.bytes ?? Number(enclosure?.[2] ?? 0),
    file,
    audio: stored?.enclosure ?? fileUrl,
    guid: tag(block, "guid"),
  };
});
