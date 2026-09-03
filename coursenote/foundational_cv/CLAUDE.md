# CLAUDE.md — Class-note blogger for `foundational_cv`

Reference notes that already match the target style:
- [`image_filtering_2.md`](image_filtering_2.md) — the current best example of the finished style, but the voice is not original, for the voice refer to the next bullet point
- [`../../blog/blog_vision_foundation.md`](../../blog/blog_vision_foundation.md) — mimic this same voice, paper-review flavour.
- [`image_filtering.md`](image_filtering.md) — older, rougher pass. Same idea, lower polish. Don't imitate its density.

---

## Trigger

`/fcv-note <topic>` — or in plain words, **"create foundational_cv lecture note for [topic]"**.
Both mean: read the source PDFs for `<topic>`, then write `coursenote/foundational_cv/<topic>.md`.
The `<topic>` string is used verbatim as the output filename (`image_filtering` →
`image_filtering.md`). The slash command is defined in `.claude/commands/fcv-note.md`.

---

## The job

For each lecture topic there are source PDFs under `assets/pdf/coursenote/foundational_cv/`
(in a per-lecture subfolder) and, sometimes, a separate set of rough notes at
`coursenote/lecture_notes/<topic>.md` (written by someone else — a fellow student or the
professor). Claude reads all of it and writes a clean, decomposed, story-driven class-note
blog to `coursenote/foundational_cv/<topic>.md`. See "Source materials" for exact paths.

The note is a record of Tianyi's understanding of the class — not a transcript. It should be
something a first-timer to the material could read top-to-bottom and follow.

### Source materials, per topic

The PDFs live in a **per-lecture subfolder** of `assets/pdf/coursenote/foundational_cv/`. The
subfolder name is **not** guaranteed to equal `<topic>` — it may carry a lecture number or a
different spelling (topic `image_filtering` → folder `image_filtering/`; a later lecture might
be `05-edge-detection/`). So **list `assets/pdf/coursenote/foundational_cv/` and pick the
subfolder that matches the topic.** If two plausibly match, ask.

Inside that subfolder, files are named:
- `NN-<topic>-presentation.pdf` — slides. **Terminology authority.** When slides and lecture
  notes disagree on a name or symbol, the slides win.
- `NN-<topic>-lecturenotes.pdf` — lecture notes. Depth, proofs, derivations, worked examples.

If a lecture uses looser names, match on `presentation`/`slides` vs `lecturenotes` in the
filename, or just read whatever PDFs are in the folder. For `image_filtering` the folder is
`image_filtering/` with `03-imagefiltering-presentation.pdf` and
`03-imagefiltering-lecturenotes.pdf`.

Third source: `coursenote/lecture_notes/<topic>.md` — a rougher, separate set of notes on the
same lecture. Read it if the file exists; it flags what is confusing or important and should
become callouts, analogies, and "wait, why?" beats.

Fourth source — **figures**: `assets/img/coursenote/foundational_cv/<topic>/`. Tianyi puts
the images he wants in the note here (screenshots from the slides, plots, diagrams). **Open
and actually look at every image in this folder** — the filenames hint at what they show
(e.g. `example_1_edge_with_no_noise.png`, `image_noise.png`). Place each one at the point in
the note where that concept is introduced, with a one-line caption underneath. See
"Rendering pipeline" for the path syntax. If an image has no natural home, leave it out and
say which one and why.

**Read every page of every PDF in the subfolder, and view every image in the img subfolder**
(`Read` tool — `pages` for PDFs) before writing. Do not skim.

### Output

- Path: `coursenote/foundational_cv/<topic>.md`, where `<topic>` is exactly the string passed
  to `/fcv-note`. Overwrite if it already exists, but show what changed.
- No YAML front-matter. The file starts with a couple of plain lead-in sentences (see "Structure").
- Prefer one file per topic unless asked to split.

---

## Publishing to the site

After the `.md` is written, wire it into the website so it shows up under the **Course Notes**
subpage. This is part of the job — don't stop at the `.md`.

The pieces (all already exist for `foundational_cv`; create from the templates below only for a
brand-new area):

