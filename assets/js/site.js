/* ============================================================
   Rendering logic. Reads data/config.js, data/news.js and
   data/publications.js. You shouldn't need to edit this file.
   ============================================================ */

(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s)
    .replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const fullName = `${CONFIG.firstName} ${CONFIG.lastName}`;

  /* ---------------- header + bio ---------------- */
  document.title = fullName;
  if (CONFIG.accent) {
    document.documentElement.style.setProperty("--accent", CONFIG.accent);
  }
  $("#first-name").textContent = CONFIG.firstName;
  $("#last-name").textContent = CONFIG.lastName;

  $("#bio").innerHTML =
    `<img class="photo" src="${esc(CONFIG.photo)}" alt="${esc(fullName)}" onerror="this.style.display='none'">` +
    CONFIG.bio.map(p => `<p>${p}</p>`).join("");

  /* ---------------- news ---------------- */
  function newsItemHTML(n) {
    const tag = n.tag ? ` <span class="update-tag">${esc(n.tag)}</span>` : "";
    const title = n.url
      ? `<a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.title)}</a>${tag}`
      : `${esc(n.title)}${tag}`;
    return `
      <div class="update${n.pinned ? " pinned" : ""}">
        <p class="update-date">${esc(n.date)}</p>
        <p class="update-title">${title}</p>
        ${n.desc ? `<p class="update-desc">${esc(n.desc)}</p>` : ""}
      </div>`;
  }

  function renderNews(expanded) {
    const box = $("#news");
    if (!CONFIG.showNews || typeof NEWS === "undefined" || !NEWS.length) {
      box.remove();
      return;
    }
    const limit = expanded ? NEWS.length : (CONFIG.newsVisible || NEWS.length);
    const shown = NEWS.slice(0, limit);
    const hidden = NEWS.length - shown.length;

    box.innerHTML =
      `<div class="updates-head"><span class="dot"></span>${esc(CONFIG.newsHeading || "Updates")}</div>` +
      shown.map(newsItemHTML).join("") +
      (hidden > 0
        ? `<button class="updates-more" id="news-more">Show ${hidden} more</button>`
        : (expanded && NEWS.length > (CONFIG.newsVisible || 0)
            ? `<button class="updates-more" id="news-less">Show less</button>` : ""));

    const more = $("#news-more"), less = $("#news-less");
    if (more) more.addEventListener("click", () => renderNews(true));
    if (less) less.addEventListener("click", () => renderNews(false));
  }
  renderNews(false);

  /* ---------------- publications ---------------- */
  const authorsHTML = (str) => esc(str).replace(/\{me\}/g, `<u>${esc(fullName)}</u>`);

  function paperHTML(p, i) {
    const thumb = p.thumb
      ? `<img class="thumb" src="${esc(p.thumb)}" alt="" onerror="this.outerHTML='<div class=\\'thumb-fallback\\'>no preview</div>'">`
      : `<div class="thumb-fallback">no preview</div>`;
    const badge = p.badge ? `<div class="badge">${esc(p.badge)}</div>` : "";
    const note = p.note ? ` <span class="pub-note">${esc(p.note)}</span>` : "";
    const links = (p.links || [])
      .map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("");

    return `
      <article class="pub" id="paper-${i}">
        <div class="pub-media">${badge}${thumb}</div>
        <div>
          <h3 class="pub-title">${esc(p.title)}</h3>
          <p class="pub-authors">${authorsHTML(p.authors)}</p>
          <p class="pub-venue">${esc(p.venue)}${note}</p>
          ${links ? `<div class="pub-links">${links}</div>` : ""}
        </div>
      </article>`;
  }

  function renderPapers(tab) {
    $("#pub-list").innerHTML = PUBLICATIONS
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => tab === "all" || p.selected)
      .map(({ p, i }) => paperHTML(p, i))
      .join("");
  }

  if (CONFIG.social && CONFIG.social.scholar) {
    $("#scholar-note").innerHTML =
      `For a complete list of publications, please visit my <a href="${esc(CONFIG.social.scholar)}" target="_blank" rel="noopener">Google Scholar</a>.`;
  } else {
    $("#scholar-note").remove();
  }

  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(b => b.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");
      renderPapers(btn.dataset.tab);
    });
  });
  renderPapers("selected");

  /* ---------------- footer ---------------- */
  const ICONS = {
    email:    '<svg viewBox="0 0 24 24"><path d="M2 4h20v16H2V4zm2 2v.4l8 5 8-5V6H4zm16 3.1l-7.4 4.6a1 1 0 0 1-1.2 0L4 9.1V18h16V9.1z"/></svg>',
    github:   '<svg viewBox="0 0 24 24"><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.9 10.9c.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.8 2.7 1.3 3.4 1 .1-.7.4-1.3.7-1.5-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.3 11.3 0 0 1 6 0C17.5 4.8 18.5 5.1 18.5 5.1c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z"/></svg>',
    scholar:  '<svg viewBox="0 0 24 24"><path d="M12 2L1 8l11 6 9-4.9V17h2V8L12 2zM5 13.2V17c0 2.2 3.1 4 7 4s7-1.8 7-4v-3.8l-7 3.8-7-3.8z"/></svg>',
    twitter:  '<svg viewBox="0 0 24 24"><path d="M18.9 2H22l-7 8 8.2 12h-6.4l-5-7.3L5.9 22H2.8l7.5-8.6L2.4 2h6.6l4.5 6.7L18.9 2zm-1.1 18h1.7L7.3 3.8H5.5L17.8 20z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24"><path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.3 8.2h4.4V24H.3V8.2zm7.5 0h4.2v2.2h.1c.6-1.1 2-2.3 4.2-2.3 4.5 0 5.3 2.9 5.3 6.7V24h-4.4v-7.3c0-1.7 0-4-2.4-4s-2.8 1.9-2.8 3.9V24H7.8V8.2z"/></svg>'
  };
  const LABELS = { email: "Email", github: "GitHub", scholar: "Google Scholar", twitter: "X", linkedin: "LinkedIn" };

  $("#social").innerHTML = Object.entries(CONFIG.social)
    .filter(([k, v]) => v && ICONS[k])
    .map(([k, v]) => {
      const href = k === "email" ? `mailto:${v}` : v;
      const ext = k === "email" ? "" : ' target="_blank" rel="noopener"';
      return `<a href="${esc(href)}" title="${LABELS[k]}" aria-label="${LABELS[k]}"${ext}>${ICONS[k]}</a>`;
    }).join("");

  /* ---------------- theme ---------------- */
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  root.setAttribute("data-theme", saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

  $("#toggle-theme").addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  /* ---------------- search ---------------- */
  $("#kbd-hint").textContent =
    /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? "⌘ k" : "ctrl k";

  const overlay = $("#overlay"), input = $("#search-input"), results = $("#results");
  const openSearch = () => { overlay.classList.add("open"); input.value = ""; search(""); input.focus(); };
  const closeSearch = () => overlay.classList.remove("open");

  function search(q) {
    const term = q.trim().toLowerCase();
    const hits = PUBLICATIONS
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => !term || `${p.title} ${p.authors} ${p.venue}`.toLowerCase().includes(term));
    results.innerHTML = hits.length
      ? hits.map(({ p, i }) =>
          `<li><a href="#paper-${i}">${esc(p.title)}<small>${esc(p.venue)}</small></a></li>`).join("")
      : `<li class="empty">No papers match that.</li>`;
  }

  input.addEventListener("input", e => search(e.target.value));
  results.addEventListener("click", e => {
    if (!e.target.closest("a")) return;
    document.querySelector('.tab[data-tab="all"]').click();   // make sure the paper is visible
    closeSearch();
  });
  $("#open-search").addEventListener("click", openSearch);
  overlay.addEventListener("click", e => { if (e.target === overlay) closeSearch(); });
  document.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
    if (e.key === "Escape") closeSearch();
  });
})();