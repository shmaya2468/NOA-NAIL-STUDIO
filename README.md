# NOA NAIL STUDIO

Marketing website for NOA NAIL STUDIO — a boutique gel manicure/pedicure studio.
Hebrew (RTL), built with Vite, vanilla JavaScript, and GSAP.

## Stack

- [Vite](https://vitejs.dev/) — build tooling and dev server
- Vanilla JS (ES modules)
- [GSAP](https://gsap.com/) + ScrollTrigger + SplitText — scroll animation
- [Lenis](https://github.com/darkroomengineering/lenis) — smooth scrolling (desktop)
- Deployed on [Netlify](https://www.netlify.com/), with Netlify Forms handling the contact form

## Getting started

```bash
npm install
npm run dev       # dev server with live reload
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

## Project structure

```
index.html              Page markup
src/style.css            All styles (design tokens + components)
src/main.js               Entry point — wires up all modules
src/modules/              One module per feature (gallery, hero, forms, ...)
src/assets/                Optimized images/video actually used by the site
public/                    Static files served as-is (favicon, etc.)
```
