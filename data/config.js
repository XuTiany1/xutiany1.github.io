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
    `I am a <b>fourth-year undergraduate</b> at <a href="https://www.mcgill.ca/">McGill University</a> pursuing Joint Honours Mathematics and Computer Science. I am also fortunate to work with <a href="https://dadelani.github.io/index.html">Prof. David Adelani</a> at <a href="https://mila.quebec/en">Mila</a> and <a href="https://mcgill-nlp.github.io/"> McGill NLP </a>.`,
    `I was also a research intern at <a href="https://www.qualcomm.com/research/artificial-intelligence">Qualcomm</a>, supervised by <a href="https://scholar.google.com/citations?view_op=list_works&hl=en&user=1U3vbI0AAAAJ">Dr. Xiaopeng Zhang</a>, working on recurrent architecture + MoE-LoRA for efficient on-device ASR.`,

    `My research interest is primarily concerned with exploring what truly enhances model reasoning capabilities (<b>reasoning ≠ memorization</b>). `,
    
    `My long-term vision is for models to be <b>robust, responsible, efficient, and capable</b> reasoners across multiple modalities. Recently, my work focuses on continued pre-training of foundation LLMs.`,
    
    `Previously, I was a research intern at McGill under <a href="https://isabeaups.github.io/">Prof. Isabeau Prémont-Schwarz</a> working on continual learning.`,

    `Aside from research, I enjoy 🏸 , 𓌉◯𓇋 , and fingerstyle guitar!`
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