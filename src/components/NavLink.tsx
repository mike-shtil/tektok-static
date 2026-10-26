import { useLocation } from "@solidjs/router";
import type { JSX } from "solid-js";
import { isCurrentPage } from "../current-page";

export function NavLink(props: {
  href: string;
  class?: string;
  style?: JSX.CSSProperties;
  lang?: string;
  label?: string;
  children: JSX.Element;
}) {
  const location = useLocation();
  return (
    <a
      href={props.href}
      class={props.class}
      style={props.style}
      lang={props.lang}
      aria-label={props.label}
      aria-current={isCurrentPage(location.pathname, props.href) ? "page" : undefined}
    >
      {props.children}
    </a>
  );
}
