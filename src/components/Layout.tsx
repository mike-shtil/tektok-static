import type { JSX } from "solid-js";
import { Show } from "solid-js";
import { css } from "../../styled-system/css";
import { Footer } from "./Footer";
import { LogoInternal } from "./LogoInternal";
import { Toolbar } from "./Toolbar";

export function Layout(props: { home?: boolean; hero?: JSX.Element; children: JSX.Element }) {
  return (
    <>
      <a
        href="#main-content"
        class="skip-link"
        onClick={(event) => {
          const main = document.getElementById("main-content");
          if (!main) return;
          event.preventDefault();
          main.focus({ preventScroll: true });
          main.scrollIntoView();
        }}
      >
        דילוג לתוכן
      </a>
      <Toolbar showLogo={!props.home} />
      {props.hero}
      <main
        id="main-content"
        tabIndex={-1}
        class={css({
          minHeight: "100vh",
          padding: "60px 15px",
          boxShadow: "0 0 2em rgba(0, 0, 0, 0.8)",
          position: "relative",
          zIndex: "1",
        })}
      >
        {props.children}
      </main>
      <Footer />
      <Show when={!props.home}>
        <LogoInternal />
      </Show>
    </>
  );
}
