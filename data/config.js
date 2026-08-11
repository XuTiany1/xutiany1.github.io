/* ============================================================
   CONFIG — who you are, what the site looks like.
   ============================================================ */

const CONFIG = {

  // ---- name (first name renders bold, last name light) ----
  firstName: "Your",
  lastName: "Name",

  // ---- profile photo ----
  photo: "assets/img/profile.jpg",

  // ---- accent color: one value re-themes the whole site ----
  accent: "#b509ac",

  // ---- bio: one string per paragraph, HTML links are fine ----
  bio: [
    `I am a <b>PhD student</b> at <a href="https://example.edu">Your University</a>,
     where I work with <a href="#">Prof. First Advisor</a> and <a href="#">Prof. Second Advisor</a>.
     Previously I was a Research Assistant at <a href="#">Some Lab</a>.`,

    `I obtained my B.S. from <a href="#">Undergrad University</a>, where I worked on research
     projects supervised by <a href="#">Prof. Someone</a>.`,

    `My research focuses on <i>one clear sentence about what you actually care about</i>.`
  ],

  // ---- footer icons: set any to "" to hide it ----
  social: {
    email:    "you@example.edu",
    github:   "https://github.com/yourusername",
    scholar:  "https://scholar.google.com/citations?user=XXXXXXX",
    twitter:  "",
    linkedin: ""
  },

  // ---- section behavior ----
  newsHeading: "Updates",   // label in the news card header
  newsVisible: 4,           // how many updates show before "Show all"
  showNews: true            // set false to hide the whole news card
};