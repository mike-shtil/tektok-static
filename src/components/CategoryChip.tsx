import type { JSX } from "solid-js";
import { css } from "../../styled-system/css";
import { categoryHref, type Category } from "../content";

const chip = css({
  paddingTop: "10px",
  paddingBottom: "10px",
  paddingRight: "8px",
  paddingLeft: "8px",
  backgroundColor: "color-mix(in srgb, var(--cat) 90%, transparent)",
  color: "#000",
});

const plain = css({
  paddingTop: "10px",
  paddingBottom: "10px",
  paddingRight: "8px",
  paddingLeft: "8px",
  color: "#fff",
});

export function CategoryChip(props: { category: Category }) {
  return (
    <a
      href={categoryHref(props.category.slug)}
      class={props.category.chip ? chip : plain}
      style={
        props.category.chip
          ? ({ "--cat": props.category.color } as JSX.CSSProperties)
          : undefined
      }
    >
      {props.category.title}
    </a>
  );
}
