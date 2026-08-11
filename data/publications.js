/* ============================================================
   PUBLICATIONS — newest first.

   selected  true  = appears on the "Selected" tab and the "All" tab
             false = appears only on "All"
   badge     small colored label above the thumbnail, e.g. "ICML"
   thumb     path to a preview image (any aspect ratio; it gets cropped)
   authors   write {me} where your own name goes — it gets underlined
   venue     italic line under the authors
   note      optional, renders red, e.g. "(Oral)"
   links     buttons under the entry; add or remove freely
   ============================================================ */

const PUBLICATIONS = [
  {
    selected: true,
    badge: "ICML",
    thumb: "assets/img/papers/paper1.png",
    title: "A Descriptive Title That Fits On Two Lines At Most",
    authors: "{me}, Second Author, Third Author, and Senior Author",
    venue: "ICML 2026",
    note: "(Oral)",
    links: [
      { label: "arXiv", url: "https://arxiv.org/abs/0000.00000" },
      { label: "Code",  url: "https://github.com/you/repo" },
      { label: "Blog",  url: "https://example.com" }
    ]
  },
  {
    selected: true,
    badge: "arXiv",
    thumb: "assets/img/papers/paper2.png",
    title: "Another Paper Title Goes Right Here",
    authors: "First Author*, {me}*, Third Author, and Senior Author",
    venue: "2026",
    note: "",
    links: [
      { label: "arXiv", url: "https://arxiv.org/abs/0000.00000" }
    ]
  },
  {
    selected: false,
    badge: "ACL",
    thumb: "assets/img/papers/paper3.png",
    title: "A Workshop Paper You Want Listed But Not Featured",
    authors: "{me}, Collaborator, and Advisor",
    venue: "In Findings of the Association for Computational Linguistics: ACL 2025",
    note: "",
    links: [
      { label: "DOI",  url: "https://doi.org/10.0000/000" },
      { label: "Code", url: "https://github.com/you/repo" }
    ]
  }
];