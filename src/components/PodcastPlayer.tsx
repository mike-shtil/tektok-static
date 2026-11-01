import { A, useLocation } from "@solidjs/router";
import { createContext, createEffect, createSignal, onCleanup, onMount, Show, useContext, type JSX } from "solid-js";
import { isServer } from "solid-js/web";
import { css } from "../../styled-system/css";
import type { Episode } from "../podcast/episodes";
import {
  clearPosition,
  rates,
  readPosition,
  readRate,
  writePosition,
  writeRate,
  type PlaybackRate,
} from "../podcast/playback";

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

const flushCard = css({
  "&&": { margin: "0" },
});

const floatingCard = css({
  "&&": {
    position: "fixed",
    zIndex: "40",
    bottom: "56px",
    insetInlineStart: "16px",
    width: "min(420px, calc(100vw - 32px))",
    margin: "0",
    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.45)",
  },
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

const floatingCover = css({
  width: "48px",
  height: "48px",
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
  color: "#fff",
});

const titleLink = css({
  fontWeight: "700",
  fontSize: "16px",
  lineHeight: "1.3",
  color: "#fff",
  "&:hover": { color: "#3d8bff" },
});

const clamped = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
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

const speed = css({
  border: "0",
  background: "#fff",
  color: "#111",
  font: "inherit",
  fontSize: "13px",
  fontWeight: "700",
  fontVariantNumeric: "tabular-nums",
  lineHeight: "1",
  minWidth: "3.4em",
  height: "32px",
  padding: "0 8px",
  borderRadius: "999px",
  cursor: "pointer",
  flex: "0 0 auto",
  "&:hover": { background: "#3d8bff", color: "#fff" },
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

function headingId(file: string, floating: boolean) {
  const slug = file.replace(/\.mp3$/i, "").replace(/[^\w-]/g, "");
  return `${floating ? "dock" : "player"}-${slug}`;
}

type Session = {
  episode: () => Episode | undefined;
  started: () => boolean;
  playing: () => boolean;
  current: () => number;
  length: () => number;
  level: () => number;
  rate: () => PlaybackRate;
  toggle: (episode: Episode, resume?: number) => void;
  seek: (seconds: number) => void;
  setLevel: (value: number) => void;
  cycleRate: () => void;
};

const PodcastContext = createContext<Session>();

function usePodcast(): Session {
  const session = useContext(PodcastContext);
  if (!session) throw new Error("PodcastPlayer must be inside PodcastProvider");
  return session;
}

export function PodcastProvider(props: { children: JSX.Element }) {
  let audio: HTMLAudioElement | undefined;
  const [episode, setEpisode] = createSignal<Episode>();
  const [started, setStarted] = createSignal(false);
  const [playing, setPlaying] = createSignal(false);
  const [current, setCurrent] = createSignal(0);
  const [length, setLength] = createSignal(0);
  const [level, setLevel] = createSignal(1);
  const [rate, setRate] = createSignal<PlaybackRate>(1);
  let loadGeneration = 0;
  let resumeReady = true;

  onMount(() => {
    setRate(readRate());
    const flush = () => {
      const currentEpisode = episode();
      if (!currentEpisode || !audio) return;
      writePosition(currentEpisode.file, audio.currentTime, audio.duration);
    };
    window.addEventListener("pagehide", flush);
    onCleanup(() => window.removeEventListener("pagehide", flush));
  });

  createEffect(() => {
    const next = rate();
    if (!audio) return;
    audio.playbackRate = next;
    audio.defaultPlaybackRate = next;
  });

  createEffect(() => {
    if (isServer) return;
    const currentEpisode = episode();
    if (!playing() || !currentEpisode) return;
    const file = currentEpisode.file;
    const id = window.setInterval(() => {
      if (!audio) return;
      writePosition(file, audio.currentTime, audio.duration);
    }, 5000);
    onCleanup(() => window.clearInterval(id));
  });

  const remember = (file: string) => {
    if (!audio) return;
    writePosition(file, audio.currentTime, audio.duration);
  };

  const play = (next: Episode, resume?: number) => {
    const node = audio;
    if (!node) return;
    const previous = episode();
    if (previous && previous.file !== next.file) remember(previous.file);
    if (previous?.file !== next.file) {
      const at = resume ?? readPosition(next.file);
      const generation = ++loadGeneration;
      resumeReady = false;
      setEpisode(next);
      setLength(parseClock(next.duration));
      setCurrent(at);
      node.addEventListener(
        "loadedmetadata",
        () => {
          if (generation !== loadGeneration) return;
          const duration = node.duration;
          const target = Number.isFinite(duration) && at > duration - 10 ? 0 : at;
          if (target > 1) {
            node.currentTime = target;
            setCurrent(target);
          } else setCurrent(node.currentTime);
          if (Number.isFinite(duration)) setLength(duration);
          node.playbackRate = rate();
          node.defaultPlaybackRate = rate();
          resumeReady = true;
        },
        { once: true },
      );
      node.src = next.audio;
      node.preload = "auto";
    }
    node.volume = level();
    node.playbackRate = rate();
    node.defaultPlaybackRate = rate();
    setStarted(true);
    void node.play().catch(() => setPlaying(false));
  };

  const session: Session = {
    episode,
    started,
    playing,
    current,
    length,
    level,
    rate,
    toggle(next, resume) {
      const node = audio;
      if (!node) return;
      if (started() && episode()?.file === next.file) {
        if (node.paused) void node.play().catch(() => setPlaying(false));
        else node.pause();
        return;
      }
      play(next, resume);
    },
    seek(seconds) {
      setCurrent(seconds);
      if (audio) audio.currentTime = seconds;
      const currentEpisode = episode();
      if (!currentEpisode) return;
      if (seconds < 1) clearPosition(currentEpisode.file);
      else writePosition(currentEpisode.file, seconds, audio?.duration ?? 0);
    },
    setLevel(next) {
      setLevel(next);
      if (audio) audio.volume = next;
    },
    cycleRate() {
      const next = rates[(rates.indexOf(rate()) + 1) % rates.length];
      setRate(next);
      writeRate(next);
      if (!audio) return;
      audio.playbackRate = next;
      audio.defaultPlaybackRate = next;
    },
  };

  return (
    <PodcastContext.Provider value={session}>
      {props.children}
      <audio
        ref={audio}
        aria-hidden="true"
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => {
          setPlaying(false);
          const currentEpisode = episode();
          if (!resumeReady || !currentEpisode) return;
          remember(currentEpisode.file);
        }}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          const next = event.currentTarget.duration;
          if (Number.isFinite(next)) setLength(next);
        }}
        onEnded={() => {
          setPlaying(false);
          setCurrent(0);
          const currentEpisode = episode();
          if (currentEpisode) clearPosition(currentEpisode.file);
        }}
      />
      <PodcastDock />
    </PodcastContext.Provider>
  );
}

