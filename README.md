# Claudopus vs Astralisk

A small, mobile-friendly, turn-based code-review battle between two AI-inspired pocket monsters. Choose a side, use four moves, and fight the CPU until one creature faints. Sound is optional and starts muted. No server, account, build, runtime dependencies, CDN, or API keys.

## Play

Open `index.html` directly in a browser, or serve this folder with any static web server. All assets are local and all URLs are relative, so it also works in a GitHub Pages repository subdirectory.

## GitHub Pages

1. Put **the contents of this folder**, including `assets/` and `.nojekyll`, in your repository's root (or its `docs/` folder).
2. In the repository, open **Settings → Pages**, choose **Deploy from a branch**, select your branch and the root folder (or `/docs`), and save.
3. Open the Pages URL shown by GitHub once deployment finishes. The same URL works on phones.

Do not upload the ZIP as a single file: extract it and upload its contents. Nothing needs compilation. The demo itself makes no network requests except to load its own local files.

## Combat

Each side has 180 HP. You move first; the rival then responds. An attack's power has a small random variation. Guards reduce the next damaging hit and then expire. Confidence increases damage by 18% per stage, up to three stages. Request Changes removes one confidence stage. Healing is capped at maximum HP. Every move has limited PP; Struggle becomes available if all PP is spent. Recoil can produce a double knockout.

- **Claudopus:** One Small Caveat (21 power + 25% guard), Request Changes (34 power + confidence reduction), Regression Suite (65% guard), Fresh Context (+44 HP).
- **Astralisk:** Works on My Machine (27 power), This Fixes It! (+1 confidence, 50% chance of 30-power attack), One More Patch (35 power, 6 recoil), Restart the IDE (+44 HP).

The CPU heals at low HP, otherwise mixes attacks, guarding, and confidence boosts. It never uses exhausted moves. Choose side during a battle to abandon it; no delayed enemy turn carries into the next fight.

## Files

`engine.js` contains the pure combat rules; `game.js` connects them to the page. The illustrated sprite atlas in `assets/creatures.png` was generated for this demo. This is an unofficial fan-made game with original AI-inspired creatures, not an official Pokémon product.

## Check the rules

With Node.js installed, run `node tests/engine.test.cjs`. This covers shielding, failed confidence attacks, confidence reduction, capped healing, exhausted PP, recoil draws, post-knockout lockout, and 200 complete simulated battles. Node.js is only needed for this optional check, not for playing or hosting the game.

Pages setup reference: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
