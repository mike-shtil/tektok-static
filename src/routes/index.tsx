import { Title } from "@solidjs/meta";
import { Hero } from "../components/Hero";
import { Layout } from "../components/Layout";
import { PostList } from "../components/PostList";
import { listPosts } from "../content";

export default function Home() {
  const posts = listPosts();

  return (
    <Layout home hero={<Hero />}>
      <Title>TekTok - טכנולוגיה גיימינג תרבות</Title>
      <PostList posts={posts} />
    </Layout>
  );
}