function PodcastDock() {
  const session = usePodcast();
  return (
    <Show when={session.started() ? session.episode() : undefined}>
      {(current) => <PlayerCard episode={current()} floating />}
    </Show>
  );
}

export function PodcastPlayer(props: { episode: Episode; flush?: boolean; showDate?: boolean }) {
  const session = usePodcast();
  const docked = () => session.started() && session.episode()?.file === props.episode.file;
  return (
    <Show when={!docked()}>
      <PlayerCard episode={props.episode} flush={props.flush} showDate={props.showDate} />
    </Show>
  );
}

function PlayerCard(props: { episode: Episode; floating?: boolean; flush?: boolean; showDate?: boolean }) {
  const session = usePodcast();
  const location = useLocation();
  const live = () => session.episode()?.file === props.episode.file;
  const [preview, setPreview] = createSignal(0);
  const [previewLength, setPreviewLength] = createSignal(parseClock(props.episode.duration));

  onMount(() => {
    const saved = readPosition(props.episode.file);
    setPreview(saved);
    if (props.episode.duration === "0:00:00") setPreviewLength(0);
  });

  const current = () => (live() ? session.current() : preview());
  const length = () => (live() ? session.length() || previewLength() : previewLength());
  const playing = () => live() && session.playing();
  const onPage = () => location.pathname.replace(/\/$/, "") === props.episode.href.replace(/\/$/, "");
  const id = () => headingId(props.episode.file, !!props.floating);

  const toggle = () => session.toggle(props.episode, live() ? undefined : preview());

  const seekTo = (value: string) => {
    const next = Number(value);
    if (live()) {
      session.seek(next);
      return;
    }
    setPreview(next);
    if (next < 1) clearPosition(props.episode.file);
    else writePosition(props.episode.file, next);
  };

  return (
    <section
      class={`${card} ${props.flush ? flushCard : ""} ${props.floating ? floatingCard : ""}`}
      style={props.floating ? { "view-transition-name": "podcast-dock" } : undefined}
      aria-labelledby={id()}
    >
      <div class={heading}>
        <img
          class={`${cover} ${props.floating ? floatingCover : ""}`}
          src={props.episode.image}
          alt=""
          width={props.floating ? 48 : 72}
          height={props.floating ? 48 : 72}
        />
        <div class={css({ minWidth: "0" })}>
          <div class={kicker}>
            TekTok הפודקאסט
            <Show when={props.showDate && props.episode.dateLabel}> · {props.episode.dateLabel}</Show>
          </div>
          <Show
            when={!onPage()}
            fallback={
              <div id={id()} class={`${title} ${props.floating ? clamped : ""}`} role="heading" aria-level={2}>
                {props.episode.title}
              </div>
            }
          >
            <A id={id()} href={props.episode.href} class={`${titleLink} ${props.floating ? clamped : ""}`}>
              {props.episode.title}
            </A>
          </Show>
          <Show when={!props.floating && props.episode.subtitle}>
            <p class={subtitle}>{props.episode.subtitle}</p>
          </Show>
        </div>
      </div>
      <div class={transport} role="group" aria-label="בקרי ניגון">
        <button
          type="button"
          class={play}
          aria-label={playing() ? "השהיה" : "ניגון"}
          aria-pressed={playing()}
          onClick={toggle}
        >
          <Show
            when={playing()}
            fallback={
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M5 3.5v11l10-5.5z" fill="currentColor" />
              </svg>
            }
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d="M4 3h3.5v12H4zm6.5 0H14v12h-3.5z" fill="currentColor" />
            </svg>
          </Show>
        </button>
        <span class={time} aria-hidden="true">
          {clock(current())}
        </span>
        <input
          class={seek}
          type="range"
          min="0"
          max={length() || 0}
          step="0.1"
          value={current()}
          aria-label="מיקום בפרק"
          aria-valuetext={`${clock(current())} מתוך ${clock(length())}`}
          onInput={(event) => seekTo(event.currentTarget.value)}
        />
        <span class={time} aria-hidden="true">
          {clock(length())}
        </span>
        <button type="button" class={speed} aria-label={`מהירות ניגון ×${session.rate()}`} onClick={() => session.cycleRate()}>
          ×{session.rate()}
        </button>
        <input
          class={volume}
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={session.level()}
          aria-label="עוצמת שמע"
          aria-valuetext={`${Math.round(session.level() * 100)} אחוז`}
          onInput={(event) => session.setLevel(Number(event.currentTarget.value))}
        />
        <a class={iconLink} href={props.episode.audio} download={props.episode.file} aria-label="הורדת הפרק">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M9 2v8.2l2.6-2.6 1.4 1.4L9 13.9 5 9.9l1.4-1.4L9 10.2V2h0zM3 15h12v1.5H3z" fill="currentColor" />
          </svg>
        </a>
      </div>
    </section>
  );
}
