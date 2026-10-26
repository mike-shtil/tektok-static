import { Title } from "@solidjs/meta";
import { useParams } from "@solidjs/router";
import { Show } from "solid-js";
import { css } from "../../styled-system/css";
import { categoryFromParam, categoryPageHref, POSTS_PER_PAGE, postsInCategory, routeSlug } from "../content";
import { Layout } from "./Layout";
import { PostList } from "./PostList";

export function CategoryView(props: { page: number }) {
  const params = useParams();
  const slug = () => routeSlug(params.slug);
  const category = () => categoryFromParam(params.slug);
  const posts = () => postsInCategory(slug());
  const title = () => category()?.title ?? slug();
  const inRange = () => props.page === 1 || (props.page > 1 && (props.page - 1) * POSTS_PER_PAGE < posts().length);

  return (
    <Layout>
      <Title>{title()} | TekTok</Title>
      <header class={css({ paddingRight: "60px", marginBottom: "60px" })}>
        <h1 class={css({ color: "#000" })}>{title()}</h1>
      </header>
      <Show when={inRange()} fallback={<p>העמוד לא נמצא</p>}>
        <PostList posts={posts()} page={props.page} pageHref={(page) => categoryPageHref(slug(), page)} />
      </Show>
    </Layout>
  );
}
