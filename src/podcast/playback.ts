const rates = [1, 1.2, 1.5, 2] as const;

export type PlaybackRate = (typeof rates)[number];

export { rates };

const RATE_KEY = "tektok.playback-rate";
const POSITION_KEY = "tektok.playback-position";

function storage(): Storage | undefined {
  try {
    if (typeof localStorage === "undefined") return;
    return localStorage;
  } catch {
    return;
  }
}

export function readRate(): PlaybackRate {
  const raw = Number(storage()?.getItem(RATE_KEY));
  return (rates as readonly number[]).includes(raw) ? (raw as PlaybackRate) : 1;
}

export function writeRate(rate: PlaybackRate) {
  storage()?.setItem(RATE_KEY, String(rate));
}

function readPositions(): Record<string, number> {
  const raw = storage()?.getItem(POSITION_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const positions: Record<string, number> = {};
    for (const [file, value] of Object.entries(parsed)) {
      const seconds = Number(value);
      if (Number.isFinite(seconds) && seconds >= 1) positions[file] = Math.round(seconds);
    }
    return positions;
  } catch {
    return {};
  }
}

export function readPosition(file: string): number {
  return readPositions()[file] ?? 0;
}

export function writePosition(file: string, seconds: number, duration = 0) {
  const store = storage();
  if (!store || !file || !Number.isFinite(seconds) || seconds < 1) return;
  const positions = readPositions();
  const atEnd = duration > 0 && Number.isFinite(duration) && seconds >= duration - 10;
  if (atEnd) delete positions[file];
  else positions[file] = Math.round(seconds);
  store.setItem(POSITION_KEY, JSON.stringify(positions));
}

export function clearPosition(file: string) {
  const store = storage();
  if (!store || !file) return;
  const positions = readPositions();
  if (positions[file] == null) return;
  delete positions[file];
  store.setItem(POSITION_KEY, JSON.stringify(positions));
}
