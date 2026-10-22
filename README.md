# Austin Yu — Data Analytics & Data Science Portfolio

Source for **https://freedomvace.github.io/austinykw.github.io/** — case studies in analytics,
forecasting and machine learning.

Built with [Astro](https://astro.build) as a static site and deployed to GitHub Pages by GitHub Actions.

## Run locally

```bash
npm install
npm run dev        # http://localhost:4321/austinykw.github.io/
npm run verify     # type-check + build + internal link check
```

## Structure

```
src/
  content/projects/*.md   one file per project → card + case-study page (schema: src/content.config.ts)
  data/profile.ts         name, links, skills, about text, résumé entries
  pages/                  home, about, projects, projects/[slug], resume, contact, 404
  components/ layouts/    shared UI
  styles/global.css       design tokens (light + dark) and base styles
public/                   static files (images, favicon, résumé PDF)
scripts/                  link checker, confidentiality scanner
```

### Add a project

1. Copy `src/content/projects/_template.md` to `src/content/projects/<slug>.md`.
2. Fill in the front matter (`skills` must use the tags in `SKILLS`, `src/data/profile.ts`).
3. Write the case study in Markdown. `npm run verify` fails on schema errors or broken links.

### Common edits

| Change | Where |
|---|---|
| Show an email address | `profile.links.email` |
| Turn on the contact form | `profile.links.formspreeId` (Formspree form ID) |
| Add a résumé PDF | put it in `public/`, set `profile.links.resumePdf` |
| Add work experience | `resume.experience` in `src/data/profile.ts` |
| Serve from a different URL | `BASE_PATH` / `SITE_URL` in `astro.config.mjs` |

## Confidentiality

Several projects are based on confidential employer work. Public pages use only public or synthetic
data, and each project states which. `scripts/scan-confidential.mjs` checks `src/`, `public/` and the
built site against a **private** denylist kept outside the repo (`~/.portfolio-denylist.txt`), and
the pre-push hook in `.githooks/` runs it automatically
(`git config core.hooksPath .githooks`). Never commit the denylist.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`: type-check, build, link check, optional
confidentiality scan, then deploy. One-time setup: **Settings → Pages → Source: GitHub Actions**.
