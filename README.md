# DataFlick — Freelance Data Analyst portfolio

Personal site of **Akkarawin Saiprapakorn** — https://dataflicker.netlify.app/

Designed in Claude Design and published on Netlify as a static site (no build step).

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole site: SEO `<head>`, a hidden form Netlify detects, the Claude Design template (`<x-dc>`) and its component script |
| `support.js` | Claude Design runtime that renders the template with React |
| `vendor/` | Self-hosted React 18.3.1 (mapped in via `window.__resources`, so no CDN is needed) |
| `logo-intro.js` | Logo intro animation |
| `assets/` | Images (WebP), favicon, `og-image.png` (social share preview), `apple-touch-icon.png` |
| `favicon.ico` | Black logo for clients that ask for `/favicon.ico` directly (otherwise Netlify serves its own icon) |
| `robots.txt`, `sitemap.xml` | For Google and other search engines |
| `404.html` | Not-found page (Netlify serves it automatically) |
| `netlify.toml` | Netlify settings: publish folder, security headers, caching |

## Editing

- Text, projects and services live in the `<script type="text/x-dc" data-dc-script>` block near the bottom of `index.html` (English and Thai strings side by side).
- After any content change, update `<lastmod>` in `sitemap.xml`.

## Contact form (Netlify Forms)

- The visible form is rendered by JavaScript, so Netlify can't see it at deploy time. The hidden `<form name="contact" data-netlify="true">` just above `<x-dc>` is what registers it — keep its field names (`name`, `contact`, `service`, `message`) in sync with the visible form.
- Messages appear in Netlify under **Site → Forms → contact**. To get them by email: **Site configuration → Notifications → Emails and webhooks → Form submission notifications → Add notification → Email notification**.
- Spam protection: the hidden `bot-field` honeypot.

## Deploy on Netlify (first time)

1. Sign in at [app.netlify.com](https://app.netlify.com) with GitHub.
2. **Add new site → Import an existing project → GitHub →** pick `Akrwin/Akrwin.github.io`.
3. Leave the build command empty; publish directory `.` (both come from `netlify.toml`). Click **Deploy**.
4. **Site configuration → Change site name →** `dataflicker` (the site's links already point to `https://dataflicker.netlify.app/`; if that name is taken, update the URL in `index.html`, `robots.txt`, `sitemap.xml` and this README).
5. **Forms → Enable form detection**, then redeploy once so the `contact` form is registered.

After that, every push to `main` deploys automatically.

## Preview locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000/ (the contact form only works on Netlify).
