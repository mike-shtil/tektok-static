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

// podcasts.tektok.co.il does not serve these files. The live site still does, via Podlove.
const playback: Record<string, string> = {
  "23_PlayStation_5.mp3": "https://tektok.co.il/podlove/file/133/s/feed/c/mp3/23_PlayStation_5.mp3",
  "24_the_gaming_channel_launch.mp3":
    "https://tektok.co.il/podlove/file/128/s/feed/c/mp3/24_the_gaming_channel_launch.mp3",
  "22_windows_11.mp3": "https://tektok.co.il/podlove/file/123/s/feed/c/mp3/22_windows_11.mp3",
  "21_corona_days.mp3": "https://tektok.co.il/podlove/file/119/s/feed/c/mp3/21_corona_days.mp3",
  "20_digital_diet.mp3": "https://tektok.co.il/podlove/file/115/s/feed/c/mp3/20_digital_diet.mp3",
  "19_twitch_streaming_FiendRiver_interview.mp3":
    "https://tektok.co.il/podlove/file/107/s/feed/c/mp3/19_twitch_streaming_FiendRiver_interview.mp3",
  "18_future_mobility_interview.mp3":
    "https://tektok.co.il/podlove/file/103/s/feed/c/mp3/18_future_mobility_interview.mp3",
  "17_the_state_of_personal_transportation.mp3":
    "https://tektok.co.il/podlove/file/99/s/feed/c/mp3/17_the_state_of_personal_transportation.mp3",
  "16_alon_karmi_brings_the_mustache_back.mp3":
    "https://tektok.co.il/podlove/file/92/s/feed/c/mp3/16_alon_karmi_brings_the_mustache_back.mp3",
  "15_the_galaxy_fold_and_folding_phone_screens.mp3":
    "https://tektok.co.il/podlove/file/83/s/feed/c/mp3/15_the_galaxy_fold_and_folding_phone_screens.mp3",
  "14_google_stadia_cloud_gaming.mp3":
    "https://tektok.co.il/podlove/file/81/s/feed/c/mp3/14_google_stadia_cloud_gaming.mp3",
  "13_when_facebook_goes_down.mp3":
    "https://tektok.co.il/podlove/file/78/s/feed/c/mp3/13_when_facebook_goes_down.mp3",
  "12_buying_and_selling_second_hand.mp3":
    "https://tektok.co.il/podlove/file/74/s/feed/c/mp3/12_buying_and_selling_second_hand.mp3",
  "11_consumer_product_research.mp3":
    "https://tektok.co.il/podlove/file/71/s/feed/c/mp3/11_consumer_product_research.mp3",
  "10_home_audio_equipment.mp3": "https://tektok.co.il/podlove/file/65/s/feed/c/mp3/10_home_audio_equipment.mp3",
  "09_what_phone_to_choose_2019_android_vs_ios.mp3":
    "https://tektok.co.il/podlove/file/61/s/feed/c/mp3/09_what_phone_to_choose_2019_android_vs_ios.mp3",
  "08_consoles_vs_pc_2019.mp3": "https://tektok.co.il/podlove/file/54/s/feed/c/mp3/08_consoles_vs_pc_2019.mp3",
  "07_how_to_make_a_podcast.mp3": "https://tektok.co.il/podlove/file/44/s/feed/c/mp3/07_how_to_make_a_podcast.mp3",
  "06_netflix_and_video_streaming.mp3":
    "https://tektok.co.il/podlove/file/41/s/feed/c/mp3/06_netflix_and_video_streaming.mp3",
  "05_e_bike_outrage.mp3": "https://tektok.co.il/podlove/file/31/s/feed/c/mp3/05_e_bike_outrage.mp3",
  "04_internet_privacy_and_censorship.mp3":
    "https://tektok.co.il/podlove/file/22/s/feed/c/mp3/04_internet_privacy_and_censorship.mp3",
  "03_gaming_in_your_30s.mp3": "https://tektok.co.il/podlove/file/13/s/feed/c/mp3/03_gaming_in_your_30s.mp3",
  "02_online_shopping.mp3": "https://tektok.co.il/podlove/file/11/s/feed/c/mp3/02_online_shopping.mp3",
  "01_bird_scooters.mp3": "https://tektok.co.il/podlove/file/1/s/feed/c/mp3/01_bird_scooters.mp3",
};

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
    audio: playback[file] ?? stored?.enclosure ?? fileUrl,
    guid: tag(block, "guid"),
  };
});

const episodeByHref = new Map(episodes.map((episode) => [episode.href, episode]));

export function episodeForPost(slug: string): Episode | undefined {
  return episodeByHref.get(`/${slug}/`);
}
