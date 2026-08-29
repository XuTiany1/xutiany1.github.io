/* ============================================================
   Blog list page. Reads data/blogs.js.
   ============================================================ */

(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s)
    .replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  if (window.CONFIG && CONFIG.accent) {
    document.documentElement.style.setProperty("--accent", CONFIG.accent);
  }

  function itemHTML(b) {
    return `
      <a class="blog-item" href="post.html?slug=${encodeURIComponent(b.slug)}">
        <p class="blog-item-date">${esc(b.date)}</p>
        <p class="blog-item-title">${esc(b.title)}</p>
        ${b.excerpt ? `<p class="blog-item-excerpt">${esc(b.excerpt)}</p>` : ""}
      </a>`;
  }

  const list = $("#blog-list");
  const posts = typeof BLOGS !== "undefined" ? BLOGS : [];
  list.innerHTML = posts.length
    ? posts.map(itemHTML).join("")
    : `<div class="blog-empty">No posts yet.</div>`;

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
