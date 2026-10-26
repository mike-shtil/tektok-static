import { css } from "../../styled-system/css";
import { NavLink } from "./NavLink";

export function Hero() {
  return (
    <section
      class={css({
        position: "relative",
        overflow: "hidden",
        height: "60vh",
        maxHeight: "56.25vw",
        minHeight: "280px",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "30px",
        backgroundColor: "#000",
      })}
    >
      <h1 class="sr-only">TekTok</h1>
      <div
        inert
        aria-hidden="true"
        class={css({
          position: "absolute",
          inset: "0",
          zIndex: "0",
          overflow: "hidden",
        })}
      >
        <iframe
          id="hero-player"
          title="סרטון רקע של TekTok"
          tabIndex={-1}
          src="https://www.youtube.com/embed/videoseries?list=PLbBnPOihibgxDkr5HhTA9a0XePy7k07_y&rel=0&loop=1&autoplay=1&mute=1&controls=0&showinfo=0&enablejsapi=1&playsinline=1"
          allow="autoplay; encrypted-media"
          class={css({
            position: "absolute",
            top: "50%",
            left: "0",
            width: "100%",
            height: "1080px",
            transform: "translateY(-50%)",
            border: "0",
          })}
        />
      </div>
      <div
        class={css({
          position: "absolute",
          inset: "0",
          zIndex: "1",
          backgroundImage:
            "linear-gradient(0deg, rgba(0,0,0,.738) 0, rgba(0,0,0,.7) 22%, rgba(0,0,0,.541) 38%, rgba(0,0,0,.382) 47%, rgba(0,0,0,.278) 56.5%, rgba(0,0,0,.194) 65%, rgba(0,0,0,.126) 73%, rgba(0,0,0,.075) 80.2%, rgba(0,0,0,.042) 86.1%, rgba(0,0,0,.021) 91%, rgba(0,0,0,.008) 95.2%, rgba(0,0,0,.002) 98.2%, transparent)",
        })}
      />
      <div
        class={css({
          position: "relative",
          zIndex: "2",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "24px",
        })}
      >
        <NavLink href="/" label="TekTok, דף הבית">
          <img
            src="/tektok-logo-light-lg.png"
            alt=""
            class={css({
              height: "140px",
              width: "auto",
              maxWidth: "100%",
            })}
          />
        </NavLink>
        <div
          class={css({
            marginTop: "8px",
            textAlign: "center",
            fontSize: "20px",
            fontWeight: "300",
            opacity: "0.87",
            color: "#fff",
          })}
        >
          טכנולוגיה גיימינג תרבות
        </div>
      </div>
    </section>
  );
}
