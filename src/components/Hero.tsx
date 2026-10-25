import { A } from "@solidjs/router";
import { css } from "../../styled-system/css";

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
        backgroundColor: "#120c16",
        backgroundImage: "url(/media/prickle.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      })}
    >
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
        <A href="/">
          <img
            src="/tektok-logo-light-lg.png"
            alt="TekTok logo"
            class={css({
              height: "140px",
              width: "auto",
              maxWidth: "100%",
            })}
          />
        </A>
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
