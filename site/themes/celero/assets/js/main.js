// ── Theme toggle ──
(function () {
  const toggle = document.getElementById("theme-toggle");
  function update() {
    const light = document.documentElement.classList.contains("light");
    document.querySelectorAll(".dark-icon").forEach(el => (el.style.display = light ? "none" : "block"));
    document.querySelectorAll(".light-icon").forEach(el => (el.style.display = light ? "block" : "none"));
  }
  if (toggle) {
    toggle.addEventListener("click", () => {
      document.documentElement.classList.toggle("light");
      localStorage.setItem("theme", document.documentElement.classList.contains("light") ? "light" : "dark");
      update();
    });
  }
  update();
})();

// ── Mobile menu ──
(function () {
  const btn = document.getElementById("mobile-menu-btn");
  const menu = document.getElementById("mobile-menu");
  if (btn && menu) btn.addEventListener("click", () => menu.classList.toggle("hidden"));
})();

// ── Mobile sidebar ──
(function () {
  const btn = document.getElementById("sidebar-open");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (!btn || !sidebar) return;
  function open() {
    sidebar.classList.remove("-translate-x-full");
    overlay && overlay.classList.remove("hidden");
  }
  function close() {
    sidebar.classList.add("-translate-x-full");
    overlay && overlay.classList.add("hidden");
  }
  btn.addEventListener("click", open);
  overlay && overlay.addEventListener("click", close);
})();

// ── Sidebar section toggle ──
document.querySelectorAll(".sidebar-section").forEach(section => {
  const btn = section.querySelector(".sidebar-toggle");
  const items = section.querySelector(".sidebar-items");
  const chevron = section.querySelector(".sidebar-chevron");
  if (!btn || !items) return;
  btn.addEventListener("click", () => {
    items.classList.toggle("hidden");
    if (chevron) chevron.classList.toggle("rotate-90");
  });
});

// ── Code copy buttons ──
document.querySelectorAll(".highlight").forEach(block => {
  const wrapper = document.createElement("div");
  wrapper.className = "code-block-wrapper relative";
  block.parentNode.insertBefore(wrapper, block);
  wrapper.appendChild(block);
  const btn = document.createElement("button");
  btn.className = "copy-btn";
  btn.textContent = "Copy";
  btn.addEventListener("click", () => {
    const code = block.querySelector("code");
    if (code) {
      navigator.clipboard.writeText(code.textContent);
      btn.textContent = "Copied!";
      setTimeout(() => (btn.textContent = "Copy"), 2000);
    }
  });
  wrapper.appendChild(btn);
});

// ── TOC active tracking ──
(function () {
  const links = document.querySelectorAll(".toc-content a");
  if (!links.length) return;
  const headings = [];
  links.forEach(link => {
    const id = link.getAttribute("href")?.slice(1);
    const el = id && document.getElementById(id);
    if (el) headings.push({ el, link });
  });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const match = headings.find(h => h.el === entry.target);
      if (match) {
        links.forEach(l => l.classList.remove("active"));
        match.link.classList.add("active");
      }
    });
  }, { rootMargin: "-80px 0px -80% 0px" });
  headings.forEach(h => obs.observe(h.el));
})();

// ── Scroll fade-in ──
(function () {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-fade-in-up");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll("[data-animate]").forEach(el => obs.observe(el));
})();

// ── Cmd+K is handled by search.js ──
