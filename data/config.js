/* ============================================================
   CONFIG — who you are, what the site looks like.
   ============================================================ */

const CONFIG = {

  // ---- name (first name renders bold, last name light) ----
  firstName: "Tianyi",
  lastName: "Xu",

  // ---- profile photo ----
  photo: "assets/img/profile.jpg",

  // ---- accent color: one value re-themes the whole site ----
  accent: "#c62828",

  // ---- bio: one string per paragraph, HTML links are fine ----
  bio: [
    `I am a <b>fourth-year undergraduate</b> at <a href="https://www.mcgill.ca/">McGill University</a> pursing math and computer science degree(joint honours). I am also fortunate to work with <a href="https://dadelani.github.io/index.html">Prof. David Adelani</a> at <a href="https://mila.quebec/en">Mila</a>.`,

    `Reasoning ≠ Memorization. I am interested in improving model reasoning capability and robustness so it is more applicable for real-world usages. My research interest lies in model reasoning for both langauge and vision.`
  ],

  // ---- footer icons: set any to "" to hide it ----
  social: {
    email:    "tianyi.xu2@mail.mcgill.ca",
    //github:   "https://github.com/yourusername",
    scholar:  "https://scholar.google.com/citations?user=crQVBLoAAAAJ&hl=en",
    //x:  "",
    linkedin: "https://www.linkedin.com/in/tianyixucs/"
  },

  // ---- section behavior ----
  newsHeading: "Updates",   // label in the news card header
  newsVisible: 4,           // how many updates show before "Show all"
  showNews: true            // set false to hide the whole news card
};