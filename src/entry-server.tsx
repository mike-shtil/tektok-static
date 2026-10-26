import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="he" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="google-site-verification" content="GywVXIBn9Kq-bdce4LZFl956XhrXHjsIix_6HBGKRMs" />
          <link rel="icon" href="/favicon.png" />
          <link rel="describedby" href="/llms.txt" />
          <link
            rel="alternate"
            type="application/rss+xml"
            title="Podcast Feed: פודקאסט TekTok (MP3 Feed)"
            href="/feed/mp3/"
          />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400;1,700&display=swap"
          />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
