import type { JSX } from "solid-js";
import { For, Show } from "solid-js";
import { css } from "../../styled-system/css";
import { categories, categoryHref } from "../content";
import { NavLink } from "./NavLink";

const item = css({
  padding: "10px 15px",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "@media (min-width: 800px)": {
    marginLeft: "12px",
  },
  "&:hover": { color: "#3d8bff" },
});

const categoryItem = css({
  padding: "10px 15px",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderBottomWidth: "3px",
  borderBottomStyle: "solid",
  borderBottomColor: "var(--cat)",
  transition: "background-color 0.3s ease-out",
  "@media (min-width: 800px)": {
    marginLeft: "12px",
  },
  "&:hover": {
    backgroundColor: "var(--cat)",
    color: "#000",
  },
});

export function Toolbar(props: { showLogo: boolean }) {
  const pages: { href: string; title: string; lang?: string }[] = [
    { href: "/about-us/", title: "מי אנחנו" },
    { href: "/contact-us/", title: "Contact Us", lang: "en" },
  ];

  return (
    <header
      style={{ "view-transition-name": "site-nav" }}
      class={css({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flexWrap: "wrap",
        minHeight: "70px",
        backgroundColor: "#2b232f",
        padding: "15px 30px",
        color: "#fff",
        textAlign: "center",
        position: "relative",
        "@media (min-width: 800px)": {
          flexDirection: "row",
          justifyContent: "flex-start",
        },
      })}
    >
      <Show when={props.showLogo}>
        <NavLink
          href="/"
          label="TekTok, דף הבית"
          class={css({
            marginBottom: "10px",
            "@media (min-width: 800px)": { marginBottom: "0", marginLeft: "20px" },
          })}
        >
          <img
            src="/tektok-logo-light-lg.png"
            alt=""
            class={css({ height: "45px", width: "auto", marginBottom: "-8px" })}
          />
        </NavLink>
      </Show>
      <nav
        aria-label="תפריט ראשי"
        class={css({
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          "@media (min-width: 1200px)": {
            justifyContent: "flex-start",
          },
        })}
      >
        <For each={categories.filter((category) => category.menu)}>
          {(category) => (
            <NavLink
              href={categoryHref(category.slug)}
              class={categoryItem}
              style={{ "--cat": category.color } as JSX.CSSProperties}
            >
              {category.title}
            </NavLink>
          )}
        </For>
        <For each={pages}>
          {(page) => (
            <NavLink href={page.href} class={item} lang={page.lang}>
              {page.title}
            </NavLink>
          )}
        </For>
      </nav>
    </header>
  );
}
