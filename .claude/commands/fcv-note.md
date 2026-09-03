---
description: Write a foundational_cv class-note blog for a lecture topic
argument-hint: <topic> (e.g. image_filtering)
---

Create the `foundational_cv` lecture note for topic: **$ARGUMENTS**

Follow the full spec in `coursenote/foundational_cv/CLAUDE.md`. In short:

1. **Find the sources.** List `assets/pdf/coursenote/foundational_cv/` and locate the
   subfolder for `$ARGUMENTS` (the folder name may be prefixed/spelled differently, e.g.
   `03-image-filtering` vs `image_filtering` — match on the topic, ask me if ambiguous).
   Read **every page of every PDF** in it:
   - the `*presentation*` / slides PDF → **terminology authority**
   - the `*lecturenotes*` PDF → depth, proofs, worked examples
2. Also read my rough notes at `coursenote/lecture_notes/$ARGUMENTS.md` if the file exists —
   it signals what I found confusing or important.
3. **Write to `coursenote/foundational_cv/$ARGUMENTS.md`** (overwrite if it exists, but show
   me what changed).
4. Match the **voice and writing style of `blog/blog_vision_foundation.md`** — that file is
   the only style authority; I wrote it. The existing `image_filtering*.md` files are rough
   formatting sketches, not voice references.
5. Use the callout-box templates and the content rules from `CLAUDE.md`: decomposed,
   motivated, story-driven, examples in boxes, analogies for the tricky parts, terminology
   from the presentation PDF.
6. When done: summarise what you wrote and flag any slide-vs-notes terminology conflicts you
   resolved.
