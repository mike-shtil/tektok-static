import { createEffect, createMemo, createSignal, For, on, onCleanup, onMount } from "solid-js";
import { css } from "../../styled-system/css";
import type { Post } from "../content";
import { PostCard } from "./PostCard";

const PAGE_SIZE = 12;

export function PostList(props: { posts: Post[] }) {
  const [count, setCount] = createSignal(PAGE_SIZE);
  const visible = createMemo(() => props.posts.slice(0, count()));
  let sentinel: HTMLDivElement | undefined;
  let observer: IntersectionObserver | undefined;

  const watchSentinel = () => {
    if (!observer || !sentinel) return;
    observer.unobserve(sentinel);
    if (count() < props.posts.length) observer.observe(sentinel);
  };

  createEffect(
    on(
      () => props.posts.map((post) => post.slug).join("\0"),
      () => {
        setCount(PAGE_SIZE);
        requestAnimationFrame(watchSentinel);
      },
      { defer: true },
    ),
  );

  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        if (count() >= props.posts.length) return;
        setCount((current) => Math.min(current + PAGE_SIZE, props.posts.length));
        observer?.unobserve(sentinel!);
        requestAnimationFrame(watchSentinel);
      },
      { rootMargin: "800px 0px" },
    );
    watchSentinel();
    onCleanup(() => observer?.disconnect());
  });

  return (
    <section
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
  );
}
