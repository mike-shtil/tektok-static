import { Link, Meta, Title, useHead } from "@solidjs/meta";
import { For, Show } from "solid-js";
import type { Seo } from "./schema";

export function SeoHead(props: { seo: Seo }) {
  const json = () => JSON.stringify(props.seo.schema).replaceAll("<", "\\u003c");
  useHead({
    tag: "script",
    props: {
      type: "application/ld+json",
      class: "yoast-schema-graph",
      get children() {
        return json();
      },
    },
    setting: { close: true, escape: false },
    id: "yoast-schema-graph",
  });

  return (
    <>
      <Title>{props.seo.title}</Title>
      <Show when={props.seo.description}>
        <Meta name="description" content={props.seo.description} />
      </Show>
      <Meta name="robots" content={props.seo.robots} />
      <Show when={props.seo.canonical}>
        <Link rel="canonical" href={props.seo.canonical} />
      </Show>
      <Show when={props.seo.prev}>{(href) => <Link rel="prev" href={href()} />}</Show>
      <Show when={props.seo.next}>{(href) => <Link rel="next" href={href()} />}</Show>
      <Meta property="og:locale" content={props.seo.og.locale} />
      <Meta property="og:type" content={props.seo.og.type} />
      <Meta property="og:title" content={props.seo.og.title} />
      <Show when={props.seo.og.description}>
        <Meta property="og:description" content={props.seo.og.description} />
      </Show>
      <Meta property="og:url" content={props.seo.og.url} />
      <Meta property="og:site_name" content={props.seo.og.site_name} />
      <Show when={props.seo.og.image}>
        {(image) => (
          <>
            <Meta property="og:image" content={image().url} />
            <Show when={typeof image().width === "number"}>
              <Meta property="og:image:width" content={String(image().width)} />
            </Show>
            <Show when={typeof image().height === "number"}>
              <Meta property="og:image:height" content={String(image().height)} />
            </Show>
            <Show when={image().type}>{(type) => <Meta property="og:image:type" content={type()} />}</Show>
          </>
        )}
      </Show>
      <Show when={props.seo.article?.publisher}>
        {(publisher) => <Meta property="article:publisher" content={publisher()} />}
      </Show>
      <Show when={props.seo.article?.published_time}>
        {(time) => <Meta property="article:published_time" content={time()} />}
      </Show>
      <Show when={props.seo.article?.modified_time}>
        {(time) => <Meta property="article:modified_time" content={time()} />}
      </Show>
      <Show when={props.seo.article?.author}>
        {(author) => <Meta property="article:author" content={author()} />}
      </Show>
      <Show when={props.seo.author}>{(author) => <Meta name="author" content={author()} />}</Show>
      <Meta name="twitter:card" content={props.seo.twitter.card} />
      <Show when={props.seo.twitter.creator}>
        {(creator) => <Meta name="twitter:creator" content={creator()} />}
      </Show>
      <For each={props.seo.twitter.labels ?? []}>
        {(item, index) => (
          <>
            <Meta name={`twitter:label${index() + 1}`} content={item.label} />
            <Meta name={`twitter:data${index() + 1}`} content={item.data} />
          </>
        )}
      </For>
    </>
  );
}
