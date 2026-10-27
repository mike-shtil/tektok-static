import { For, Show } from "solid-js";
import { css } from "../../styled-system/css";
import { commentCount, commentsFor, type Comment } from "../content/comments";
import { formatCommentDate } from "../content";

function hue(name: string): number {
  let value = 0;
  for (const char of name) value = (value * 33 + char.charCodeAt(0)) % 360;
  return value;
}

function CommentItem(props: { comment: Comment; depth: number }) {
  return (
    <li class={css({ listStyle: "none" })}>
      <article
        class={css({
          display: "grid",
          gridTemplateColumns: "42px 1fr",
          gap: "12px",
          padding: "16px 0",
        })}
      >
        <div
          aria-hidden="true"
          class={css({
            width: "42px",
            height: "42px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: "700",
            fontSize: "18px",
          })}
          style={{ "background-color": `hsl(${hue(props.comment.author)} 42% 42%)` }}
        >
          {props.comment.author.slice(0, 1)}
        </div>
        <div class={css({ minWidth: "0" })}>
          <header
            class={css({
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              gap: "8px 14px",
              marginBottom: "6px",
            })}
          >
            <strong class={css({ fontSize: "16px" })}>{props.comment.author}</strong>
            <time
              datetime={props.comment.date}
              class={css({ color: "#5c6570", fontSize: "13px", fontWeight: "300" })}
            >
              {formatCommentDate(props.comment.date)}
            </time>
          </header>
          <div
            class={css({
              lineHeight: "1.55",
              fontSize: "15px",
              wordBreak: "break-word",
              "& a": { color: "#0b7ea8", textDecoration: "underline" },
              "& img": { display: "block", maxWidth: "100%", height: "auto", margin: "8px 0" },
              "& blockquote": {
                margin: "8px 0",
                paddingRight: "12px",
                borderRight: "3px solid #c5d0dc",
              },
              "& ul, & ol": { margin: "8px 0", paddingRight: "1.2em" },
            })}
            innerHTML={props.comment.html}
          />
        </div>
      </article>
      <Show when={props.comment.replies.length > 0}>
        <ol
          class={css({
            margin: "0",
            padding: "0 16px 0 0",
            borderRight: "2px solid #e1e7ee",
          })}
          style={{ "margin-right": props.depth > 4 ? "0" : undefined }}
        >
          <For each={props.comment.replies}>
            {(reply) => <CommentItem comment={reply} depth={props.depth + 1} />}
          </For>
        </ol>
      </Show>
    </li>
  );
}

export function Comments(props: { slug: string }) {
  const list = () => commentsFor(props.slug);
  const total = () => commentCount(list());

  return (
    <Show when={total() > 0}>
      <section
        aria-labelledby="comments-heading"
        class={css({
          backgroundColor: "#fff",
          color: "#000",
          boxShadow: "-3px 5px 1em rgba(0, 0, 0, 0.36)",
          padding: "18px 16px 8px",
          "@media (min-width: 800px)": { padding: "24px 28px 12px" },
        })}
      >
        <h2 id="comments-heading" class={css({ marginBottom: "8px" })}>
          תגובות ({total()})
        </h2>
        <ol class={css({ margin: "0", padding: "0" })}>
          <For each={list()}>{(comment) => <CommentItem comment={comment} depth={0} />}</For>
        </ol>
      </section>
    </Show>
  );
}
