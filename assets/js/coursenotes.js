/* ============================================================
   Course-notes index page. Reads data/coursenotes.js and lists
   every area with its notes. Mirrors assets/js/blog.js.
   ============================================================ */

(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s)
    .replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  if (window.CONFIG && CONFIG.accent) {
    document.documentElement.style.setProperty("--accent", CONFIG.accent);
  }

  function noteHTML(areaSlug, n) {
    return `
      <a class="blog-item" href="${encodeURIComponent(areaSlug)}/post.html?slug=${encodeURIComponent(n.slug)}">
        <p class="blog-item-date">${esc(n.date)}</p>
        <p class="blog-item-title">${esc(n.title)}</p>
        ${n.excerpt ? `<p class="blog-item-excerpt">${esc(n.excerpt)}</p>` : ""}
      </a>`;
  }

  function areaHTML(a) {
    const notes = (a.notes || []).slice();
    return `
      <section class="cn-area">
        <h3 class="cn-area-title">${esc(a.title)}</h3>
        ${a.blurb ? `<p class="cn-area-blurb">${esc(a.blurb)}</p>` : ""}
        <div class="blog-list">
          ${notes.length ? notes.map(n => noteHTML(a.slug, n)).join("") : `<div class="blog-empty">No notes yet.</div>`}
        </div>
      </section>`;
  }

  const wrap = $("#cn-areas");
  const areas = (typeof COURSE_NOTES !== "undefined" && COURSE_NOTES.areas) ? COURSE_NOTES.areas : [];
  wrap.innerHTML = areas.length
    ? areas.map(areaHTML).join("")
    : `<div class="blog-empty">No course notes yet.</div>`;

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
