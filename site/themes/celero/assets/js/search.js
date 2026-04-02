(function () {
  const modal = document.getElementById("search-modal");
  const backdrop = document.getElementById("search-backdrop");
  const card = document.getElementById("search-card");
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");
  const trigger = document.getElementById("search-trigger");
  if (!modal || !input || !results) return;

  let data = [];
  let loaded = false;
  let active = -1;
  let items = [];

  // ── Data ──
  async function load() {
    if (loaded) return;
    try {
      const res = await fetch("/index.json");
      data = await res.json();
      loaded = true;
    } catch (e) {
      console.error("Search index load failed:", e);
    }
  }

  // ── Search ──
  function search(query) {
    if (!data.length) return [];
    const q = query.toLowerCase();
    const scored = [];
    for (const page of data) {
      const tl = page.title.toLowerCase();
      const cl = page.content.toLowerCase();
      const titleExact = tl === q;
      const titleStart = tl.startsWith(q);
      const titleMatch = tl.includes(q);
      const contentMatch = cl.includes(q);
      if (titleMatch || contentMatch) {
        scored.push({
          ...page,
          score: (titleExact ? 100 : 0) + (titleStart ? 50 : 0) + (titleMatch ? 20 : 0) + (contentMatch ? 5 : 0)
        });
      }
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  function highlight(text, query) {
    if (!query) return esc(text);
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return esc(text).replace(new RegExp(`(${escaped})`, "gi"), "<mark>$1</mark>");
  }

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function snippet(content, query, len) {
    const idx = content.toLowerCase().indexOf(query.toLowerCase());
    if (idx < 0) return content.substring(0, len);
    const start = Math.max(0, idx - 40);
    const raw = (start > 0 ? "..." : "") + content.substring(start, start + len);
    return highlight(raw, query);
  }

  // ── Render ──
  function render(matches, query) {
    if (!query || query.length < 2) {
      results.innerHTML = '<div class="px-5 py-10 text-center text-sm text-dim">Type to search across all documentation</div>';
      items = [];
      active = -1;
      return;
    }
    if (!matches.length) {
      results.innerHTML = `<div class="px-5 py-10 text-center">
        <div class="text-sm text-muted">No results for &ldquo;${esc(query)}&rdquo;</div>
        <div class="text-xs text-dim mt-1">Try different keywords</div>
      </div>`;
      items = [];
      active = -1;
      return;
    }

    // Group by section (parent path segment)
    const groups = {};
    for (const r of matches) {
      const parts = r.url.replace(/^\/docs\//, "").split("/");
      const section = parts.length > 1 ? parts[0].replace(/-/g, " ") : "docs";
      if (!groups[section]) groups[section] = [];
      groups[section].push(r);
    }

    let html = "";
    for (const [section, pages] of Object.entries(groups)) {
      html += `<div class="px-3 pt-3 pb-1"><span class="text-[11px] font-semibold uppercase tracking-wider text-dim px-2">${esc(section)}</span></div>`;
      for (const r of pages) {
        html += `<a href="${r.url}" data-search-item class="flex items-start gap-3 mx-2 px-3 py-2.5 rounded-lg transition-colors cursor-pointer group">
          <svg class="w-4 h-4 text-dim mt-0.5 shrink-0 group-hover:text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-text group-hover:text-accent transition-colors">${highlight(r.title, query)}</div>
            <div class="text-xs text-muted mt-0.5 leading-relaxed line-clamp-2">${snippet(r.content, query, 120)}</div>
          </div>
          <svg class="w-4 h-4 text-dim mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </a>`;
      }
    }
    results.innerHTML = html;
    items = [...results.querySelectorAll("[data-search-item]")];
    active = -1;
  }

  // ── Keyboard nav ──
  function setActive(idx) {
    items.forEach(el => el.classList.remove("search-result-active"));
    active = idx;
    if (idx >= 0 && idx < items.length) {
      items[idx].classList.add("search-result-active");
      items[idx].scrollIntoView({ block: "nearest" });
    }
  }

  // ── Open / Close ──
  function open() {
    load();
    modal.classList.remove("hidden");
    backdrop.classList.remove("search-backdrop-exit");
    backdrop.classList.add("search-backdrop-enter");
    card.classList.remove("search-modal-exit");
    card.classList.add("search-modal-enter");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => input.focus());
  }

  function close() {
    backdrop.classList.remove("search-backdrop-enter");
    backdrop.classList.add("search-backdrop-exit");
    card.classList.remove("search-modal-enter");
    card.classList.add("search-modal-exit");
    document.body.style.overflow = "";
    setTimeout(() => {
      modal.classList.add("hidden");
      input.value = "";
      render([], "");
    }, 150);
  }

  // Expose globally for mobile menu button
  window.openSearch = open;

  // ── Events ──
  if (trigger) trigger.addEventListener("click", open);
  backdrop.addEventListener("click", close);

  input.addEventListener("input", () => {
    const q = input.value.trim();
    render(search(q), q);
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Escape") { close(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(active < items.length - 1 ? active + 1 : 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(active > 0 ? active - 1 : items.length - 1);
    } else if (e.key === "Enter" && active >= 0 && items[active]) {
      e.preventDefault();
      items[active].click();
    }
  });

  document.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      modal.classList.contains("hidden") ? open() : close();
    }
  });
})();
