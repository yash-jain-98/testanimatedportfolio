# Animated portfolio

A responsive portfolio inspired by the supplied video: cream and olive colors, expressive typography, a floating illustrated developer, an ID card, a periodic-table skill explorer, project concepts, and a learning timeline.

## Develop

Open `index.html` directly for the complete interactive portfolio, including fonts and artwork. It also works in a single-file HTML preview without a development server.

Requires Node.js 20.19+ or 22.12+ (verified with Node.js 24).

```sh
npm ci
npm run dev
```

## Production

```sh
npm run build
npm run preview
```

Deploy the generated `dist/` directory to any static host. `npm run package:page` rebuilds the standalone `index.html` from the source files. This also runs automatically before `dev` and `build`. After editing sources during development, rerun `npm run package:page` to refresh the page.

## GitHub Pages

In the GitHub repository, source files live in `portfolio/`, alongside the existing cruise website. GitHub Pages serves the standalone site from the top-level `docs/` directory.

After editing the portfolio, run `npm run pages` from `portfolio/`, then commit both the source changes and regenerated `docs/` files. This includes `.nojekyll` and the bundled font licenses.

In repository **Settings → Pages**, choose **Deploy from a branch**, branch **main**, folder **/docs**, and save. The expected public URL is `https://yash-jain-98.github.io/testanimatedportfolio/` once GitHub finishes deployment.

## Personalize

- Update the name, bio, contact links, dummy ID details, and education timeline in `src/page.html`. The root `index.html` is generated, so edit the sources and run `npm run package:page`.
- Replace sample skills and concept projects in `src/content.js` with your actual experience. These are illustrative, not claims of completed client work.
- Replace `public/character.svg` with your own transparent character asset to match the reference more closely. The included asset is an original illustration, not the person in the video.
- Fonts are bundled locally with their open-source licenses; no external font service is required. No analytics, backend, keys, or secrets are needed.
- Speech begins after clicking the sound button or “Hear me say hello.” The bundled 8-second synthetic voice plays without a network service. Mouth movement follows amplitude cues from the audio; blinking and a hand gesture add expression. This is an animated SVG avatar, not a photorealistic video.

## Replace the placeholder introduction

Edit `src/intro.txt`, then run `npm run voice:generate`. This requires Python 3 and FFmpeg with the Flite filter. It creates `public/intro.mp3` and `public/intro-cues.json`, then repackages the standalone page. Normal installation and deployment use the committed audio and do not require these generation tools. A future recorded voice can also be paired with regenerated amplitude cues.

## Reference interactions

- Click the developer ID or its flip control to rotate between its portrait and dummy personal details. It demonstrates the flip once on scroll; manual interaction cancels that demonstration.
- Click the tall project spines to expand each project from right to left. Arrow keys select adjacent projects; closed panels are removed from keyboard navigation.
- The learning courses unfold individually. Timeline years jump to their matching milestones, and the vertical progress line follows scrolling.
- Achievement cards loop automatically when visible. Hover, keyboard focus, or switching tabs pauses playback. Arrows, dots, swipe gestures, and a pause button are available.
- Reduced-motion preferences disable decorative animation and carousel autoplay.

Includes keyboard skill selection, keyboard ID flipping, native modal focus handling, and mobile navigation. Personal details, education entries, achievements, and project concepts are sample content awaiting your real information.
