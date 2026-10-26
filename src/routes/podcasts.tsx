import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { css } from "../../styled-system/css";
import { StaticPage } from "../components/StaticPage";
import { episodes } from "../podcast/episodes";

const subscribe = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "8px 18px",
  margin: "0 0 8px",
  "& a": { color: "#075da9" },
});

const row = css({
  display: "flex",
  gap: "14px",
  alignItems: "flex-start",
  padding: "16px 0",
  borderTop: "1px solid #e6e6e6",
});

const thumb = css({
  width: "64px",
  height: "64px",
  objectFit: "cover",
  flex: "0 0 auto",
});

const title = css({
  color: "#075da9",
  fontWeight: "700",
});

const player = css({
  width: "100%",
  marginTop: "8px",
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
      <div>
        <For each={episodes}>
          {(episode) => (
            <article class={row}>
              <img class={thumb} src={episode.image} alt="" width={64} height={64} />
              <div>
                <div role="heading" aria-level={2}>
                  <A href={episode.href} class={title}>
                    {episode.title}
                  </A>
                </div>
                <div>
                  {episode.dateLabel}
                  <Show when={episode.duration !== "0:00:00"}> · {episode.duration}</Show>
                </div>
                <Show when={episode.subtitle}>
                  <p>{episode.subtitle}</p>
                </Show>
                <audio class={player} controls preload="none" src={episode.audio} aria-label={`נגן: ${episode.title}`} />
              </div>
            </article>
          )}
        </For>
      </div>
    </StaticPage>
  );
}
