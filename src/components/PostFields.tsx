import { For, Show } from "solid-js";
import { css } from "../../styled-system/css";
import type { Author, Post } from "../content";

const ratings = [
  { score: 5, label: "רוצו לקנות!", color: "#2fff38" },
  { score: 4, label: "חכו למבצע הראשון", color: "#c5f310" },
  { score: 3, label: "חכו לחצי מחיר", color: "#ffe60d" },
  { score: 2, label: "עד $5", color: "#ff9c09" },
  { score: 1, label: "עברו הלאה", color: "#ff0a0a" },
];

export function Disclosure(props: { text: string }) {
  return (
    <section
      class={css({
        backgroundImage: "linear-gradient(90deg, #40048c, #21048c)",
        color: "#fff",
        padding: "15px",
        boxShadow: "-3px 5px 1em rgba(0, 0, 0, 0.36)",
      })}
    >
      <div
        class={css({
          display: "flex",
          alignItems: "center",
          gap: "0.5em",
          marginBottom: "15px",
          fontSize: "18px",
          fontWeight: "600",
          opacity: "0.7",
          "@media (min-width: 800px)": {
            flexDirection: "column",
            alignItems: "flex-start",
            fontSize: "20px",
            gap: "0",
          },
        })}
      >
        <span class={css({ fontWeight: "300", letterSpacing: "1.4px" })}>גילוי נאות</span>
        <span class={css({ "@media (min-width: 800px)": { fontSize: "0.9em" } })}>Unbiased</span>
      </div>
      <p class={css({ margin: "0", lineHeight: "1.4", fontWeight: "300", fontSize: "16px" })}>{props.text}</p>
    </section>
  );
}

export function Rating(props: { score: number }) {
  return (
    <section
      class={css({
        backgroundColor: "#fff",
        padding: "16px",
        boxShadow: "-3px 5px 1em rgba(0, 0, 0, 0.36)",
        color: "#250033",
      })}
    >
      <h3 class={css({ margin: "0 0 12px", fontSize: "1.1rem" })}>הדירוג שלנו</h3>
      <div class={css({ display: "flex", flexDirection: "column", gap: "6px" })}>
        <For each={ratings}>
          {(item) => {
            const selected = () => item.score === props.score;
            return (
              <div
                class={css({
                  padding: "8px 10px",
                  fontWeight: "600",
                  opacity: "0.45",
                  transition: "transform 0.15s ease-out",
                })}
                style={{
                  "background-color": item.color,
                  opacity: selected() ? "1" : "0.45",
                  transform: selected() ? "scale(1.04)" : "none",
                }}
              >
                {item.label}
              </div>
            );
          }}
        </For>
      </div>
    </section>
  );
}

export function AuthorBios(props: { authors: Author[] }) {
  const withBio = () => props.authors.filter((author) => author.bio);
  return (
    <Show when={withBio().length > 0}>
      <For each={withBio()}>
        {(author, index) => (
          <>
            <Show when={index() === 1}>
              <h3 class={css({ margin: "8px 0 0", textAlign: "center", color: "#fff" })}>נכתב בשיתוף עם</h3>
            </Show>
            <section
              class={css({
                backgroundColor: "#fff",
                color: "#250033",
                padding: "30px",
                boxShadow: "-3px 5px 1em rgba(0, 0, 0, 0.36)",
              })}
            >
              <Show when={author.avatar}>
                <img
                  src={author.avatar}
                  alt=""
                  class={css({
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "10px",
                  })}
                />
              </Show>
              <h3 class={css({ margin: "15px 0 0", fontSize: "1.25rem" })}>{author.name}</h3>
              <p class={css({ margin: "15px 0 0", fontSize: "19px", lineHeight: "1.4" })}>{author.bio}</p>
            </section>
          </>
        )}
      </For>
    </Show>
  );
}

export function PostFields(props: { post: Post; part: "notice" | "authors" | "all" }) {
  const notice = () => props.part === "notice" || props.part === "all";
  const authors = () => props.part === "authors" || props.part === "all";
  return (
    <>
      <Show when={notice() && props.post.disclosure}>
        <Disclosure text={props.post.disclosure!} />
      </Show>
      <Show when={notice() && props.post.rating}>
        <Rating score={props.post.rating!} />
      </Show>
      <Show when={authors()}>
        <AuthorBios authors={props.post.authors} />
      </Show>
    </>
  );
}
