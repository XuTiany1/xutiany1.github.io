/* ============================================================
   Single course-note renderer. Reads ?slug=... from the URL and
   window.CN_AREA (set by the area's post.html), looks the note up
   in data/coursenotes.js, fetches the markdown, and renders it
   (LaTeX via KaTeX) into #post-body.

   Mirrors assets/js/blog-post.js. Two differences:
   - the note is resolved by (area, slug) instead of a flat slug
   - headings get slug ids after render, so the in-page Table of
     Contents links actually jump.
   ============================================================ */

(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s)
    .replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  if (window.CONFIG && CONFIG.accent) {
    document.documentElement.style.setProperty("--accent", CONFIG.accent);
  }

  const areaSlug = window.CN_AREA || new URLSearchParams(location.search).get("area");
  const slug = new URLSearchParams(location.search).get("slug");

  const areas = (typeof COURSE_NOTES !== "undefined" && COURSE_NOTES.areas) ? COURSE_NOTES.areas : [];
  const area = areas.find(a => a.slug === areaSlug);
  const note = area && (area.notes || []).find(n => n.slug === slug);

  const titleEl = $("#post-title");
  const dateEl = $("#post-date");
  const bodyEl = $("#post-body");
  const crumbEl = $("#post-area");

  if (!note) {
    document.title = "Note not found";
    titleEl.textContent = "Note not found";
    if (dateEl) dateEl.remove();
    bodyEl.textContent = "That course note doesn't exist.";
  } else {
    document.title = `${note.title} — ${area.title}`;
    titleEl.textContent = note.title;
    if (dateEl) dateEl.textContent = note.date || "";
    if (crumbEl) crumbEl.textContent = area.title;
    bodyEl.innerHTML = '<p class="post-loading">Loading…</p>';

    fetch(`../../${note.file}`)
      .then(r => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.text();
      })
      .then(md => renderMarkdown(md))
      .catch(err => {
        bodyEl.innerHTML = `<p class="post-loading">Couldn't load this note (${esc(err.message)}).</p>`;
      });
  }

  /* ---------------- render ----------------
     Math is pulled out into placeholders BEFORE the markdown parser
     runs (so underscores/asterisks inside LaTeX never get mistaken
     for markdown emphasis, even inside the HTML callout boxes), then
     swapped back in as KaTeX-rendered HTML afterward. */
  function renderMarkdown(raw) {
    const math = [];
    const stash = (latex, display) => {
      const i = math.length;
      math.push({ latex, display });
      return `@@MATH${i}@@`;
    };

    let text = raw
      .replace(/\$\$([\s\S]+?)\$\$/g, (_, latex) => stash(latex.trim(), true))
      .replace(/\$([^\n$]+?)\$/g, (_, latex) => stash(latex.trim(), false));

    let html = window.marked ? marked.parse(text) : `<pre>${esc(text)}</pre>`;

    html = html.replace(/@@MATH(\d+)@@/g, (_, i) => {
      const { latex, display } = math[i];
      if (!window.katex) return esc(display ? `$$${latex}$$` : `$${latex}$`);
      try {
        return katex.renderToString(latex, { throwOnError: false, displayMode: display });
      } catch (e) {
        return esc(display ? `$$${latex}$$` : `$${latex}$`);
      }
    });

    bodyEl.innerHTML = html;
    addHeadingIds();
  }

  /* Give every heading a GitHub-style slug id so the Table of
     Contents anchors (and in-box cross-references) resolve. */
  function addHeadingIds() {
    const seen = Object.create(null);
    const slugify = (s) => s.toLowerCase().trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    bodyEl.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach(h => {
      let id = slugify(h.textContent || "");
      if (!id) return;
      if (seen[id] != null) { seen[id] += 1; id = `${id}-${seen[id]}`; }
      else { seen[id] = 0; }
      h.id = id;
    });
  }

  /* ---------------- theme (mirrors assets/js/site.js) ---------------- */
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  root.setAttribute("data-theme", saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

  const toggle = $("#toggle-theme");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }
})();
