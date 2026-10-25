import type { JSX } from "solid-js";
import { Title } from "@solidjs/meta";
import { css } from "../../styled-system/css";
import { Layout } from "./Layout";

export function StaticPage(props: { title: string; children: JSX.Element }) {
  return (
    <Layout>
      <Title>{props.title} | TekTok</Title>
      <article
        class={css({
          maxWidth: "720px",
          margin: "0 auto",
          backgroundColor: "#fff",
          color: "#000",
          padding: "30px",
          boxShadow: "-3px 5px 1em rgba(0, 0, 0, 0.36)",
        })}
      >
        <h1>{props.title}</h1>
        {props.children}
      </article>
    </Layout>
  );
}
