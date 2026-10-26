import { createEffect, createMemo, createSignal, For, on, onCleanup, onMount, Show } from "solid-js";
import { css } from "../../styled-system/css";
import { POSTS_PER_PAGE, type Post } from "../content";
import { PostCard } from "./PostCard";

export function PostList(props: { posts: Post[]; page?: number; pageHref: (page: number) => string }) {
  const page = () => props.page ?? 1;
  const offset = () => (page() - 1) * POSTS_PER_PAGE;
  const [count, setCount] = createSignal(POSTS_PER_PAGE);
  const visible = createMemo(() => props.posts.slice(offset(), offset() + count()));
  const nextHref = () => (page() * POSTS_PER_PAGE < props.posts.length ? props.pageHref(page() + 1) : undefined);
  let sentinel: HTMLDivElement | undefined;
  let observer: IntersectionObserver | undefined;

  const watchSentinel = () => {
    if (!observer || !sentinel) return;
    observer.unobserve(sentinel);
    if (offset() + count() < props.posts.length) observer.observe(sentinel);
  };

  createEffect(
    on(
      () => `${page()}\0${props.posts.map((post) => post.slug).join("\0")}`,
      () => {
        setCount(POSTS_PER_PAGE);
        requestAnimationFrame(watchSentinel);
      },
      { defer: true },
    ),
  );

  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        const rest = props.posts.length - offset();
        if (count() >= rest) return;
        setCount((current) => Math.min(current + POSTS_PER_PAGE, rest));
        observer?.unobserve(sentinel!);
        requestAnimationFrame(watchSentinel);
      },
      { rootMargin: "800px 0px" },
    );
    watchSentinel();
    onCleanup(() => observer?.disconnect());
  });

  return (
    <>
      <section
        aria-label="כתבות"
        class={css({
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          "@media (min-width: 800px)": { paddingRight: "30px" },
          "@media (min-width: 1400px)": { paddingRight: "60px" },
        })}
      >
        <For each={visible()}>{(post) => <PostCard post={post} />}</For>
        <div ref={sentinel} aria-hidden="true" class={css({ flexBasis: "100%", height: "1px" })} />
      </section>
      <Show when={nextHref()}>
        {(href) => <noscript innerHTML={olderPostsLink(href())} />}
      </Show>
    </>
  );
}

const chevronDown =
  '<svg viewBox="0 0 1792 1792" width="1em" height="1em" aria-hidden="true" fill="currentColor"><g transform="translate(0 1792) scale(1 -1)"><path d="M1683 728l-742 -741q-19 -19 -45 -19t-45 19l-742 741q-19 19 -19 45.5t19 45.5l166 165q19 19 45 19t45 -19l531 -531l531 531q19 19 45 19t45 -19l166 -165q19 -19 19 -45.5t-19 -45.5z"/></g></svg>';

function olderPostsLink(href: string): string {
  const safe = href.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  return `<a class="pager-next" href="${safe}" title="פוסטים ישנים יותר" aria-label="פוסטים ישנים יותר">${chevronDown}</a>`;
}
