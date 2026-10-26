import { css } from "../../styled-system/css";
import { NavLink } from "./NavLink";

const link = css({
  transition: "transform 0.15s ease-out",
  "&:hover": { transform: "translateY(-0.2em)" },
});

export function Footer() {
  const year = new Date().getFullYear();
  const pages: { href: string; title: string; lang?: string }[] = [
    { href: "/contact-us/", title: "Contact Us", lang: "en" },
    { href: "/podcasts/", title: "TekTok הפודקאסט" },
    { href: "/about-us/", title: "מי אנחנו" },
    { href: "/terms/", title: "תקנון" },
  ];

  return (
    <footer
      style={{ "view-transition-name": "site-footer" }}
      class={css({
        padding: "30px 15px",
        backgroundColor: "#2b232f",
        color: "#fff",
        textAlign: "center",
        "@media (min-width: 1000px)": {
          paddingRight: "30px",
          paddingLeft: "30px",
        },
      })}
    >
      <nav
        aria-label="תפריט תחתון"
        class={css({ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px 30px" })}
      >
        {pages.map((page) => (
          <NavLink href={page.href} lang={page.lang}>
            {page.title}
          </NavLink>
        ))}
      </nav>
      <div class={css({ marginTop: "12px", fontWeight: "300" })}>
        ©2014-{year} TekTok, כל הזכויות שמורות
      </div>
      <div class={css({ marginTop: "16px", display: "flex", justifyContent: "center", gap: "28px", flexWrap: "wrap", alignItems: "baseline" })}>
        <a class={link} href="https://www.facebook.com/TekTokBoard/" target="_blank" rel="noopener noreferrer" title="לפייסבוק שלנו">
          <img src="/facebook-logo.png" alt="פייסבוק של TekTok, נפתח בחלון חדש" class={css({ height: "16px" })} />
        </a>
        <span>
          <span class={css({ opacity: "0.7" })}>עיצוב לוגו: </span>
          <a class={link} href="https://www.youtube.com/channel/UCzu2HSibuCPslOpyebGdFXg" target="_blank" rel="noopener noreferrer">
            סבטה <img src="/GG_logo.png" alt="" class={css({ height: "18px", verticalAlign: "middle" })} />
            <span class="sr-only">, ערוץ יוטיוב, נפתח בחלון חדש</span>
          </a>
        </span>
        <span class={css({ display: "inline-flex", gap: "12px", alignItems: "center", flexWrap: "wrap" })}>
          <span class={css({ opacity: "0.7" })}>שותפי תוכן:</span>
          <a class={link} href="http://www.sport5.co.il/world.aspx?FolderID=7900&lang=he" target="_blank" rel="noopener noreferrer">
            <img src="/5sport_gaming_full.png" alt="ספורט 5 גיימינג, נפתח בחלון חדש" class={css({ height: "22px" })} />
          </a>
          <a class={link} href="https://vgc.co.il" target="_blank" rel="noopener noreferrer">
            VGC <img src="/vgc_logo.png" alt="" class={css({ height: "20px", verticalAlign: "middle" })} />
            <span class="sr-only">, נפתח בחלון חדש</span>
          </a>
        </span>
      </div>
    </footer>
  );
}
