# Claudopus vs Astralisk

A small, mobile-friendly, turn-based code-review battle between two AI-inspired pocket monsters. Choose a side, use four moves, and fight the CPU until one creature faints. Battle music starts when you choose a creature; the Sound button mutes both music and effects. Music loops during the fight and stops at the result or side-selection screen. It pauses when the tab is hidden. No server, account, build, runtime dependencies, CDN, or API keys.

## Play

Open `index.html` directly in a browser, or serve this folder with any static web server. All assets are local and all URLs are relative, so it also works in a GitHub Pages repository subdirectory.

## GitHub Pages

1. Put **the contents of this folder**, including `assets/` and `.nojekyll`, in your repository's root (or its `docs/` folder).
2. In the repository, open **Settings → Pages**, choose **Deploy from a branch**, select your branch and the root folder (or `/docs`), and save.
3. Open the Pages URL shown by GitHub once deployment finishes. The same URL works on phones.

Do not upload the ZIP as a single file: extract it and upload its contents. Nothing needs compilation. The demo itself makes no network requests except to load its own local files.

## Music

Claudopus uses `assets/claudopus-battle.mp3` (track 1, 2:00); Astralisk uses `assets/astralisk-battle.mp3` (track 2, 1:59). The tracks were supplied by the project owner. Music is loaded only when entering a battle, at 40% volume. Browser autoplay restrictions are handled by letting the player enable sound with the Sound button.

## Combat

Each side has 180 HP. You move first; each attack report stays on screen until you press Continue (or focus the button and use Enter/Space). Then the rival responds. Both reports must be acknowledged before choosing the next move. An attack's power has a small random variation. Guards reduce the next damaging hit and then expire. Confidence increases damage by 18% per stage, up to three stages. Request Changes removes one confidence stage. Healing is capped at maximum HP. Every move has limited PP; Struggle becomes available if all PP is spent. Recoil can produce a double knockout.

- **Claudopus:** One Small Caveat (21 power + 25% guard), Request Changes (34 power + confidence reduction), Regression Suite (65% guard), Fresh Context (+44 HP).
- **Astralisk:** Works on My Machine (32 power), This Fixes It! (+1 confidence, 50% chance of 30-power attack), One More Patch (39 power, 7 recoil), Restart the IDE (+44 HP).

The CPU uses adversarial Monte Carlo tree search: it samples random damage and boost outcomes, plans replies for both sides, and scores simulated fights. It uses 192 simulations per decision. It never uses exhausted moves. The player still moves first, as in the original demo. Choose side during a battle to abandon it; no delayed enemy turn carries into the next fight.

## Files

`engine.js` contains the pure combat rules, `planner.js` supplies the search opponent, and `game.js` connects them to the page. The illustrated sprite atlas in `assets/creatures.png` was generated for this demo. This is an unofficial fan-made game with original AI-inspired creatures, not an official Pokémon product.

Balance experiments, assumptions, and reproducible Monte Carlo commands are in [BALANCE.md](BALANCE.md).

## Check the rules

With Node.js installed, run `node tests/engine.test.cjs` and `node tests/planner.test.cjs`. This covers shielding, failed confidence attacks, confidence reduction, capped healing, exhausted PP, recoil draws, post-knockout lockout, and 200 complete simulated battles. Node.js is only needed for this optional check, not for playing or hosting the game.

Pages setup reference: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
