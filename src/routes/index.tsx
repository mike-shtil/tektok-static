import { Title } from "@solidjs/meta";
import { Show } from "solid-js";
import { Hero } from "../components/Hero";
import { Layout } from "../components/Layout";
import { PostList } from "../components/PostList";
import { homePageHref, listPosts, POSTS_PER_PAGE } from "../content";
import { SeoHead } from "../seo/SeoHead";
import { homeSeo } from "../seo/home";

export default function Home() {
  return <HomeView page={1} />;
}

export function HomeView(props: { page: number }) {
  const posts = listPosts();
  const inRange = () => props.page === 1 || (props.page > 1 && (props.page - 1) * POSTS_PER_PAGE < posts.length);

  return (
    <Layout home hero={<Hero />}>
      <Show when={props.page === 1} fallback={<Title>TekTok - טכנולוגיה גיימינג תרבות</Title>}>
        <SeoHead seo={homeSeo} />
      </Show>
      <Show when={inRange()} fallback={<h1>העמוד לא נמצא</h1>}>
        <PostList posts={posts} page={props.page} pageHref={homePageHref} />
      </Show>
    </Layout>
  );
}