| Piece | Path | Role |
|---|---|---|
| Course-notes landing | `coursenote/index.html` | Lists every area and its notes. **Data-driven — never edit for a new note.** |
| Landing renderer | `assets/js/coursenotes.js` | Reads `data/coursenotes.js`. Shared, don't touch. |
| Note data | `data/coursenotes.js` | The list of areas → notes. **This is what you edit.** |
| Area page | `coursenote/<area>/post.html` | Renders one note. Hard-codes `window.CN_AREA`. One per area. |
| Note renderer | `assets/js/coursenote-post.js` | marked + KaTeX + heading ids. Shared, don't touch. |

**Steps for a new note in an existing area** (the common case):

1. Add a note object to that area's `notes` array in `data/coursenotes.js`, at the **top**
   (newest first): `{ slug, title, date: "<Mon YYYY>", excerpt, file: "coursenote/<area>/<topic>.md" }`.
   `slug` must equal `<topic>`; `date` uses today's month/year.
2. Nothing else — `coursenote/index.html` and `coursenote/<area>/post.html` pick it up automatically.
3. Sanity-check by serving the repo (`python3 -m http.server`) and opening
   `coursenote/<area>/post.html?slug=<topic>`.

**Extra steps for a brand-new area** (`<area>` folder didn't exist):

1. Add a new area block to `data/coursenotes.js`: `{ slug: "<area>", title, blurb, notes: [ … ] }`.
2. Create `coursenote/<area>/post.html` by copying `coursenote/foundational_cv/post.html` and
   changing the one line `window.CN_AREA = "foundational_cv"` to the new `<area>` slug.
3. Put figures under `assets/img/coursenote/<area>/<topic>/` and PDFs under
   `assets/pdf/coursenote/<area>/<subfolder>/`.
4. The "course notes" nav link already exists in `index.html`, `blog/index.html`,
   `blog/post.html`; new area pages inherit it via the copied `post.html`.

---

## Content rules (Tianyi's preferences)

1. **Decompose.** Every important definition, equation, and example lives in its own
   callout box (templates below). Prose connects the boxes; it doesn't replace them.
2. **Concise, but complete.** Tight sentences, no padding. But do not drop content from the
   lecture notes or slides — if the lecture covered it, it appears somewhere in the note.
3. **Motivation and story.** Open with *why this topic exists* and what problem it solves.
   Each section should hand off to the next ("Now look at what these two operations share…").
   The reader should never wonder why they're reading a section.
4. **Examples, in boxes.** Concrete worked examples for every non-trivial idea, always inside
   an Example box. Show the numbers.
5. **Explain hard concepts intuitively.** When something is subtle (the convolution sign
   flip, why central difference beats one-sided, batch-size blowup), stop and unpack it in
   plain language before or after the formal statement.
6. **Analogies for the tricky stuff.** If a first-timer would bounce off it, give an analogy
   or a "read it aloud" reframing. See the `x / a / x-a` role breakdown in `image_filtering_2.md`.
7. **Terminology follows the presentation PDF.** Always. If the lecture notes call it a
   "kernel" and the slides call it a "filter", the note says "filter". Mention the synonym
   once in parentheses if it's common, then move on.
8. **"Wait, why?" beats.** Short rhetorical questions that surface the reader's likely
   confusion, immediately followed by the answer (often in a Math Review or aside box).

### Voice — modelled on `blog/blog_vision_foundation.md`

This is the one style reference. Match it:

- First person, conversational, lightly wry. Contractions throughout. Reads like a sharp
  friend walking you through the lecture, not a textbook.
- Casual cold open — one or two sentences, then move ("So we are back to some very
  fundamental stuff.", "grab a cup of coffee and let's get to it.").
- Short declarative sentences. Frequent one-line paragraphs for emphasis ("(Spoiler, yes)",
  "So hold on tight.", "There are some very impressive results.").
- Rhetorical questions that voice the reader's doubt, answered right after ("Why, you ask?",
  "Could we do the same for X?").
- **Bold** for key terms and the load-bearing phrase in a sentence. Numbered lists for
  processes and step-by-step procedures.
- Motivation before mechanism in every section; explicit hand-offs between sections
  ("While ViT was revolutionary, the fuel that unlocked it was…").
- Close a section on its takeaway, often in an ❗ box.
- Dry, not zany — don't overdo the jokes.

---

## Rendering pipeline — hard constraints

These notes are Markdown, rendered in the browser by **`marked` v12** + **KaTeX 0.16.11**
via `coursenote/<area>/post.html` → `assets/js/coursenote-post.js` (a close copy of the blog's
`assets/js/blog-post.js`). That imposes rules:

- **Math delimiters:** `$…$` for inline, `$$…$$` for display. Math is pulled out into
  placeholders *before* Markdown parsing and swapped back *after*, so:
  - `_` and `*` inside math are safe (won't become emphasis).
  - Inline `$…$` **cannot span newlines** and **cannot contain a literal `$`**.
  - Display `$$…$$` **can** span multiple lines. Use it for `\begin{cases}`, `\begin{aligned}`.
    Prefer bare `$$…$$` on its own line (blank line above and below) over wrapping it in a `<p>`.
  - Math **does** render inside the HTML callout boxes on the site (the extraction runs on the
    raw text first). A plain Markdown preview such as VS Code's will **not** show `$…$` that
    sits inside a raw `<div>` — that's a preview limitation, not a bug; check the actual page
    (`coursenote/<area>/post.html?slug=<topic>`).
- **Markdown does NOT work inside block-level HTML.** Inside a `<div>` callout you must use
  HTML: `<b>`/`<strong>`, `<em>`, `<p>`, `<br>`, `<ul><li>`, and entities (`&sum;`, `&sigma;`,
  `<sub>`, `<sup>`). `**bold**` and `- bullets` render literally inside a div — don't use them there.
- **Single newlines join** into one paragraph (GFM, `breaks:false`). Blank line = new paragraph.
- **Raw HTML in the Markdown body is passed through** untouched — that's how the boxes work.
- **Images:** figures are supplied by Tianyi in `assets/img/coursenote/foundational_cv/<topic>/`
  (see "Source materials" — view them all before writing). The renderer page
  `coursenote/<area>/post.html` sits **two levels** below the repo root, so image paths start
  with `../../assets/…`:
  `![short alt text](../../assets/img/coursenote/foundational_cv/<topic>/foo.png)`. Put each
  image right after the paragraph that introduces its concept, then a one-line *italic* caption
  sentence underneath.
- **Anchors** (for the table of contents): `coursenote-post.js` adds a GitHub-style slug `id`
  to every heading after rendering, so TOC links like `#local-difference` and in-box
  cross-references work. Slug = lowercase, punctuation stripped, spaces → `-`
  (`## Local Difference` → `#local-difference`).

---

## Structure of a note

```
<1–3 plain sentences: hook + what problem this lecture solves>

<Table of Contents box>   ← only if the note has 4+ H2 sections

# <Topic Title>

## Motivations           ← why this exists, what breaks without it
## Scenario Setup        ← simplifying assumptions, notation, what we will/won't cover
## <concept 1>           ← build up from the simplest idea
## <concept 2>           ← each section motivated by the previous one
...
## <the payoff>          ← where the pieces combine
```

Use `---` horizontal rules to mark a "step back and look at what we have" transition.

---

## Callout box templates

Copy these verbatim; change only the title text and body. All boxes hard-code a light
background with `color: #333` (they stay light in dark mode — that's the existing convention,
keep it consistent).

### 💡 Definition — amber `#ffc107`
For definitions of terms and named functions.

```html
<div style="background-color: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em;">
    <span>💡</span>
    <strong>Definition: TERM</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 12px 0;">
  <p style="margin: 0;">The definition. Keep it to a sentence or two.</p>
</div>
```

`💡` is also used for "What is X?" concept explainers (same template, title becomes a question).

### 🧮 Example — green `#22c27d`
For every worked example. Show the actual numbers / cases.

```html
<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>🧮</span>
    <strong>Example: WHAT IT SHOWS</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #22c27d; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Setup, then the computation, then one line on what it demonstrates.</p>
</div>
```

### ➕ Math Review / intuition aside — blue `#227ac2`
For prerequisite math, "wait, why does this work?" derivations, and side-by-side comparisons.

```html
<div style="background-color: #e9eff9; border-left: 4px solid #227ac2; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #227ac2;">
    <span>➕</span>
    <strong>Math Review</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #227ac2; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">The derivation or reminder. Display math on its own line with $$…$$.</p>
</div>
```

### ❗ Important Takeaway — purple `#8e44ad`
For the one thing to remember from a section; paradigm shifts; central theses.

```html
<div style="background-color: #f5f0fa; border-left: 4px solid #8e44ad; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #8e44ad;">
    <span>❗</span>
    <strong>Important Takeaway</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #dcd0e8; margin: 12px 0;">
  <p style="margin: 0;">The takeaway, stated plainly.</p>
</div>
```

### ⚠️ Watch Out — red `#d32f2f`
For gotchas, common mistakes, costly subtleties, "this bites you when…".

```html
<div style="background-color: #fcf3f3; border-left: 4px solid #d32f2f; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #d32f2f;">
    <span>⚠️</span>
    <strong>Watch Out</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #f0d0d0; margin: 12px 0;">
  <p style="margin: 0;">The trap and how to avoid it.</p>
</div>
```

### Table of Contents — collapsible

```html
<details style="background-color: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin: 20px 0; font-family: sans-serif;">
  <summary style="font-weight: bold; cursor: pointer; font-size: 1.1em;">Table of Contents</summary>
  <ul style="margin-top: 16px; line-height: 1.8;">
    <li><a href="#section-slug" style="text-decoration: none; color: #333;">Section Label</a></li>
  </ul>
</details>
```

Multi-paragraph boxes: give the first `<p>` `margin: 0 0 10px 0` and the last `margin: 0`.
Bullets inside a box: `<ul style="margin: 0; padding-left: 20px;"><li>…</li></ul>`.

---

## Workflow checklist

1. List `assets/pdf/coursenote/foundational_cv/`, find the subfolder for `<topic>`, and read
   **every PDF in it, all pages**.
2. **View every image** in `assets/img/coursenote/foundational_cv/<topic>/` and note what
   each one shows and where it belongs.
3. Read `coursenote/lecture_notes/<topic>.md` (if it exists) for what's confusing / worth emphasising.
4. Build a terminology list from the **presentation PDF**. Note every slide/lecture-note
   mismatch and go with the slide term.
5. Draft to `coursenote/foundational_cv/<topic>.md`: motivation → setup → concepts in
   build-up order → payoff. Boxes for every definition, equation cluster, and example.
   Drop each figure in at the concept it illustrates, with a caption. Image paths start
   `../../assets/…`.
6. **Publish:** add the note to `data/coursenotes.js` (and, for a new area, create
   `coursenote/<area>/post.html`) — see "Publishing to the site".
7. Self-check:
   - Nothing from the slides or lecture notes silently dropped.
   - Every non-trivial claim has an example or an intuition.
   - Every image in the img subfolder is placed (or explicitly explained as omitted).
   - Terminology 100% matches the presentation PDF.
   - Math delimiters valid; no Markdown syntax stranded inside a `<div>`.
   - Section-to-section handoffs read smoothly.
   - `data/coursenotes.js` has the new note; `post.html?slug=<topic>` renders.
8. Report what was written and flag any terminology conflicts you resolved.

---

## How to prompt Claude for this (for future sessions)

Run `claude` from the repo root. Because this `CLAUDE.md` sits in
`coursenote/foundational_cv/`, Claude Code auto-loads it as soon as it touches a file in this
folder — you don't need to paste these rules each time.

**Normal use:** `/fcv-note <topic>` (e.g. `/fcv-note image_filtering`), or just type
`create foundational_cv lecture note for <topic>`. Nothing else needed — the sources are
found by convention.

Other useful prompts:
- `"Revise image_filtering.md — the Gaussian section is thin, add a worked example and an analogy for separability."`
- `"Check image_filtering.md terminology against the presentation PDF and fix mismatches."`
- `"Re-do the intro of image_filtering.md to sound more like blog_vision_foundation.md."`

For a one-off deviation from these rules, say so in the prompt and it overrides.
