import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { css } from "../../styled-system/css";
import { formatPostDate, postHref, type Post } from "../content";
import { CategoryChip } from "./CategoryChip";

const imageFade =
  "linear-gradient(180deg, rgba(0,0,0,.738) 0, rgba(0,0,0,.7) 22%, rgba(0,0,0,.541) 38%, rgba(0,0,0,.382) 47%, rgba(0,0,0,.278) 56.5%, rgba(0,0,0,.194) 65%, rgba(0,0,0,.126) 73%, rgba(0,0,0,.075) 80.2%, rgba(0,0,0,.042) 86.1%, rgba(0,0,0,.021) 91%, rgba(0,0,0,.008) 95.2%, rgba(0,0,0,.002) 98.2%, transparent)";

export function PostCard(props: { post: Post }) {
  const authors = () => props.post.authors.map((author) => author.name).join(", ");

  return (
    <article
      class={css({
        display: "block",
        flex: "0 2 100%",
        marginBottom: "60px",
        backgroundColor: "#fff",
        color: "#000",
        boxShadow: "-3px 5px 1em rgba(0, 0, 0, 0.36)",
        willChange: "transform",
        "&:hover": { transform: "scale(1.02)", transition: "transform 0.2s ease-in" },
        "@media (min-width: 800px)": {
          marginLeft: "60px",
          flexBasis: "calc(50% - 60px)",
        },
        "@media (min-width: 1400px)": {
          flexBasis: "calc(33.333% - 60px)",
        },
      })}
    >
      <A
        href={postHref(props.post.slug)}
        class={css({
          display: "block",
          position: "relative",
          padding: "10px",
          "&:visited": { color: "#250033" },
          "&:hover .excerpt": {
            maxHeight: "400px",
            transition: "max-height 0.6s ease-out 0.6s",
          },
        })}
      >
        <h2 class={css({ minHeight: "55px", marginBottom: "10px" })}>{props.post.title}</h2>
        <div
          class={`excerpt ${css({
            maxHeight: "0",
            overflow: "hidden",
            transition: "max-height 0.4s ease-out",
          })}`}
        >
          <div class={css({ paddingBottom: "8px", wordBreak: "break-all" })}>{props.post.excerpt}</div>
        </div>
        <div
          class={css({
            marginTop: "20px",
            paddingLeft: "69px",
            fontSize: "14px",
            display: "flex",
            alignItems: "baseline",
          })}
        >
          <span class={css({ fontWeight: "300" })}>{formatPostDate(props.post.date)}</span>
          <Show when={props.post.comments > 0}>
            <span class={css({ marginRight: "10px" })}>{props.post.comments}</span>
          </Show>
          <span class={css({ fontWeight: "600", marginRight: "auto", fontSize: "17px" })}>{authors()}</span>
        </div>
        <Show when={props.post.authors[0]?.avatar}>
          <img
            src={props.post.authors[0]?.avatar}
            alt=""
            class={css({
              position: "absolute",
              left: "0",
              bottom: "0",
              width: "80px",
              height: "80px",
              borderRadius: "10px",
              objectFit: "cover",
              backgroundColor: "#fff",
              transform: "translate(-10px, 50%)",
              zIndex: "2",
              boxShadow: "-3px 5px 1em rgba(0, 0, 0, 0.36)",
            })}
          />
        </Show>
      </A>
      <div class={css({ position: "relative" })}>
        <div
          class={css({
            position: "absolute",
            top: "0",
            right: "0",
            zIndex: "5",
            display: "flex",
            color: "#fff",
          })}
        >
          <For each={props.post.categories}>{(category) => <CategoryChip category={category} />}</For>
        </div>
        <A href={postHref(props.post.slug)} class={css({ display: "block", overflow: "hidden", position: "relative", minHeight: "60px" })}>
          <div
            class={css({
              paddingTop: "56.25%",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            })}
            style={{ "background-image": `url("${props.post.image}")` }}
          />
          <div
            class={css({
              position: "absolute",
              top: "0",
              right: "0",
              left: "0",
              height: "25%",
              opacity: "0.75",
              pointerEvents: "none",
            })}
            style={{ "background-image": imageFade }}
          />
        </A>
      </div>
    </article>
  );
}
