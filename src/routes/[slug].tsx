import { Title } from "@solidjs/meta";
import { SeoHead } from "../seo/SeoHead";
import { A, useParams } from "@solidjs/router";
import { Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { css } from "../../styled-system/css";
import { CategoryChip } from "../components/CategoryChip";
import { Layout } from "../components/Layout";
import { PodcastPlayer } from "../components/PodcastPlayer";
import { PostFields } from "../components/PostFields";
import { formatPostDate, getPost, routeSlug } from "../content";
import { episodeForPost } from "../podcast/episodes";

export default function PostPage() {
  const params = useParams();
  const post = () => getPost(routeSlug(params.slug));

  return (
    <Layout>
      <Show
        when={post()}
        fallback={
          <div>
            <Title>הכתבה לא נמצאה | TekTok</Title>
            <h1>הכתבה לא נמצאה</h1>
            <A href="/">חזרה לדף הבית</A>
          </div>
        }
      >
        {(article) => (
          <div
            class={css({
              maxWidth: "1100px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              "@media (min-width: 1000px)": {
                flexDirection: "row",
                alignItems: "flex-start",
              },
            })}
          >
            <Show when={article().seo} fallback={<Title>{article().title} | TekTok</Title>}>
              {(seo) => <SeoHead seo={seo()} />}
            </Show>
            <aside
              aria-label="פרטים נוספים"
              class={css({
                display: "none",
                "@media (min-width: 1000px)": {
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  flex: "0 0 300px",
                },
              })}
            >
              <PostFields post={article()} part="all" />
            </aside>
            <div class={css({ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "24px" })}>
              <div
                class={css({
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  "@media (min-width: 1000px)": { display: "none" },
                })}
              >
                <PostFields post={article()} part="notice" />
              </div>
          <article
            aria-labelledby="article-title"
            class={css({
              backgroundColor: "#fff",
              color: "#000",
              boxShadow: "-3px 5px 1em rgba(0, 0, 0, 0.36)",
            })}
          >
            <header class={css({ position: "relative", padding: "15px" })}>
              <div
                class={css({
                  position: "absolute",
                  right: "0",
                  bottom: "0",
                  zIndex: "5",
                  display: "flex",
                  color: "#fff",
                  transform: "translateY(100%)",
                })}
              >
                {article().categories.map((category) => (
                  <CategoryChip category={category} />
                ))}
              </div>
              <h1 id="article-title">{article().title}</h1>
              <div
                class={css({
                  marginTop: "48px",
                  paddingLeft: "80px",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "baseline",
                  "@media (min-width: 800px)": { marginTop: "40px" },
                })}
              >
                <time datetime={article().date} class={css({ fontWeight: "300" })}>
                  {formatPostDate(article().date)}
                </time>
                <span class={css({ fontWeight: "600", marginRight: "auto", fontSize: "20px" })}>
                  {article().authors.map((author) => author.name).join(", ")}
                </span>
              </div>
              <Show when={article().authors[0]?.avatar}>
                <img
                  src={article().authors[0]?.avatar}
                  alt=""
                  class={css({
                    position: "absolute",
                    left: "0",
                    bottom: "0",
                    width: "100px",
                    height: "100px",
                    borderRadius: "10px",
                    objectFit: "cover",
                    backgroundColor: "#fff",
                    transform: "translate(-15px, 30%)",
                    zIndex: "2",
                    boxShadow: "-3px 5px 1em rgba(0, 0, 0, 0.36)",
                  })}
                />
              </Show>
            </header>
            <img
              src={article().image}
              alt=""
              class={css({ width: "100%", height: "auto", maxHeight: "500px", objectFit: "cover" })}
            />
            <Show when={episodeForPost(article().slug)}>
              {(episode) => <PodcastPlayer episode={episode()} />}
            </Show>
            <div class="prose">
              <Dynamic component={article().Content} />
            </div>
          </article>
              <div class={css({ "@media (min-width: 1000px)": { display: "none" } })}>
                <PostFields post={article()} part="authors" />
              </div>
            </div>
          </div>
        )}
      </Show>
    </Layout>
  );
}
