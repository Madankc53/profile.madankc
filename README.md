# profile.madankc.com.np

A static site, no build step. Plain HTML/CSS/JS + Three.js (WebGL hero with bloom) + GSAP (scroll animation) + Lenis (smooth scroll), all loaded from CDN. Cloudflare Pages needs **zero build configuration** — it just serves the files.

## 1. Before you deploy

- Replace `assets/profile.jpg` with your real photo (currently a placeholder — your upload didn't come through on my end, so drop the real file in here). Portrait crop (4:5), at least 800px wide, works best.
- Everything else — the six project cards and six social links — is pulled straight from what you gave me. Skim it once for typos, especially the WhatsApp number and handles.

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

## 4. Point profile.madankc.com.np at it

In the Pages project → **Custom domains** → **Set up a custom domain** → enter `profile.madankc.com.np`.

- If your domain's nameservers are already on Cloudflare, this is one click.
- If not, add the CNAME record Cloudflare shows you at your current DNS provider.

## 5. From then on

Every `git push` to `main` auto-deploys.

## Structure

```
index.html        — hero, projects grid, connect/socials grid
css/style.css      — design tokens + all styling
js/hero.js         — WebGL network hero (Three.js + bloom)
js/main.js         — loader, scroll reveals, cursor, magnetic buttons, Lenis
assets/profile.jpg — your photo (replace this)
```

## What's in it

- Hero: your name, the badge (10+ years ISP experience), your photo, and a live WebGL fiber-network scene behind it all (bloom-lit nodes and pulses on a terrain grid).
- A scrolling marquee of your actual stack (BDCOM, Huawei OLT, MikroTik, GPON/EPON).
- Projects — all six of your real sites/tools, each card linking straight out.
- Connect — all six social links (GitHub, LinkedIn, YouTube, X, Facebook, WhatsApp).
- Loader sequence, kinetic title reveal, word-by-word scroll reveals, magnetic buttons, trailing cursor, subtle 3D tilt on cards — the same interaction layer as before, retargeted at this content.
- Respects `prefers-reduced-motion` throughout.
