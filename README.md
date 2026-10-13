# DataFlick — Freelance Data Analyst portfolio

Personal site of **Akkarawin Saiprapakorn** — https://akrwin.github.io/

Designed in Claude Design and published as a static site on GitHub Pages (no build step).

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole site: SEO `<head>` + the Claude Design template (`<x-dc>`) and its component script |
| `support.js` | Claude Design runtime that renders the template with React |
| `vendor/` | Self-hosted React 18.3.1 (mapped in via `window.__resources`, so no CDN is needed) |
| `logo-intro.js` | Logo intro animation |
| `assets/` | Images (WebP), favicon, `og-image.png` (social share preview), `apple-touch-icon.png` |
| `robots.txt`, `sitemap.xml` | For Google and other search engines |
| `404.html` | Not-found page |
| `.nojekyll` | Tells GitHub Pages to serve files as-is |

## Editing

- Text, projects and services live in the `<script type="text/x-dc" data-dc-script>` block near the bottom of `index.html` (English and Thai strings side by side).
- The contact form posts to [FormSubmit](https://formsubmit.co) and forwards to `ak4rawinss@gmail.com`. The first submission sends a one-time **Activate** email — click it, or messages won't be delivered.
- After any content change, update `<lastmod>` in `sitemap.xml`.

## Deploy

Push to `main` — GitHub Pages publishes automatically within a minute or two.

## Preview locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000/
