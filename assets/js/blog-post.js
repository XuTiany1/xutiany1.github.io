/* ============================================================
   Single blog post renderer. Reads ?slug=... from the URL,
   looks it up in data/blogs.js, fetches the markdown file,
   and renders it (with LaTeX math via KaTeX) into #post-body.
   ============================================================ */

(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s)
    .replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  if (window.CONFIG && CONFIG.accent) {
    document.documentElement.style.setProperty("--accent", CONFIG.accent);
  }

  const slug = new URLSearchParams(location.search).get("slug");
  const post = (typeof BLOGS !== "undefined" ? BLOGS : []).find(b => b.slug === slug);

  const titleEl = $("#post-title");
  const dateEl = $("#post-date");
  const bodyEl = $("#post-body");

  if (!post) {
    document.title = "Post not found";
    titleEl.textContent = "Post not found";
    dateEl.remove();
    bodyEl.textContent = "That blog post doesn't exist.";
  } else {
    document.title = post.title;
    titleEl.textContent = post.title;
    dateEl.textContent = post.date || "";
    bodyEl.innerHTML = '<p class="post-loading">Loading…</p>';

    fetch(`../${post.file}`)
      .then(r => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.text();
      })
      .then(md => renderMarkdown(md))
      .catch(err => {
        bodyEl.innerHTML = `<p class="post-loading">Couldn't load this post (${esc(err.message)}).</p>`;
      });
  }

  /* ---------------- render ----------------
     Math is pulled out into placeholders BEFORE the markdown parser
     runs (so underscores/asterisks inside LaTeX, e.g. x_{class},
     never get mistaken for markdown emphasis), then swapped back in
     as KaTeX-rendered HTML afterward. */
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

    let html = window.marked ? marked.parse(text) : escapeHtml(text);

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
  }

  function escapeHtml(s) {
    return `<pre>${esc(s)}</pre>`;
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
