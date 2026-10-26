export type Author = {
  slug: string;
  name: string;
  avatar?: string;
  bio?: string;
};

/** Shared writer profiles. Post MDX files list these keys and do not copy the bio. */
export const authors: Record<string, Author> = {
  "alonk": { slug: "alonk", name: "אלון כרמי", bio: "עורך וידיאו, אפטריסט, יוצר משחקים עצמאי כתחביב ונודניק מקצועי." },
  "arielwi": { slug: "arielwi", name: "אריאל וינדלר", avatar: "/media/uploads/2017/09/Ariel_W.jpg" },
  "ayelet1": { slug: "ayelet1", name: "AYELET1" },
  "bena": { slug: "bena", name: "בן אשכנזי", avatar: "/media/uploads/2020/04/93322596_555757361989293_4597792615268614144_n.jpg" },
  "dank": { slug: "dank", name: "דניאל כהנוב", avatar: "/media/uploads/2020/10/DANIEL-C-Custom.jpg" },
  "doronk": { slug: "doronk", name: "דורון", avatar: "/media/uploads/2019/06/62169706_319397082291994_2814180701119709184_n.png" },
  "fishyguy": { slug: "fishyguy", name: "אלי גטניו", avatar: "/media/uploads/2017/10/FISHY2-Custom.jpg", bio: "אלי הוא גיימר ותיק שמאוד אוהב משחקים. הוא מנהל היום את קבוצת PlayStationNation IL בפייסבוק ומשחק עם פיצות ושניצלים בזמנו הפנוי. הנשק המועדף: PS4 Pro ולפעמים גם Nintendo Switch בנסיעות. הוא אפילו משחק ב-PSVR, אנחנו נשבעים!" },
  "gil": { slug: "gil", name: "גיל פלקוביץ'", avatar: "/media/uploads/2017/06/gil-avatar.jpg" },
  "hauzer": { slug: "hauzer", name: "Hauzer" },
  "henry": { slug: "henry", name: "הנרי לי", avatar: "/media/uploads/2019/01/29366279_10211754487397731_6717757295406612480_n.jpg" },
  "hobgob": { slug: "hobgob", name: "Hobgob" },
  "imported_mike": { slug: "imported_mike", name: "Mike" },
  "irit": { slug: "irit", name: "אירית מירסקי", avatar: "/media/uploads/2017/11/irit-avatar.jpg" },
  "iritmi": { slug: "iritmi", name: "iritmi" },
  "itay-lukach": { slug: "itay-lukach", name: "איתי לוקץ'", avatar: "/media/uploads/2017/10/Itay_Lukach.jpg" },
  "itayb": { slug: "itayb", name: "איתי ברנר", avatar: "/media/uploads/2021/07/Itay-Brener.jpeg", bio: "איתי הוא גיימר וותיק וחובב טכנולוגיה שנודד באופן קבוע בין המחשב לקונסולות וכיום מצדד באחרונות. בעבר היה חלק מהצוות של \"נוסטלגיה ולתמיד\" וכתב במגוון של אתרי גיימינג. כיום כותב תוכן עצמאי ובזמנו הפנוי מנהל בלוג ואתר מדריכים על מה שהוא אוהב בשם ניוב (n00b)." },
  "jacob": { slug: "jacob", name: "Jacob" },
  "jacob234": { slug: "jacob234", name: "קובי מדריש", avatar: "/media/uploads/2017/11/p.jpg", bio: "קובי נהנה מ-DIY, הנדסה וטכנולוגיה. אם אפשר לשדרג, להלחים או לבנות משהו אז הוא שם. הוא נהנה לכתוב ולקרוא ותמיד רעב ללמוד משהו חדש. מבחינתו מחשב אמיתי זה רק Linux וכמה שיותר קוד פתוח ככה יותר טוב. @Kmedrish" },
  "james-crow": { slug: "james-crow", name: "James Crow" },
  "jonathan": { slug: "jonathan", name: "יהונתן אזולאי", avatar: "/media/uploads/2019/02/johnathan-azulai-avatar.jpg", bio: "עבור יהונתן טכנולוגיה, חומרה ותוכנה הם השילוש הקדוש וגיימינג אמיתי זה רק על PC. הוא התחיל לשחק בדיאבלו הראשון אי שם בשנות ה-2000 המוקדמות והתקדם משם. עדיין גיימר אך עקב היותו סטודנט בתחום הסייבר ורשתות התקשורת מקדיש פחות זמן לתחביב האהוב." },
  "libbyb": { slug: "libbyb", name: "ליבי ברגמן", avatar: "/media/uploads/2021/01/Libby-Bergman.jpg" },
  "mike": { slug: "mike", name: "מיכאל שטילרמן", avatar: "/media/uploads/2019/07/profile-small.jpg", bio: "מיכאל מוקסם מכל מה שטכנולוגי והנדסי; הוא PC גיימר מושבע בזמן שאין לו, מפתח web בשאר היום ואוסף גאדג'טים בין לבין. מיכאל נהנה לכתוב אבל עיקר תרומתו היא בצללים, בצד הטכני של TekTok. על רובה לעולם לא נשמע..." },
  "omerg": { slug: "omerg", name: "עומר גזית", avatar: "/media/uploads/2017/11/עומר-גזית.jpg", bio: "התחביבים העיקריים של עומר הם גיימינג ואיירסופט והוא מוצא להם זמן גם כשיש בגרויות. מת על משחקי יריות מגוף ראשון, מבחינתו משחקי אונליין וסיפור הם באותה רמה." },
  "or": { slug: "or", name: "אור קורץ", avatar: "/media/uploads/2017/06/or-avatar.jpg", bio: "אור הוא גיימר וטכנולוג מלידה. אם יש לזה מסך מגע או ג'ויסטיק, הוא ישחק בזה. בוגר וואלה, אייפונס ואתרים נוספים. אור מגיע עם ניסיון רב בכתיבה, סקירות ודיעות. יש לו הרבה מה להגיד כמעט על הכל והוא מקווה שלפחות תשמעו אותו לפני שתקטלו. חתולאי ברמ\"ח איבריו, משחק ב-PS4 ולפעמים חוטא גם בפיסי ובאייפון. תמיד קר לו וזה בסדר כי אנחנו אוהבים אותו." },
  "pasha": { slug: "pasha", name: "פשה קגן", bio: "מקדם אתרים ביום, חובב גאדג'טים וסלולרים בלילה. פשה חובב כל דבר טכנולוגי - ואם אפשר, אז שיהיה נייד ושיהיה חכם." },
  "ranz": { slug: "ranz", name: "רן זילברמן", avatar: "/media/uploads/2019/06/Ran-Zilberman-1.jpg" },
  "tektok-master": { slug: "tektok-master", name: "מערכת TekTok", avatar: "/media/uploads/2017/05/featured_image_default.jpg" },
  "tomer": { slug: "tomer", name: "תומר חסד", avatar: "/media/uploads/2017/06/tomer-avatar.jpg", bio: "תומר חסד, בן 20 מצפון הארץ. גיימר כבד, משחק בעיקר משחקי יריות אבל יש לי זיקה לעלילה טובה. מסקר משחקים מגיל 16 ואם תראו בחור עם עינים כחולות והרבה תלתלים בכנס רנדומלי, כנראה שזה אני." },
  "tomerb": { slug: "tomerb", name: "תומר בראשי", avatar: "/media/uploads/2018/01/26697056_1141177842683788_1508321522_n.jpg", bio: "תומר בראשי, בן 19 מירושלים. משחק עוד מימיי קראש בנדיקוט הראשון אבל היום במשחקים קצת יותר משודרגים... אני כותב כבר שנתיים באתרים גדולים וקטנים, המשחק האהוב עליי הוא דסטיני (הראשון!). מתי שלא משחק אני כותב ומתי שלא כותב אני מבשל/אוכל." },
  "tsachi": { slug: "tsachi", name: "צחי ליברמן", avatar: "/media/uploads/2019/01/Tsahi.jpg" },
  "yardens": { slug: "yardens", name: "שרה ירדן לבני", avatar: "/media/uploads/2018/05/Yarden.jpg" },
  "yogevp": { slug: "yogevp", name: "יוגב פודחרני", avatar: "/media/uploads/2020/12/pp.jpg" },
  "z1george": { slug: "z1george", name: "z1george" },
};
