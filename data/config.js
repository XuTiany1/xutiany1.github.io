/* ============================================================
   CONFIG — who you are, what the site looks like.
   ============================================================ */

const CONFIG = {

  // ---- name (first name renders bold, last name light) ----
  firstName: "Tianyi",
  lastName: "Xu",

  // ---- profile photo ----
  photo: "assets/img/profile_pic/profile_pic.JPG",

  // ---- accent color: one value re-themes the whole site ----
  accent: "#c62828",

  // ---- bio: one string per paragraph, HTML links are fine ----
  bio: [
    `I am a <b>fourth-year undergraduate</b> at <a href="https://www.mcgill.ca/">McGill University</a> pursing math and computer science degree(joint honours). I am also fortunate to work with <a href="https://dadelani.github.io/index.html">Prof. David Adelani</a> at <a href="https://mila.quebec/en">Mila</a> and <a href="https://mcgill-nlp.github.io/"McGill NLP</a>.`,

    `My research interest lies in <i> model reasoning </i>, over language and space. 
    
    As <b> reasoning ≠ memorization </b>, I am interested in exploring training recipies to make current LLMs more robust and capable. I am also quite interested in spatial reasoning, specifically long-horizon planning/exploration. `
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