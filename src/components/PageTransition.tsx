import { useBeforeLeave, useIsRouting, useLocation } from "@solidjs/router";
import { untrack } from "solid-js";

type ViewTransitionHandle = { finished?: Promise<unknown> };
type StartViewTransition = (update: () => void | Promise<void>) => ViewTransitionHandle;

function startViewTransition(): StartViewTransition | undefined {
  const start = (document as Document & { startViewTransition?: StartViewTransition }).startViewTransition;
  return typeof start === "function" ? start.bind(document) : undefined;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pathnameOf(to: string) {
  try {
    return new URL(to, window.location.href).pathname;
  } catch {
    return null;
  }
}

function waitUntilSettled(from: string, pathname: () => string, isRouting: () => boolean) {
  return new Promise<void>((resolve) => {
    const started = performance.now();
    let steps = 0;
    const notes: Array<{ step: number; dt: number; path: string; routing: boolean }> = [];
    const tick = () => {
      const path = untrack(pathname);
      const routing = untrack(isRouting);
      notes.push({ step: steps, dt: Math.round(performance.now() - started), path, routing });
      if ((path !== from && !routing) || steps >= 8 || performance.now() - started > 2000) {
        (window as unknown as { __vtNotes?: unknown }).__vtNotes = notes;
        resolve();
        return;
      }
      steps += 1;
      if (steps < 4) queueMicrotask(tick);
      else {
        const channel = new MessageChannel();
        channel.port1.onmessage = () => tick();
        channel.port2.postMessage(null);
      }
    };
    queueMicrotask(tick);
  });
}

/** Crossfade client navigations with the View Transitions API. */
export function PageTransition() {
  const location = useLocation();
  const isRouting = useIsRouting();

  useBeforeLeave((event) => {
    if (event.defaultPrevented) return;
    const start = startViewTransition();
    if (!start || document.visibilityState === "hidden" || prefersReducedMotion()) return;
    if (typeof event.to === "string" && pathnameOf(event.to) === location.pathname) return;

    const from = location.pathname;
    event.preventDefault();
    try {
      const transition = start(() => {
        event.retry(true);
        // The router commits the next page inside startTransition, after this returns.
        return waitUntilSettled(from, () => location.pathname, isRouting);
      });
      transition.finished?.catch(() => {});
    } catch {
      event.retry(true);
    }
  });

  return null;
}
