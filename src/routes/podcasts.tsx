import { For } from "solid-js";
import { css } from "../../styled-system/css";
import { PodcastPlayer } from "../components/PodcastPlayer";
import { StaticPage } from "../components/StaticPage";
import { episodes } from "../podcast/episodes";

const subscribe = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "8px 18px",
  margin: "0 0 8px",
  "& a": { color: "#075da9" },
});

const list = css({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "20px",
});

export default function Podcasts() {
  return (
    <StaticPage title="TekTok הפודקאסט">
      <p>הנה כל הפרקים של הפודקאסט שלנו</p>
      <ul class={subscribe}>
        <li><a href="/feed/mp3/" rel="external">פיד MP3</a></li>
        <li><a href="https://itunes.apple.com/il/podcast/id1444232181" lang="en">Apple Podcasts</a></li>
        <li><a href="https://open.spotify.com/show/7zC71kBT9R5p4ZhHYLXzCy" lang="en">Spotify</a></li>
      </ul>
      <div class={list}>
        <For each={episodes}>
          {(episode) => <PodcastPlayer episode={episode} flush showDate />}
        </For>
      </div>
    </StaticPage>
  );
}
