import { Title } from "@solidjs/meta";
import { useParams } from "@solidjs/router";
import { css } from "../../../styled-system/css";
import { Layout } from "../../components/Layout";
import { PostList } from "../../components/PostList";
import { categoryFromParam, postsInCategory, routeSlug } from "../../content";

export default function CategoryPage() {
  const params = useParams();
  const slug = () => routeSlug(params.slug);
  const category = () => categoryFromParam(params.slug);
  const posts = () => postsInCategory(slug());
  const title = () => category()?.title ?? slug();

  return (
    <Layout>
      <Title>{title()} | TekTok</Title>
      <header class={css({ paddingRight: "60px", marginBottom: "60px" })}>
        <h1 class={css({ color: "#000" })}>{title()}</h1>
      </header>
      <PostList posts={posts()} />
    </Layout>
  );
}
