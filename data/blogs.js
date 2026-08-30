/* ============================================================
   BLOG POSTS — newest first.

   To publish a new post:
   1. Drop your .md file in the blog/ folder.
   2. Add an object here with slug/title/date/excerpt/file.
   That's it — blog/index.html and blog/post.html do the rest.

   slug      used in the URL: blog/post.html?slug=SLUG
   title     post title
   date      short label, e.g. "Aug 2026"
   excerpt   one or two lines shown on the blog list page
   file      path to the markdown source, relative to site root
   ============================================================ */

const BLOGS = [
  {
    slug: "llava-family",
    title: "The LlaVa Family of Vision-Language Models",
    date: "Aug 2026",
    excerpt: "A tour through the LlaVa family: from the original LlaVa's projection-layer trick, through LlaVa-1.5's MLP connector and higher-resolution variants, to LlaVa-NEXT, LlaVA-OneVision, and LlaVa-MORE.",
    file: "blog/blog_llava_vlm.md"
  },
  {
    slug: "short-history-on-vision",
    title: "Back to the Foundation of Current Vision",
    date: "Aug 2026",
    excerpt: "A tour through the ideas that reshaped computer vision: ViT and ViT-5's architectural refinements, then CLIP, SigLIP, and SigLIP2's language-supervised learning objectives.",
    file: "blog/blog_vision_foundation.md"
  }
];
