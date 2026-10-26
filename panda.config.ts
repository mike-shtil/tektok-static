import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  include: ["./src/**/*.{ts,tsx,mdx}"],
  exclude: [],
  outdir: "styled-system",
  jsxFramework: "solid",
  globalCss: {
    html: {
      fontSize: "100%",
    },
    body: {
      margin: "0",
      direction: "rtl",
      textAlign: "right",
      fontFamily: "'Open Sans', sans-serif",
      backgroundImage: "linear-gradient(to bottom left, #3d8bff, #e5fff5)",
      "@media (min-width: 800px)": {
        backgroundImage: "linear-gradient(to bottom left, #3d8bff, #4dffba)",
      },
    },
    a: {
      textDecoration: "none",
      color: "inherit",
    },
    "h1, h2, h3, h4, h5, h6": {
      marginTop: "0",
      marginBottom: "0.5em",
      fontWeight: "700",
    },
    h1: {
      fontSize: "1.6em",
      "@media (min-width: 800px)": { fontSize: "2em" },
    },
    h2: {
      fontSize: "1.5em",
    },
    h3: {
      fontSize: "1.17em",
    },
    ".prose a": {
      color: "#34b8d2",
    },
    ".prose": {
      lineHeight: "1.4",
      padding: "15px",
      wordBreak: "break-word",
      fontSize: "15px",
      "@media (min-width: 800px)": {
        fontSize: "16px",
        lineHeight: "1.5",
        padding: "30px",
      },
      "@media (min-width: 1400px)": {
        fontSize: "17px",
      },
    },
    ".prose h3": {
      fontSize: "1.2em",
      borderRight: "4px solid #075da9",
      paddingRight: "20px",
      color: "#075da9",
    },
    ".prose p": {
      marginTop: "0",
      marginBottom: "1.2em",
    },
    ".prose img, .prose video": {
      maxWidth: "100%",
      height: "auto",
    },
    ".prose iframe": {
      maxWidth: "100%",
      border: "0",
    },
    ".prose iframe[src*='youtube.com'], .prose iframe[src*='youtube-nocookie.com']": {
      width: "100%",
      aspectRatio: "16 / 9",
      height: "auto",
    },
    ".prose iframe[src*='open.spotify.com']": {
      width: "100%",
      display: "block",
      borderRadius: "12px",
    },
    ".prose figure": {
      margin: "0 0 1.2em",
    },
    ".prose ul, .prose ol": {
      paddingRight: "1.2em",
      marginBottom: "1.2em",
    },
  },
});
