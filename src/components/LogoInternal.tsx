import { css } from "../../styled-system/css";
import { NavLink } from "./NavLink";

export function LogoInternal() {
  return (
    <NavLink
      href="/"
      label="TekTok, דף הבית"
      class={css({
        position: "fixed",
        right: "0",
        bottom: "10px",
        left: "20px",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: "10",
        transition: "transform 0.15s ease-out",
        "&:hover": { transform: "translateY(-0.2em)" },
        "@media (min-width: 800px)": { left: "30px" },
      })}
    >
      <img
        src="/tektok-logo-negative-flat-md.png"
        alt=""
        class={css({
          height: "25px",
          "@media (min-width: 800px)": { height: "35px" },
        })}
      />
    </NavLink>
  );
}
