import { For } from "solid-js";
import { css } from "../../styled-system/css";
import type { Post } from "../content";
import { PostCard } from "./PostCard";

export function PostList(props: { posts: Post[] }) {
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
      <For each={props.posts}>{(post) => <PostCard post={post} />}</For>
    </section>
  );
}
