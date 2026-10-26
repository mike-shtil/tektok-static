import { createSignal, Show } from "solid-js";
import { css } from "../../styled-system/css";
import type { Episode } from "../podcast/episodes";

const card = css({
  margin: "0 15px 8px",
  padding: "14px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  background: "#111",
  color: "#fff",
  borderRadius: "12px",
  "@media (min-width: 800px)": { margin: "0 30px 12px" },
});

const heading = css({
  display: "flex",
  gap: "12px",
  alignItems: "center",
  minWidth: "0",
});

const cover = css({
  width: "72px",
  height: "72px",
  objectFit: "cover",
  borderRadius: "8px",
  flex: "0 0 auto",
});

const kicker = css({
  fontSize: "12px",
  letterSpacing: "0.02em",
  color: "rgba(255, 255, 255, 0.65)",
});

const title = css({
  fontWeight: "700",
  fontSize: "16px",
  lineHeight: "1.3",
});

const subtitle = css({
  margin: "4px 0 0",
  fontSize: "13px",
  lineHeight: "1.4",
  color: "rgba(255, 255, 255, 0.75)",
});

const transport = css({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  direction: "ltr",
});

const play = css({
  width: "44px",
  height: "44px",
  borderRadius: "999px",
  border: "0",
  padding: "0",
  background: "#fff",
  color: "#111",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  flex: "0 0 auto",
  "&:hover": { background: "#3d8bff", color: "#fff" },
});

const time = css({
  fontSize: "12px",
  fontVariantNumeric: "tabular-nums",
  color: "rgba(255, 255, 255, 0.8)",
  flex: "0 0 auto",
});

const seek = css({
  flex: "1",
  minWidth: "0",
  accentColor: "#3d8bff",
  cursor: "pointer",
});

const volume = css({
  width: "72px",
  accentColor: "#fff",
  cursor: "pointer",
  "@media (max-width: 560px)": { display: "none" },
});

const iconLink = css({
  color: "#fff",
  display: "grid",
  placeItems: "center",
  flex: "0 0 auto",
  "&:hover": { color: "#3d8bff" },
});

function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const secs = whole % 60;
  const mins = Math.floor(whole / 60) % 60;
  const hours = Math.floor(whole / 3600);
  const ss = String(secs).padStart(2, "0");
  if (hours) return `${hours}:${String(mins).padStart(2, "0")}:${ss}`;
  return `${mins}:${ss}`;
}

function parseClock(value: string): number {
  const parts = value.split(":").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] ?? 0;
}

export function PodcastPlayer(props: { episode: Episode }) {
  let audio: HTMLAudioElement | undefined;
  const [playing, setPlaying] = createSignal(false);
  const [current, setCurrent] = createSignal(0);
  const [length, setLength] = createSignal(parseClock(props.episode.duration));
  const [level, setLevel] = createSignal(1);

  const toggle = () => {
    const node = audio;
    if (!node) return;
    if (node.paused) void node.play();
    else node.pause();
  };

  const seekTo = (value: string) => {
    const next = Number(value);
    setCurrent(next);
    if (audio) audio.currentTime = next;
  };

  return (
    <section class={card} aria-label={props.episode.title}>
      <div class={heading}>
        <img class={cover} src={props.episode.image} alt="" width={72} height={72} />
        <div>
          <div class={kicker}>TekTok הפודקאסט</div>
          <div class={title}>{props.episode.title}</div>
          <Show when={props.episode.subtitle}>
            <p class={subtitle}>{props.episode.subtitle}</p>
          </Show>
        </div>
      </div>
      <div class={transport}>
        <button type="button" class={play} aria-label={playing() ? "השהיה" : "ניגון"} onClick={toggle}>
          <Show when={playing()} fallback={
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d="M5 3.5v11l10-5.5z" fill="currentColor" />
            </svg>
          }>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d="M4 3h3.5v12H4zm6.5 0H14v12h-3.5z" fill="currentColor" />
            </svg>
          </Show>
        </button>
        <span class={time}>{clock(current())}</span>
        <input
          class={seek}
          type="range"
          min="0"
          max={length() || 0}
          step="0.1"
          value={current()}
          aria-label="מיקום בפרק"
          onInput={(event) => seekTo(event.currentTarget.value)}
        />
        <span class={time}>{clock(length())}</span>
        <input
          class={volume}
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={level()}
          aria-label="עוצמת שמע"
          onInput={(event) => {
            const next = Number(event.currentTarget.value);
            setLevel(next);
            if (audio) audio.volume = next;
          }}
        />
        <a class={iconLink} href={props.episode.audio} download={props.episode.file} aria-label="הורדת הפרק">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M9 2v8.2l2.6-2.6 1.4 1.4L9 13.9 5 9.9l1.4-1.4L9 10.2V2h0zM3 15h12v1.5H3z" fill="currentColor" />
          </svg>
        </a>
      </div>
      <audio
        ref={audio}
        preload="metadata"
        src={props.episode.audio}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          const next = event.currentTarget.duration;
          if (Number.isFinite(next)) setLength(next);
        }}
        onEnded={() => setPlaying(false)}
      />
    </section>
  );
}
