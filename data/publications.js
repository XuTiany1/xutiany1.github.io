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
    badge: "Under Submission",
    thumb: "assets/img/papers/MGSM_PRO.png",
    title: "MGSM-Pro: A Simple Strategy for Robust Multilingual Mathematical Reasoning Evaluation",
    authors: "{me}, Kosei Uemura, Alfred Malengo Kondoro, Tadesse Destaw Belay, Catherine Nana Nyaah Essuman, Ifeoma Okoh, Ganiyat Afolabi, Ayodele Awokoya, David Ifeoluwa Adelani",
    venue: "",
    note: "",
    links: [
      { label: "paper", url: "https://arxiv.org/abs/2601.21225" },
      { label: "dataset",  url: "https://huggingface.co/datasets/McGill-NLP/mgsm-pro" },
    ]
  },
  {
    selected: true,
    badge: "ACL",
    thumb: "assets/img/papers/AfriqueLLM.png",
    title: "AfriqueLLM: How Data Mixing and Model Architecture Impact Continued Pre-training for African Languages",
    authors: "Hao Yu, {me}, Michael A. Hedderich, Wassim Hamidouche, Syed Waqas Zamir, David Ifeoluwa Adelani",
    venue: "ACL 2026",
    note: "(Oral)",
    links: [
      { label: "paper", url: "https://aclanthology.org/2026.acl-long.267/" }
    ]
  },
  {
    selected: false,
    badge: "MAIN",
    thumb: "assets/img/papers/SNAP.png",
    title: "SNAP: Stopping Catastrophic Forgetting in Hebbian Learning with Sigmoidal Neuronal Adaptive Plasticity",
    authors: "{me}, Patrick Zheng, Shiyan Liu, Sicheng Lyu, Isabeau Prémont-Schwarz",
    venue: "Montreal AI and Neuroscience conference",
    note: "(Oral)",
    links: [
      { label: "paper",  url: "https://arxiv.org/abs/2410.15318" },
    ]
  }
];