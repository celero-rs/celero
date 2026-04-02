# Celero Documentation Site

Documentation and landing page for the Celero framework, built with [Hugo](https://gohugo.io/) and [Tailwind CSS v4](https://tailwindcss.com/).

## Prerequisites

- [Hugo](https://gohugo.io/installation/) (extended edition, v0.120+)
- [Node.js](https://nodejs.org/) (v18+)

## Quick Start

```bash
# Install dependencies
npm install

# Build CSS + start dev server
npm run dev
```

The site will be available at `http://localhost:1313/`.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start CSS watcher + Hugo dev server |
| `npm run build` | Production build (CSS + Hugo with minification) |
| `npm run css:dev` | Watch and rebuild CSS on changes |
| `npm run css:build` | One-time CSS build |

## Project Structure

```
site2/
├── content/                 # Markdown content
│   ├── _index.md            # Home page
│   └── docs/                # Documentation sections
├── assets/css/              # Compiled CSS (generated, git-ignored)
├── static/images/           # Benchmark charts and images
├── themes/celero/           # Hugo theme
│   ├── layouts/
│   │   ├── _default/        # Base layout, fallback templates, search index
│   │   ├── docs/            # Docs single + list layouts (sidebar + TOC)
│   │   ├── partials/        # navbar, footer, landing, sidebar, toc, head
│   │   └── index.html       # Home page (renders landing partial)
│   └── assets/
│       ├── css/main.css     # Tailwind v4 source (theme tokens, prose, components)
│       └── js/              # main.js (theme toggle, copy, animations), search.js
├── hugo.yaml                # Hugo configuration
├── package.json             # Node dependencies and scripts
└── postcss.config.mjs       # PostCSS config (@tailwindcss/postcss)
```

## Adding Content

All documentation lives in `content/docs/`. Each section has an `_index.md` with a `weight` field that controls sidebar ordering.

```bash
# Add a new doc page
cat > content/docs/guide/new-page.md << 'EOF'
---
title: "New Page"
weight: 10
---

Your content here.
EOF
```

## Production Build

```bash
npm run build
```

Output is generated in `public/`. Deploy the contents of that directory to any static hosting provider (Netlify, Vercel, Cloudflare Pages, GitHub Pages).
