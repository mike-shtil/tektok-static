import { StaticPage } from "../components/StaticPage";

const html = "בכדי ליצור קשר עם צוות האתר, תוכלו להשתמש בקישור לפייסבוק או באימייל שלנו.\n\n<span lang=\"en\">For press releases and additional info, please contact us through facebook or by mail.</span>\n\n<a href=\"mailto:info@tektok.co.il\">info@tektok.co.il</a>\n\n<img class=\"alignnone size-full wp-image-5364\" src=\"/media/uploads/2017/12/Cat_Guard.jpg\" alt=\"חתול אפור-לבן שוכב על מארז מחשב\" width=\"748\" height=\"540\" />";

export default function Contact() {
  return (
    <StaticPage title="Contact Us">
      <div class="prose" innerHTML={html} />
    </StaticPage>
  );
}
