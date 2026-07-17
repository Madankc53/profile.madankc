# madankc.com.np — profile site

A static site, no build step. Plain HTML/CSS/JS + Three.js (WebGL hero) + GSAP (scroll animation), both loaded from CDN. This means Cloudflare Pages needs **zero build configuration** — it just serves the files.

## 1. Before you deploy

- Replace `assets/profile.jpg` with your real photo (currently a placeholder). Square-ish or portrait (4:5) crops work best, at least 800px wide.
- Swap `hello@madankc.com.np` in `index.html` for whichever email you actually want listed.
- Everything else (DG Link Network, thenepal.io, the builds grid) is written from what you told me — check it over and adjust any wording, numbers, or claims you want to change.

## 2. Push to GitHub

```bash
cd madankc-profile
git init
git add .
git commit -m "Initial profile site"
gh repo create madankc-profile --public --source=. --push
# or, without gh CLI:
# git remote add origin https://github.com/<your-username>/madankc-profile.git
# git branch -M main
# git push -u origin main
```

## 3. Connect Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Pick the `madankc-profile` repo.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`
4. Deploy. You'll get a `*.pages.dev` URL to confirm it works.

## 4. Point madankc.com.np at it

In the Pages project → **Custom domains** → **Set up a custom domain** → enter `madankc.com.np` (and `www.madankc.com.np` if you want both).

- If your domain's nameservers are already on Cloudflare, this is one click — Cloudflare adds the DNS record for you.
- If not, add the CNAME record Cloudflare shows you at your current DNS provider, pointing `madankc.com.np` to your `*.pages.dev` address.

DNS can take a few minutes to a few hours to propagate.

## 5. From then on

Every `git push` to `main` auto-deploys. No dashboard steps needed after the first setup.

## Structure

```
index.html        — all page content/sections
css/style.css      — design tokens + all styling
js/hero.js         — WebGL network hero (Three.js)
js/main.js         — scroll reveals, cursor, nav (GSAP)
assets/profile.jpg — your photo (replace this)
```

## Notes on the design

- Palette: deep pine-slate background, amber = fiber-optic signal, teal = data/water — tied to what you actually do, not a generic dark theme.
- The hero is a live WebGL network graph on a hill-shaped terrain grid — literal, not decorative: nodes connected by lines with light pulses traveling along them, like packets on fiber.
- Respects `prefers-reduced-motion` — animations calm down automatically for anyone with that OS setting on.
- Fully responsive; the builds grid and venture cards collapse to single columns under ~800px.
